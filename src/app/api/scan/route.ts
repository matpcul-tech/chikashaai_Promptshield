import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

interface TenantConfig { key: string; secret: string; terms?: string[]; demo?: boolean }

const PII = [
  { re: /\b\d{3}-\d{2}-\d{4}\b/g,                                                     label: "Social Security Number",     sev: "CRITICAL" },
  { re: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,                                         label: "Phone Number",               sev: "HIGH"     },
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,                        label: "Email Address",              sev: "HIGH"     },
  { re: /\b(?:DOB|date of birth|born on)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, label: "Date of Birth",              sev: "CRITICAL" },
  { re: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,                                    label: "Date",                       sev: "MEDIUM"   },
  { re: /\b(?:MRN|medical record|record number)[:\s#]+[\w\d-]+\b/gi,                    label: "Medical Record Number",      sev: "CRITICAL" },
  { re: /\b(?:CHK|IHS|HIN|CN)-[\d\w-]+\b/g,                                            label: "Tribal ID",                  sev: "CRITICAL" },
  { re: /\b(?:enrollment number|enrollment)[:\s]+[\d\w-]+\b/gi,                         label: "Enrollment Number",          sev: "CRITICAL" },
  { re: /\b(?:HIV|AIDS|cancer|diabetes|hepatitis|psychiatric|addiction|opioid)\b/gi,    label: "Sensitive Health Condition", sev: "CRITICAL" },
  { re: /\b(?:prescribed|dosage of|taking medication|insulin protocol)\b/gi,            label: "Medication Information",     sev: "HIGH"     },
  { re: /\b(?:diagnosis|diagnosed with|patient has|suffers from)\s+\w+/gi,             label: "Diagnosis",                  sev: "HIGH"     },
];

const HEALTH = [
  "insulin","cardiac","hypertension","a1c","cholesterol","diabetes",
  "blood pressure","prescription","treatment plan","diagnosis","symptoms","chronic",
];

function loadTenants(): Record<string, TenantConfig> | null {
  const raw = process.env.SHIELD_TENANTS;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, TenantConfig>;
  } catch {
    return null;
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acc === 0;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Preview shows only the trailing two characters; anything shorter is fully masked.
function redactPreview(match: string): string {
  if (match.length <= 2) return "•".repeat(match.length);
  return "•".repeat(match.length - 2) + match.slice(-2);
}

async function tenantToken(term: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(term.toLowerCase().trim()));
  const hash = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16);
  return `[SOVEREIGN_${hash}]`;
}

export async function POST(req: NextRequest) {
  try {
    const tenants = loadTenants();
    if (!tenants) {
      return NextResponse.json(
        { error: "Shield tenant registry is not configured", code: "NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const tenantId = req.headers.get("x-tenant-id");
    const authHeader = req.headers.get("authorization") ?? "";
    const providedKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const tenant = tenantId ? tenants[tenantId] : undefined;
    if (
      !tenantId ||
      !tenant ||
      !providedKey ||
      typeof tenant.key !== "string" ||
      !constantTimeEqual(providedKey, tenant.key)
    ) {
      return NextResponse.json(
        { error: "Invalid tenant credentials", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (typeof tenant.secret !== "string" || tenant.secret.length < 32) {
      return NextResponse.json(
        { error: "Tenant secret is missing or too short", code: "WEAK_SECRET" },
        { status: 503 }
      );
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const lower = text.toLowerCase();
    const findings: Array<{ label: string; sev: string; count: number; examples: string[] }> = [];
    let sanitized = text;
    let riskScore = 0;

    // PII scan
    for (const { re, label, sev } of PII) {
      const matches = Array.from(text.matchAll(re));
      if (matches.length > 0) {
        const examples = matches.slice(0, 2).map(m => redactPreview(m[0]));
        findings.push({ label, sev, count: matches.length, examples });
        sanitized = sanitized.replaceAll(re, `[${label.toUpperCase().replace(/ /g, "_")}_PROTECTED]`);
        riskScore += sev === "CRITICAL" ? 35 : sev === "HIGH" ? 20 : 10;
      }
    }

    // Cultural terms come from the tenant config. Longest first so compound
    // terms tokenize before their fragments. Runs on the PII-sanitized text.
    const terms = (tenant.terms ?? [])
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .sort((a, b) => b.length - a.length);

    const culturalFound: Array<{ term: string; token: string }> = [];
    for (const term of terms) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
      if (!re.test(sanitized)) continue;
      re.lastIndex = 0;
      const token = await tenantToken(term, tenant.secret);
      culturalFound.push({ term, token });
      sanitized = sanitized.replace(re, token);
    }

    // Health terms
    const healthFound = HEALTH.filter(term => lower.includes(term.toLowerCase()));

    riskScore = Math.min(riskScore, 100);
    const riskLevel = riskScore >= 60 ? "CRITICAL" : riskScore >= 35 ? "HIGH" : riskScore >= 15 ? "MEDIUM" : "LOW";
    const isClean = findings.length === 0 && culturalFound.length === 0;

    return NextResponse.json({
      sanitized,
      findings,
      culturalFound,
      healthFound,
      riskScore,
      riskLevel,
      isClean,
      totalFindings: findings.reduce((s, f) => s + f.count, 0),
      criticalCount: findings.filter(f => f.sev === "CRITICAL").length,
      tenantId,
      isDemo: tenant.demo === true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Scan error" }, { status: 500 });
  }
}
