import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

const PII = [
  { re: /\b\d{3}-\d{2}-\d{4}\b/g,                                                    label: "Social Security Number",     sev: "CRITICAL" },
  { re: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,                                        label: "Phone Number",               sev: "HIGH"     },
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,                       label: "Email Address",              sev: "HIGH"     },
  { re: /\b(?:DOB|date of birth|born on)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, label: "Date of Birth",             sev: "CRITICAL" },
  { re: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,                                   label: "Date",                       sev: "MEDIUM"   },
  { re: /\b(?:MRN|medical record|record number)[:\s#]+[\w\d-]+\b/gi,                   label: "Medical Record Number",      sev: "CRITICAL" },
  { re: /\b(?:CHK|IHS|HIN|CN)-[\d\w-]+\b/g,                                           label: "Tribal ID",                  sev: "CRITICAL" },
  { re: /\b(?:enrollment number|enrollment)[:\s]+[\d\w-]+\b/gi,                        label: "Enrollment Number",          sev: "CRITICAL" },
  { re: /\b(?:HIV|AIDS|cancer|diabetes|hepatitis|psychiatric|addiction|opioid)\b/gi,   label: "Sensitive Health Condition", sev: "CRITICAL" },
  { re: /\b(?:prescribed|dosage of|taking medication|insulin protocol)\b/gi,           label: "Medication Information",     sev: "HIGH"     },
  { re: /\b(?:diagnosis|diagnosed with|patient has|suffers from)\s+\w+/gi,            label: "Diagnosis",                  sev: "HIGH"     },
];

const CULTURAL = [
  "chikashshanompa","pashofa","halito","chokma","yakoke","yakoki","lokosh",
  "tanchi","tafula","banaha","minko","tishu","holisso","chickasaw","chikasha",
  "cnhs","trace fiber","winstar","tishomingo","ihs","aba",
];

const HEALTH = [
  "insulin","cardiac","hypertension","a1c","cholesterol","diabetes","blood pressure",
  "prescription","treatment plan","diagnosis","symptoms","chronic",
];

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const findings: Array<{ label: string; sev: string; count: number; examples: string[] }> = [];
    let sanitized = text;
    let riskScore = 0;

    // PII scan - Using the regex directly instead of re-constructing it
    for (const { re, label, sev } of PII) {
      // Use Array.from for better compatibility with the build fix we did earlier
      const matches = Array.from(text.matchAll(re)); 
      
      if (matches.length > 0) {
        const examples = matches.slice(0, 2).map(m => 
          m[0].length > 18 ? m[0].substring(0, 18) + "…" : m[0]
        );
        
        findings.push({ label, sev, count: matches.length, examples });
        
        // Use the global regex directly in the replace
        sanitized = sanitized.replaceAll(re, `[${label.toUpperCase().replace(/ /g, "_")}_PROTECTED]`);
        
        riskScore += sev === "CRITICAL" ? 35 : sev === "HIGH" ? 20 : 10;
      }
    }

    // Cultural terms - Optimized with case-insensitive check
    const culturalFound = CULTURAL.filter(term => 
      new RegExp(`\\b${term}\\b`, "i").test(text)
    );

    // Health terms
    const healthFound = HEALTH.filter(term => 
      new RegExp(`\\b${term}\\b`, "i").test(text)
    );

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

