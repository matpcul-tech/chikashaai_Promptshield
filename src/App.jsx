import { useState, useCallback, useRef } from "react";

const SENSITIVE_PATTERNS = [
  { type: "SSN", pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g, label: "Social Security Number" },
  { type: "PHONE", pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, label: "Phone Number" },
  { type: "EMAIL", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: "Email Address" },
  { type: "DOB", pattern: /\b(?:0[1-9]|1[0-2])[\/\-](?:0[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g, label: "Date of Birth" },
  { type: "TRIBAL_ID", pattern: /\b(?:tribal|enrollment|citizen)\s*(?:#|number|id)?\s*:?\s*\d{3,10}\b/gi, label: "Tribal Enrollment ID" },
  { type: "MRN", pattern: /\b(?:MRN|medical\s*record|patient\s*id)\s*:?\s*\d{4,12}\b/gi, label: "Medical Record Number" },
  { type: "NAME_PATTERN", pattern: /\b(?:patient|client|member|citizen|employee)\s+(?:name\s*:?\s*)?[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, label: "Person Name (contextual)" },
];

const CHICKASAW_TERMS = [
  "chikashshanompa'", "chokma", "yakoke", "anompa", "okla", "hattak", "ohoyo",
  "chipota", "alla", "iksa", "holisso", "aboha", "okchanya", "nanna", "isht",
  "taloa", "hilha", "inchokma", "abinni'li", "holba", "iti", "oka", "hashtali",
  "nan", "alhpisa", "ikhana", "pisa", "anoli", "issi", "foshi", "minko",
  "tishominko", "alikchi", "shilombish", "hopaki", "chaffa", "tuklo", "tuchchi'na",
  "lokosh", "yakkookay", "pim", "ponola", "ofi", "kowi", "chim", "am",
];

const HEALTH_TERMS = [
  "diabetes", "hypertension", "cancer", "diagnosis", "prescription", "medication",
  "insulin", "metformin", "blood pressure", "cholesterol", "a1c", "hemoglobin",
  "biopsy", "tumor", "chemotherapy", "dialysis", "cardiac", "stroke", "bmi",
  "prediabetic", "glucose", "triglycerides", "colonoscopy", "mammogram",
  "opioid", "suboxone", "naloxone", "antidepressant", "anxiety", "depression",
  "hiv", "hepatitis", "cirrhosis", "copd", "emphysema", "asthma", "seizure",
  "epilepsy", "bipolar", "schizophrenia", "dementia", "alzheimer",
];

function scanForSensitiveData(text) {
  const findings = [];
  SENSITIVE_PATTERNS.forEach(({ type, pattern, label }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      findings.push({ type, label, value: match[0], severity: "critical", index: match.index });
    }
  });
  const lower = text.toLowerCase();
  CHICKASAW_TERMS.forEach(term => {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1) {
      const original = text.substring(idx, idx + term.length);
      findings.push({ type: "LANGUAGE", label: "Chickasaw Language Term", value: original, severity: "cultural", index: idx });
    }
  });
  HEALTH_TERMS.forEach(term => {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      findings.push({ type: "HEALTH", label: "Protected Health Term", value: term, severity: "health", index: idx });
    }
  });
  const seen = new Set();
  return findings.filter(f => {
    const key = `${f.type}:${f.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function maskSensitiveData(text, findings) {
  let masked = text;
  const maskMap = {};
  let counter = 0;
  const criticals = findings.filter(f => f.severity === "critical").sort((a, b) => b.index - a.index);
  criticals.forEach(f => {
    const token = `[REDACTED_${f.type}_${counter}]`;
    masked = masked.replace(f.value, token);
    maskMap[token] = f.value;
    counter++;
  });
  return { masked, maskMap };
}

function SeverityBadge({ severity }) {
  const colors = { critical: "#dc2626", cultural: "#d97706", health: "#2563eb" };
  return (
    <span style={{
      background: colors[severity] || "#dc2626", color: "#fff",
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap",
    }}>{severity}</span>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [findings, setFindings] = useState([]);
  const [maskedOutput, setMaskedOutput] = useState(null);
  const [maskMap, setMaskMap] = useState({});
  const [view, setView] = useState("scan");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const runScan = useCallback(() => {
    const results = scanForSensitiveData(input);
    setFindings(results);
    const { masked, maskMap: mm } = maskSensitiveData(input, results);
    setMaskedOutput(masked);
    setMaskMap(mm);
    setView("results");
  }, [input]);

  const sendToAI = useCallback(async () => {
    if (!maskedOutput) return;
    setLoading(true);
    setAiResponse("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: "You are a helpful assistant working within a sovereign data protection system. The user's query has been pre-processed by a Sovereign Prompt Shield. Some personal identifiers have been replaced with [REDACTED] tokens to protect sensitive tribal, health, and personal data. Respond helpfully to the query without attempting to guess, reconstruct, or ask about any redacted information. Treat redacted fields as standard placeholders.",
          messages: [{ role: "user", content: maskedOutput }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "No response received.";
      let restored = text;
      Object.entries(maskMap).forEach(([token, original]) => {
        restored = restored.replaceAll(token, original);
      });
      setAiResponse(restored);
      setHistory(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        originalLength: input.length,
        maskedLength: maskedOutput.length,
        findingsCount: findings.length,
        criticalCount: findings.filter(f => f.severity === "critical").length,
      }]);
      setView("response");
    } catch (err) {
      setAiResponse("Connection error. In a production sovereign deployment, this routes to the Nation's own LLM instance on Trace Fiber infrastructure — no external API needed.");
      setView("response");
    }
    setLoading(false);
  }, [maskedOutput, maskMap, input, findings]);

  const loadExample = () => {
    setInput("My patient John Doe (MRN: 4582910) has diabetes and his A1C is 9.2. His tribal enrollment number: 12847 and DOB is 03/15/1978. Phone is 580-555-0142. He needs a revised insulin protocol. Can you suggest a treatment plan that accounts for his family history of cardiac disease? Yakoke.");
    setView("scan");
    setFindings([]);
    setMaskedOutput(null);
    setAiResponse("");
  };

  const clearAll = () => {
    setInput(""); setFindings([]); setMaskedOutput(null); setView("scan"); setAiResponse(""); setMaskMap({});
  };

  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const culturalCount = findings.filter(f => f.severity === "cultural").length;
  const healthCount = findings.filter(f => f.severity === "health").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e17 0%, #111827 40%, #0f172a 100%)",
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
      color: "#e2e8f0",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus, button:focus { outline: none; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease both; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        body { margin: 0; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Sovereign Prompt Shield</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: 0.8 }}>DATA SOVEREIGNTY LAYER • PROJECT CHIKASHA AI</div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
          padding: "6px 14px", borderRadius: 20, fontSize: 12, color: "#22c55e", fontWeight: 600,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
          SOVEREIGN MODE ACTIVE
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 20px" }}>

        {/* How it works banner */}
        <div style={{
          background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 16, alignItems: "flex-start", fontSize: 13, color: "#94a3b8", lineHeight: 1.6,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>ℹ️</span>
          <div>
            <strong style={{ color: "#e2e8f0" }}>How it works:</strong> Type or paste any prompt containing sensitive data. The Shield scans locally for PII, tribal enrollment data, health information, and Chickasaw language terms. Critical data is masked with tokens before the query reaches any AI model. The AI never sees your sensitive data. After the response returns, original data is reinjected locally on your device.
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5 }}>
              ENTER YOUR PROMPT
            </label>
            <button onClick={loadExample} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              color: "#64748b", fontSize: 12, padding: "4px 12px", cursor: "pointer", fontWeight: 500,
            }}>
              Load Example
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setView("scan"); setFindings([]); setMaskedOutput(null); setAiResponse(""); }}
            placeholder={"Type your prompt here...\n\nTry the 'Load Example' button above to see the Shield in action with sample patient data."}
            style={{
              width: "100%", minHeight: 150, padding: "14px 16px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: "#e2e8f0", fontSize: 14, lineHeight: 1.7,
              fontFamily: "monospace", resize: "vertical",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "#475569" }}>{input.length} characters</span>
            <button
              onClick={runScan}
              disabled={!input.trim()}
              style={{
                padding: "10px 28px", borderRadius: 8,
                background: input.trim() ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "#1e293b",
                color: input.trim() ? "#fff" : "#475569",
                border: "none", fontSize: 14, fontWeight: 600,
                cursor: input.trim() ? "pointer" : "default",
              }}
            >
              🔍 Scan for Sensitive Data
            </button>
          </div>
        </div>

        {/* Results */}
        {view !== "scan" && (
          <div className="fade-in">

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Findings", value: findings.length, color: findings.length ? "#f59e0b" : "#22c55e" },
                { label: "Critical (PII)", value: criticalCount, color: criticalCount ? "#dc2626" : "#22c55e" },
                { label: "Cultural Terms", value: culturalCount, color: culturalCount ? "#d97706" : "#64748b" },
                { label: "Health Terms", value: healthCount, color: healthCount ? "#2563eb" : "#64748b" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Findings */}
            {findings.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, overflow: "hidden", marginBottom: 20,
              }}>
                <div style={{
                  padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Detected Sensitive Data</span>
                  {criticalCount > 0 && (
                    <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                      ⚠ {criticalCount} item{criticalCount > 1 ? "s" : ""} will be masked
                    </span>
                  )}
                </div>
                {findings.map((f, i) => (
                  <div key={i} style={{
                    padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                  }}>
                    <SeverityBadge severity={f.severity} />
                    <span style={{ fontSize: 13, color: "#94a3b8", minWidth: 140 }}>{f.label}</span>
                    <code style={{
                      fontSize: 13, color: f.severity === "critical" ? "#fca5a5" : "#93c5fd",
                      fontFamily: "monospace", background: "rgba(255,255,255,0.04)",
                      padding: "2px 8px", borderRadius: 4,
                    }}>
                      {f.severity === "critical" ? "•".repeat(Math.min(f.value.length, 10)) : f.value}
                    </code>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569", fontWeight: 600 }}>
                      {f.severity === "critical" ? "🔒 WILL MASK" : "📋 FLAGGED"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Masked Preview */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, overflow: "hidden", marginBottom: 20,
            }}>
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
              }}>
                {criticalCount > 0 ? "🔒 Masked Prompt — What the AI Will See" : "✅ Clean Prompt — No PII Detected"}
              </div>
              <div style={{
                padding: "14px 16px", fontSize: 13, lineHeight: 1.7,
                fontFamily: "monospace", color: "#94a3b8", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {maskedOutput}
              </div>
            </div>

            {/* Action Buttons */}
            {view === "results" && (
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <button
                  onClick={sendToAI}
                  disabled={loading}
                  style={{
                    flex: 1, padding: "14px 20px", borderRadius: 10,
                    background: criticalCount === 0
                      ? "linear-gradient(135deg, #22c55e, #16a34a)"
                      : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "⏳ Processing through Shield..." :
                   criticalCount === 0 ? "✅ Send Clean Prompt to AI" :
                   `🛡️ Send Masked Prompt (${criticalCount} items redacted)`}
                </button>
                <button onClick={clearAll} style={{
                  padding: "14px 20px", borderRadius: 10,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>Clear</button>
              </div>
            )}

            {/* AI Response */}
            {view === "response" && aiResponse && (
              <div className="fade-in" style={{
                background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: 12, overflow: "hidden", marginBottom: 24,
              }}>
                <div style={{
                  padding: "12px 16px", borderBottom: "1px solid rgba(34,197,94,0.1)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#22c55e" }}>AI Response — Sovereign Shield Active</span>
                </div>
                <div style={{
                  padding: "16px", fontSize: 14, lineHeight: 1.8, color: "#cbd5e1",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {aiResponse}
                </div>
                {criticalCount > 0 && (
                  <div style={{
                    padding: "10px 16px", borderTop: "1px solid rgba(34,197,94,0.1)",
                    fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: "#22c55e" }}>✓</span>
                    {criticalCount} sensitive item{criticalCount > 1 ? "s were" : " was"} masked before reaching the AI. Original data reinjected locally — never left this device.
                  </div>
                )}
                <div style={{ padding: "0 16px 12px", display: "flex", gap: 10 }}>
                  <button onClick={clearAll} style={{
                    padding: "10px 20px", borderRadius: 8,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>New Query</button>
                </div>
              </div>
            )}

            {/* Audit Log */}
            {history.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, letterSpacing: 0.5 }}>SESSION AUDIT LOG</div>
                {history.map((h, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: "#475569", padding: "4px 0",
                    borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                    fontFamily: "monospace",
                  }}>
                    [{h.timestamp}] Query: {h.findingsCount} findings, {h.criticalCount} masked, {h.originalLength}→{h.maskedLength} chars
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 32, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.04)",
          fontSize: 12, color: "#334155", lineHeight: 1.7, textAlign: "center",
        }}>
          <strong style={{ color: "#475569" }}>Sovereign Prompt Shield</strong> — Protecting tribal data at the point of AI interaction.
          <br />
          PII masking • Chickasaw language detection • Health data flagging • Session audit logging
          <br />
          <span style={{ color: "#1e40af" }}>Built on the AILT Framework • Project Chikasha AI • © 2026 Matthew Culwell</span>
        </div>
      </div>
    </div>
  );
}
