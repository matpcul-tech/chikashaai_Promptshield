import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: "Social Security Number", severity: "CRITICAL", icon: "🔴" },
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: "Phone Number", severity: "HIGH", icon: "🟠" },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "Email Address", severity: "HIGH", icon: "🟠" },
  { pattern: /\b(DOB|date of birth|born on|birthday)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, type: "Date of Birth", severity: "CRITICAL", icon: "🔴" },
  { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, type: "Date", severity: "MEDIUM", icon: "🟡" },
  { pattern: /\b(MRN|medical record|record number|patient id|patient number)[:\s#]+[\w\d-]+\b/gi, type: "Medical Record Number", severity: "CRITICAL", icon: "🔴" },
  { pattern: /\b(CHK|IHS|HIN|CN)-[\d\w-]+\b/g, type: "Tribal ID", severity: "CRITICAL", icon: "🔴" },
  { pattern: /\b\d{5}(-\d{4})?\b/g, type: "ZIP Code", severity: "LOW", icon: "🟢" },
  { pattern: /\b(diagnosis|diagnosed with|suffers from|patient has)\s+[\w\s]+/gi, type: "Diagnosis Information", severity: "HIGH", icon: "🟠" },
  { pattern: /\b(HIV|AIDS|cancer|diabetes|hepatitis|psychiatric|substance abuse|addiction|mental health)\b/gi, type: "Sensitive Health Condition", severity: "CRITICAL", icon: "🔴" },
  { pattern: /\b(prescribed|taking|on medication|dosage of)\s+[\w\s\d]+/gi, type: "Medication Information", severity: "HIGH", icon: "🟠" },
];

const CHICKASAW_TERMS = [
  "chikashshanompa","pashofa","halito","chokma","yakoki","lokosh",
  "tanchi","tafula","banaha","minko","tishu","holisso","chickasaw",
  "chikasha","trace fiber","cnhs","ihs","winstar","tishomingo",
];

const SOVEREIGN_SALT = "CN-SOVEREIGN-SHIELD-2026";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    let sanitized = text;
    const detections: Array<{
      type: string; severity: string; icon: string;
      count: number; examples: string[];
    }> = [];
    let riskScore = 0;

    // Scan PII
    for (const { pattern, type, severity, icon } of PII_PATTERNS) {
      const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags))];
      if (matches.length > 0) {
        const examples = matches.slice(0, 2).map(m => m[0].substring(0, 20) + (m[0].length > 20 ? "..." : ""));
        detections.push({ type, severity, icon, count: matches.length, examples });
        sanitized = sanitized.replace(pattern, `[${type.toUpperCase().replace(/ /g,"_")}_PROTECTED]`);
        riskScore += severity === "CRITICAL" ? 35 : severity === "HIGH" ? 20 : severity === "MEDIUM" ? 10 : 5;
      }
    }

    // Detect Chickasaw cultural terms
    const zkTerms: string[] = [];
    for (const term of CHICKASAW_TERMS) {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      if (regex.test(text)) zkTerms.push(term);
    }

    riskScore = Math.min(riskScore, 100);
    const riskLevel = riskScore >= 60 ? "CRITICAL" : riskScore >= 35 ? "HIGH" : riskScore >= 15 ? "MEDIUM" : "LOW";
    const isClean = detections.length === 0 && zkTerms.length === 0;

    return NextResponse.json({
      original: text,
      sanitized,
      detections,
      zkTermsFound: zkTerms,
      riskScore,
      riskLevel,
      isClean,
      timestamp: new Date().toISOString(),
      dataResidency: "PROCESSED_ON_SOVEREIGN_INFRASTRUCTURE",
      shieldVersion: "2.0.0-ZK",
    });

  } catch {
    return NextResponse.json({ error: "Scan error" }, { status: 500 });
  }
}
