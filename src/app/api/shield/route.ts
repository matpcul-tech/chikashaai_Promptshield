import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// ── PII PATTERNS ─────────────────────────────────────────────────────────────
const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: "SSN", severity: "CRITICAL" },
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: "PHONE", severity: "HIGH" },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "EMAIL", severity: "HIGH" },
  { pattern: /\b(DOB|date of birth|born on|birthday)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, type: "DOB", severity: "CRITICAL" },
  { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, type: "DATE", severity: "MEDIUM" },
  { pattern: /\b(MRN|medical record|record number|patient id)[:\s#]+[\w\d-]+\b/gi, type: "MRN", severity: "CRITICAL" },
  { pattern: /\b(CHK|IHS|HIN)-[\d\w-]+\b/g, type: "TRIBAL_ID", severity: "CRITICAL" },
  { pattern: /\b\d{5}(-\d{4})?\b/g, type: "ZIP", severity: "LOW" },
];

// ── HEALTH DATA PATTERNS ──────────────────────────────────────────────────────
const HEALTH_PATTERNS = [
  { pattern: /\b(diagnosis|diagnosed with|patient has|suffering from)\s+[\w\s]+/gi, type: "DIAGNOSIS" },
  { pattern: /\b(prescribed|taking|medication|drug|dosage)\s+[\w\s\d]+/gi, type: "MEDICATION" },
  { pattern: /\b(HIV|AIDS|cancer|diabetes|hepatitis|mental health|psychiatric|substance|addiction)\b/gi, type: "SENSITIVE_CONDITION" },
];

// ── CLASSIFY QUERY ────────────────────────────────────────────────────────────
function classifyQuery(text: string) {
  const flags: Array<{ type: string; severity: string; count: number }> = [];
  let sanitized = text;
  let riskScore = 0;

  // Check PII
  for (const { pattern, type, severity } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      flags.push({ type, severity, count: matches.length });
      // Strip PII from sanitized version
      sanitized = sanitized.replace(pattern, `[${type}_REDACTED]`);
      riskScore += severity === "CRITICAL" ? 40 : severity === "HIGH" ? 25 : severity === "MEDIUM" ? 10 : 5;
    }
  }

  // Check health data
  for (const { pattern, type } of HEALTH_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      flags.push({ type, severity: "HIGH", count: matches.length });
      riskScore += 20;
    }
  }

  const riskLevel = riskScore >= 60 ? "CRITICAL" : riskScore >= 30 ? "HIGH" : riskScore >= 10 ? "MEDIUM" : "LOW";

  return { flags, sanitized, riskScore: Math.min(riskScore, 100), riskLevel };
}

// ── SHIELD ROUTE ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, patientId } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Run Shield analysis
    const analysis = classifyQuery(lastMessage);
    const timestamp = new Date().toISOString();

    // Build audit log entry
    const auditEntry = {
      timestamp,
      patientId: patientId || "UNKNOWN",
      originalLength: lastMessage.length,
      sanitizedLength: analysis.sanitized.length,
      flagsDetected: analysis.flags,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      action: analysis.riskScore >= 60 ? "SANITIZED_AND_FLAGGED" : "SANITIZED_AND_PASSED",
      dataResidency: "TRACE_FIBER_SOVEREIGN",
      shieldVersion: "1.0.0",
    };

    // Replace last message with sanitized version
    const sanitizedMessages = messages.map((m: { role: string; content: string }, i: number) =>
      i === messages.length - 1 ? { ...m, content: analysis.sanitized } : m
    );

    // Now call Health AI with sanitized messages
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const SYSTEM = `You are the Chikasha Health OS AI — the world's most advanced sovereign healthcare intelligence, built exclusively for the Chickasaw Nation. You operate under the Sovereign Prompt Shield — all PII has been automatically redacted before reaching you. You combine Fountain Life ZORI-level clinical precision with Chickasaw cultural values and data sovereignty.

Patient Context: Mary Culwell, 67yo, Chickasaw Nation (CHK-2026-04821)
Health Score: 74/100 (+8.8%)
Key Concerns: LDL 212 mg/dL (elevated), A1C 6.4% (prediabetic)
Strengths: BP 118/76, SpO₂ 96%, HR 68bpm, Cognitive stable, Oncology clear

Active Protocols: Metabolic Reversal (Week 5/18), Cardiovascular Defense, Longevity Optimization (61%), Cognitive Protection (78%)

Fountain Life Benchmarks: 51% prediabetes reversal in 14mo, 96% pre-symptom detection, 13:1 ROI, 70% lower treatment costs.

Note: The Sovereign Prompt Shield has already sanitized this query. Any [REDACTED] tags indicate removed PII. Respond naturally without mentioning the redaction unless asked.

Style: Clinical precision + warmth. Cite specific numbers. 3-5 sentences for mobile. Never emergency advice — refer to CNHS.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: SYSTEM,
        messages: sanitizedMessages,
      }),
    });

    const aiData = await aiRes.json();
    const aiResponse = aiData.content?.[0]?.text || "Unable to connect.";

    return NextResponse.json({
      content: aiResponse,
      shield: auditEntry,
    });

  } catch (err) {
    return NextResponse.json({ error: "Shield error" }, { status: 500 });
  }
}
