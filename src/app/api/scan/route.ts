import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

const ZK_SALT = "CN-SOVEREIGN-SHIELD-2026";

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

const CULTURAL = [
  "chikashshanompa","pashofa","halito","chokma","yakoke","yakoki","lokosh",
  "tanchi","tafula","banaha","minko","tishu","holisso","chickasaw","chikasha",
  "trace fiber","winstar","tishomingo","cnhs",
];

const HEALTH = [
  "insulin","cardiac","hypertension","a1c","cholesterol","diabetes",
  "blood pressure","prescription","treatment plan","diagnosis","symptoms","chronic",
];

// ZK hash using Web Crypto — available in Edge runtime
async function zkHash(term: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(term.toLowerCase().trim() + ZK_SALT);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 8);
}

export async function POST(req: NextRequest) {
  try {
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
        const examples = matches.slice(0, 2).map(m =>
          m[0].length > 18 ? m[0].substring(0, 18) + "…" : m[0]
        );
        findings.push({ label, sev, count: matches.length, examples });
        sanitized = sanitized.replaceAll(re, `[${label.toUpperCase().replace(/ /g, "_")}_PROTECTED]`);
        riskScore += sev === "CRITICAL" ? 35 : sev === "HIGH" ? 20 : 10;
      }
    }

    // Cultural terms — detect, then ZK hash each one
    const rawCultural = CULTURAL.filter(term => lower.includes(term.toLowerCase()));

    const culturalFound: Array<{ term: string; hash: string; token: string }> = [];
    for (const term of rawCultural) {
      const hash = await zkHash(term);
      const token = `[SOVEREIGN_${hash}]`;
      culturalFound.push({ term, hash, token });
      // Replace the term in sanitized output with its ZK token
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      sanitized = sanitized.replace(new RegExp(escaped, "gi"), token);
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
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Scan Error:", err);
    return NextResponse.json({ error: "Scan error" }, { status: 500 });
  }
}
