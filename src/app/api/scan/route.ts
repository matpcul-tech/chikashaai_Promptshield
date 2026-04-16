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

    //     // Cultural terms - Now with masking
    const culturalFound: string[] = [];
    for (const term of CULTURAL) {
      const termRegex = new RegExp(`\\b${term}\\b`, "gi");
      if (termRegex.test(text)) {
        culturalFound.push(term);
        // This is what actually masks the text in the output
        sanitized = sanitized.replaceAll(termRegex, "[CULTURAL_TERM_PROTECTED]");
      }
    }

    // Health terms - Now with masking
    const healthFound: string[] = [];
    for (const term of HEALTH) {
      const healthRegex = new RegExp(`\\b${term}\\b`, "gi");
      if (healthRegex.test(text)) {
        healthFound.push(term);
        // This is what actually masks the text in the output
        sanitized = sanitized.replaceAll(healthRegex, "[HEALTH_DATA_PROTECTED]");
      }
    }
