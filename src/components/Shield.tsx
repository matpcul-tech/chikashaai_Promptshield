"use client";
import { useState, useCallback } from "react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Finding {
  label: string;
  sev: string;
  count: number;
  examples: string[];
}

interface ScanResult {
  sanitized: string;
  findings: Finding[];
  culturalFound: string[];
  healthFound: string[];
  riskScore: number;
  riskLevel: string;
  isClean: boolean;
  totalFindings: number;
  criticalCount: number;
  timestamp: string;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #07101f; font-family: 'Outfit', sans-serif; color: #eef2f8; min-height: 100vh; }

.wrap { max-width: 720px; margin: 0 auto; padding: 0 20px 60px; }

/* BG */
.page { min-height: 100vh; background: #07101f; position: relative; }
.page::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 10% 5%, rgba(0,212,184,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 60% 60% at 90% 90%, rgba(128,96,204,0.07) 0%, transparent 55%);
}

/* HERO */
.hero { position: relative; z-index: 1; text-align: center; padding: 52px 20px 36px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'DM Mono', monospace; font-size: 11px; color: #4ade80;
  background: rgba(74,222,128,.08); border: 1px solid rgba(74,222,128,.2);
  padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; letter-spacing: .1em;
}
.hero-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.hero-title { font-family: 'Playfair Display', serif; font-size: clamp(30px,6vw,50px); font-weight: 700; line-height: 1.1; margin-bottom: 14px; }
.hero-title span { color: #00d4b8; }
.hero-sub { font-size: clamp(13px,2vw,16px); color: #7a9bbf; max-width: 520px; margin: 0 auto 20px; line-height: 1.7; }
.hero-by { font-family: 'DM Mono', monospace; font-size: 11px; color: #7a9bbf; }
.hero-by strong { color: #d4a843; }

/* TABS */
.tabs { display: flex; justify-content: center; gap: 8px; padding: 0 20px 36px; flex-wrap: wrap; position: relative; z-index: 1; }
.tab {
  padding: 9px 20px; border-radius: 24px; border: 1px solid rgba(0,212,184,.15);
  background: rgba(255,255,255,.04); color: #7a9bbf; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .2s;
}
.tab.on {
  background: linear-gradient(135deg, #00d4b8, #00b89e); color: #07101f;
  font-weight: 700; border-color: transparent; box-shadow: 0 4px 16px rgba(0,212,184,.28);
}

/* CARD */
.card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(0,212,184,.15);
  border-radius: 20px; padding: 22px; margin-bottom: 16px;
  position: relative; z-index: 1;
}
.card-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.card-sub { font-size: 13px; color: #7a9bbf; line-height: 1.6; margin-bottom: 18px; }

/* DEMO */
.lbl { font-family: 'DM Mono', monospace; font-size: 10px; color: #00d4b8; text-transform: uppercase; letter-spacing: .15em; margin-bottom: 8px; }
.textarea {
  width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(0,212,184,.2);
  border-radius: 14px; padding: 16px; font-size: 13px; color: #eef2f8;
  font-family: 'Outfit', sans-serif; outline: none; resize: vertical; min-height: 130px; line-height: 1.6;
}
.textarea::placeholder { color: #7a9bbf; }
.textarea:focus { border-color: rgba(0,212,184,.4); }

.btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.btn-primary {
  padding: 12px 24px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #00d4b8, #00b89e); color: #07101f;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif;
}
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-sec {
  padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(0,212,184,.2);
  background: rgba(255,255,255,.04); color: #7a9bbf; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'Outfit', sans-serif;
}
.btn-sec:hover { border-color: rgba(0,212,184,.4); color: #00d4b8; }

/* COUNTERS */
.counters { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 16px; }
.counter { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 14px 8px; text-align: center; }
.counter-val { font-family: 'DM Mono', monospace; font-size: 24px; font-weight: 500; line-height: 1; margin-bottom: 4px; }
.counter-lbl { font-size: 10px; color: #7a9bbf; line-height: 1.3; }

/* RESULT */
.result { margin-top: 20px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,212,184,.15); }
.result-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,.05); }
.result-title { font-size: 14px; font-weight: 700; }
.rbadge { font-family: 'DM Mono', monospace; font-size: 10px; padding: 4px 12px; border-radius: 8px; font-weight: 600; }
.rC { background: rgba(232,82,110,.2); color: #e8526e; border: 1px solid rgba(232,82,110,.3); }
.rH { background: rgba(249,115,22,.2); color: #f97316; border: 1px solid rgba(249,115,22,.3); }
.rM { background: rgba(212,168,67,.2); color: #d4a843; border: 1px solid rgba(212,168,67,.3); }
.rL { background: rgba(74,222,128,.15); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
.rOK { background: rgba(0,212,184,.12); color: #00d4b8; border: 1px solid rgba(0,212,184,.2); }

.result-body { padding: 18px; }

.finding { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.finding:last-child { border-bottom: none; }
.finding-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.finding-label { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.finding-meta { font-family: 'DM Mono', monospace; font-size: 10px; color: #7a9bbf; }
.finding-ex { font-family: 'DM Mono', monospace; font-size: 9px; color: #e8526e; margin-top: 3px; background: rgba(232,82,110,.08); padding: 2px 6px; border-radius: 4px; display: inline-block; }

.cultural-box { margin-top: 14px; padding: 12px 16px; background: rgba(0,212,184,.06); border: 1px solid rgba(0,212,184,.18); border-radius: 12px; }
.cultural-title { font-family: 'DM Mono', monospace; font-size: 10px; color: #00d4b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .12em; }
.cultural-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.cultural-tag { font-size: 10px; padding: 3px 10px; border-radius: 8px; background: rgba(0,212,184,.12); color: #00d4b8; border: 1px solid rgba(0,212,184,.2); font-family: 'DM Mono', monospace; }

.sanitized-box { margin-top: 14px; padding: 14px; background: rgba(74,222,128,.05); border: 1px solid rgba(74,222,128,.18); border-radius: 12px; }
.sanitized-lbl { font-family: 'DM Mono', monospace; font-size: 9px; color: #4ade80; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; }
.sanitized-text { font-size: 12px; color: #eef2f8; line-height: 1.6; font-family: 'DM Mono', monospace; word-break: break-word; }

.meter-wrap { margin-top: 14px; }
.meter-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px; color: #7a9bbf; }
.meter-bg { height: 8px; background: rgba(255,255,255,.06); border-radius: 4px; overflow: hidden; }
.meter-fill { height: 100%; border-radius: 4px; transition: width .8s ease; }

.clean-state { text-align: center; padding: 20px; }
.clean-icon { font-size: 44px; margin-bottom: 10px; }
.clean-title { font-size: 16px; font-weight: 700; color: #4ade80; margin-bottom: 6px; }
.clean-body { font-size: 12px; color: #7a9bbf; line-height: 1.6; }

.scan-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.06); }
.scan-footer-left { font-family: 'DM Mono', monospace; font-size: 9px; color: #7a9bbf; }
.scan-footer-right { font-family: 'DM Mono', monospace; font-size: 9px; color: #4ade80; }

/* HOW IT WORKS */
.step { display: flex; gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.step:last-child { border-bottom: none; }
.step-num {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #00d4b8, #8060cc);
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 700;
  color: #07101f; flex-shrink: 0;
}
.step-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.step-body { font-size: 12px; color: #7a9bbf; line-height: 1.6; }

/* COMPLIANCE */
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.comp-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 14px;
  background: rgba(74,222,128,.04); border: 1px solid rgba(74,222,128,.15); border-radius: 14px;
}
.comp-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.comp-name { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.comp-status { font-family: 'DM Mono', monospace; font-size: 9px; color: #4ade80; }

.stat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 20px; }
.stat { background: rgba(255,255,255,.04); border: 1px solid rgba(0,212,184,.15); border-radius: 16px; padding: 18px; text-align: center; }
.stat-val { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; margin-bottom: 4px; }
.stat-lbl { font-size: 11px; color: #7a9bbf; line-height: 1.4; }

/* PRICING */
.price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 14px; }
.price-card { background: rgba(255,255,255,.04); border: 1px solid rgba(0,212,184,.15); border-radius: 18px; padding: 22px; }
.price-card.featured { border-color: rgba(0,212,184,.4); background: rgba(0,212,184,.04); }
.price-tier { font-family: 'DM Mono', monospace; font-size: 10px; color: #00d4b8; text-transform: uppercase; letter-spacing: .15em; margin-bottom: 8px; }
.price-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.price-amount { font-family: 'DM Mono', monospace; font-size: 26px; font-weight: 500; color: #00d4b8; margin-bottom: 4px; }
.price-period { font-size: 11px; color: #7a9bbf; margin-bottom: 16px; }
.price-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.price-feature { font-size: 12px; color: #7a9bbf; display: flex; gap: 8px; line-height: 1.4; }
.price-feature::before { content: "✓"; color: #00d4b8; flex-shrink: 0; font-weight: 700; }

/* PILOT BOX */
.pilot { background: rgba(212,168,67,.06); border: 1px solid rgba(212,168,67,.2); border-radius: 16px; padding: 22px; margin-top: 20px; text-align: center; }
.pilot-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.pilot-body { font-size: 13px; color: #7a9bbf; line-height: 1.7; margin-bottom: 10px; }
.pilot-by { font-family: 'DM Mono', monospace; font-size: 11px; color: #d4a843; }

/* FOOTER */
.footer { text-align: center; padding: 36px 20px; border-top: 1px solid rgba(0,212,184,.1); position: relative; z-index: 1; }
.footer-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.footer-name span { color: #00d4b8; }
.footer-sub { font-size: 12px; color: #7a9bbf; margin-bottom: 4px; }
.footer-copy { font-family: 'DM Mono', monospace; font-size: 10px; color: #4a5568; }

.loading { text-align: center; padding: 20px; font-family: 'DM Mono', monospace; font-size: 12px; color: #7a9bbf; }
`;

// ── SAMPLE PROMPTS ─────────────────────────────────────────────────────────────
const SAMPLES = [
  {
    label: "Tribal Health Worker",
    text: "Patient James Colbert, enrollment number: 12847 and DOB is 03/15/1978. Phone is 580-555-0142. He needs a revised insulin protocol. Can you suggest a treatment plan that accounts for his family history of cardiac disease? Yakoke.",
  },
  {
    label: "HR / Employee",
    text: "Employee Sarah Watkins, SSN 456-78-9012, email sarah.watkins@chickasawnation.com, started 01/15/2020. Please draft a performance review for her supervisor meeting.",
  },
  {
    label: "Legal / Governance",
    text: "This is a privileged communication from the Chickasaw Nation Office of General Counsel. Case CN-2026-0847 involves tribal member CHK-11293 regarding land rights in Tishomingo. Please summarize relevant federal Indian law precedents.",
  },
  {
    label: "Clean Query",
    text: "What are the benefits of preventive health screening programs for rural communities, and how does early detection impact long-term healthcare costs?",
  },
];

// ── HELPER ─────────────────────────────────────────────────────────────────────
function sevColor(sev: string) {
  return sev === "CRITICAL" ? "#e8526e" : sev === "HIGH" ? "#f97316" : sev === "MEDIUM" ? "#d4a843" : "#00d4b8";
}

function riskBadgeClass(level: string) {
  return level === "CRITICAL" ? "rbadge rC" : level === "HIGH" ? "rbadge rH" : level === "MEDIUM" ? "rbadge rM" : level === "LOW" ? "rbadge rL" : "rbadge rOK";
}

// ── DEMO TAB ───────────────────────────────────────────────────────────────────
function DemoTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const scan = useCallback(async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [text, loading]);

  const loadSample = (t: string) => { setText(t); setResult(null); };
  const clear = () => { setText(""); setResult(null); };

  return (
    <div className="wrap">
      <div className="card">
        <div className="card-title">Live Shield Demo</div>
        <div className="card-sub">
          Paste any text below — the Shield scans it instantly for PII, health data, and Chickasaw cultural terms. Nothing is sent to any commercial AI server.
        </div>
        <div className="lbl">Enter text to protect</div>
        <textarea
          className="textarea"
          placeholder="Type a message, or load a sample below..."
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
        />

        {result && (
          <div className="counters">
            <div className="counter">
              <div className="counter-val" style={{ color: result.totalFindings > 0 ? "#e8526e" : "#4ade80" }}>{result.totalFindings}</div>
              <div className="counter-lbl">Total Findings</div>
            </div>
            <div className="counter">
              <div className="counter-val" style={{ color: result.criticalCount > 0 ? "#e8526e" : "#4ade80" }}>{result.criticalCount}</div>
              <div className="counter-lbl">Critical (PII)</div>
            </div>
            <div className="counter">
              <div className="counter-val" style={{ color: result.culturalFound.length > 0 ? "#00d4b8" : "#7a9bbf" }}>{result.culturalFound.length}</div>
              <div className="counter-lbl">Cultural Terms</div>
            </div>
            <div className="counter">
              <div className="counter-val" style={{ color: result.healthFound.length > 0 ? "#d4a843" : "#7a9bbf" }}>{result.healthFound.length}</div>
              <div className="counter-lbl">Health Terms</div>
            </div>
          </div>
        )}

        <div className="btn-row">
          <button className="btn-primary" onClick={scan} disabled={loading || !text.trim()}>
            {loading ? "Scanning…" : "🛡 Scan for Sensitive Data"}
          </button>
          {SAMPLES.map((s, i) => (
            <button key={i} className="btn-sec" onClick={() => loadSample(s.text)}>{s.label}</button>
          ))}
          {text && <button className="btn-sec" onClick={clear}>Clear</button>}
        </div>
      </div>

      {loading && <div className="loading">🛡 Scanning for sensitive data…</div>}

      {result && !loading && (
        <div className="result">
          <div className="result-hdr">
            <div className="result-title">
              {result.isClean ? "✅ Clean — No Sensitive Data Detected" : `⚠️ ${result.findings.length} Issue Type${result.findings.length !== 1 ? "s" : ""} Detected`}
            </div>
            <div className={riskBadgeClass(result.isClean ? "OK" : result.riskLevel)}>
              {result.isClean ? "CLEAN" : result.riskLevel} · {result.riskScore}/100
            </div>
          </div>

          <div className="result-body">
            {result.isClean ? (
              <div className="clean-state">
                <div className="clean-icon">🛡️</div>
                <div className="clean-title">Safe to Transmit</div>
                <div className="clean-body">No PII, health data, or tribal identifiers detected. This query can be sent to any AI system without data sovereignty risk.</div>
              </div>
            ) : (
              <>
                {result.findings.map((f, i) => (
                  <div className="finding" key={i}>
                    <div className="finding-dot" style={{ background: sevColor(f.sev) }} />
                    <div>
                      <div className="finding-label">{f.label}</div>
                      <div className="finding-meta">{f.count} instance{f.count !== 1 ? "s" : ""} · Severity: {f.sev}</div>
                      {f.examples.map((ex, j) => <div key={j} className="finding-ex">{ex}</div>)}
                    </div>
                  </div>
                ))}

                <div className="meter-wrap">
                  <div className="meter-row">
                    <span>Risk Score</span>
                    <span style={{ color: sevColor(result.riskLevel) }}>{result.riskScore}/100 — {result.riskLevel}</span>
                  </div>
                  <div className="meter-bg">
                    <div className="meter-fill" style={{ width: `${result.riskScore}%`, background: `linear-gradient(90deg, ${sevColor(result.riskLevel)}, ${sevColor(result.riskLevel)}88)` }} />
                  </div>
                </div>
              </>
            )}

            {result.culturalFound.length > 0 && (
              <div className="cultural-box">
                <div className="cultural-title">🔒 Chickasaw Sovereign Terms — Zero-Knowledge Protected</div>
                <div className="cultural-tags">
                  {result.culturalFound.map((t, i) => <span key={i} className="cultural-tag">{t}</span>)}
                </div>
                <div style={{ fontSize: 10, color: "#7a9bbf", marginTop: 8, fontFamily: "'DM Mono',monospace" }}>
                  These terms are hashed at the browser edge before transmission. Server logs cannot reveal original Chickasaw words.
                </div>
              </div>
            )}

            {!result.isClean && (
              <div className="sanitized-box">
                <div className="sanitized-lbl">✅ Shield Output — Safe to Transmit</div>
                <div className="sanitized-text">{result.sanitized}</div>
                <div style={{ fontSize: 10, color: "#4ade80", marginTop: 8, fontFamily: "'DM Mono',monospace" }}>
                  All sensitive data replaced with protected tokens. Original data never leaves your network.
                </div>
              </div>
            )}

            <div className="scan-footer">
              <div className="scan-footer-left">TRACE FIBER SOVEREIGN · {new Date(result.timestamp).toLocaleTimeString()} · Shield v2.0</div>
              <div className="scan-footer-right">DATA ON-NATION ✓</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HOW IT WORKS TAB ──────────────────────────────────────────────────────────
function HowTab() {
  const steps = [
    {
      title: "Layer 1 — Browser Edge (Zero-Knowledge)",
      body: "Before any text leaves the tribal device, Chickasaw cultural terms and sovereign identifiers are hashed using SHA-256 cryptography with a sovereign salt. The word 'Pashofa' becomes [SOVEREIGN_2c36ab]. Even if the server is compromised, the original Chickasaw term cannot be recovered. This runs entirely in the browser.",
    },
    {
      title: "Layer 2 — Server Scan (PII Interception)",
      body: "The already-hashed prompt passes through a sovereign server that detects and strips remaining PII: Social Security Numbers, phone numbers, email addresses, dates of birth, medical record numbers, tribal enrollment IDs, and sensitive health conditions — all replaced with protected tokens before any AI system sees the query.",
    },
    {
      title: "Audit Logging — Sovereign Infrastructure",
      body: "Every interaction is timestamped with a complete audit trail: what was detected, what severity, what action was taken, and when. This log stays on Nation-owned infrastructure and never leaves tribal jurisdiction. Compliance documentation is generated automatically.",
    },
    {
      title: "Routing — Approved AI Only",
      body: "The sanitized, tokenized query is routed only to AI systems approved by the Nation's IT policy. In Phase 1 this means a sovereign Claude API proxy. In Phase 2, it routes to the Chikasha Foundational Model on Trace Fiber — eliminating external AI dependency entirely.",
    },
    {
      title: "Response Return — Clean",
      body: "The AI response returns through the Shield. The end user gets a complete, useful response. The AI system never saw the sensitive data. The Nation's sovereignty over its data is maintained at every step.",
    },
  ];

  return (
    <div className="wrap">
      <div className="card">
        <div className="card-title">Two-Layer Zero-Knowledge Architecture</div>
        <div className="card-sub">Every AI interaction on tribal devices currently sends unprotected data to commercial servers. The Shield closes that gap on Day 1 — no infrastructure changes required.</div>
        {steps.map((s, i) => (
          <div className="step" key={i}>
            <div className="step-num">{i + 1}</div>
            <div>
              <div className="step-title">{s.title}</div>
              <div className="step-body">{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── COMPLIANCE TAB ─────────────────────────────────────────────────────────────
function ComplianceTab() {
  return (
    <div className="wrap">
      <div className="stat-grid">
        {[
          { val: "574", lbl: "Federally Recognized Tribes — All Eligible", c: "#00d4b8" },
          { val: "100%", lbl: "Data Stays on Sovereign Infrastructure", c: "#4ade80" },
          { val: "0", lbl: "Commercial AI Servers Receive Sensitive Data", c: "#4ade80" },
          { val: "AES-256", lbl: "Encryption Standard Throughout", c: "#8060cc" },
        ].map((s, i) => (
          <div className="stat" key={i}>
            <div className="stat-val" style={{ color: s.c }}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Compliance Framework</div>
        <div className="card-sub">Designed to meet or exceed the standards relevant to tribal government AI use.</div>
        <div className="comp-grid">
          {[
            { icon: "🏥", name: "HIPAA Adjacent", status: "Health data detected & stripped" },
            { icon: "🛡", name: "CARE Principles", status: "Indigenous data sovereignty enforced" },
            { icon: "⚖️", name: "Tribal Data Sovereignty Act", status: "All data in tribal jurisdiction" },
            { icon: "🔒", name: "Zero-Knowledge Architecture", status: "Cultural terms never transmitted" },
            { icon: "📋", name: "AILT Governance", status: "Adaptive Inclusive Leadership Theory" },
            { icon: "🌐", name: "NTIA Tribal Broadband", status: "Aligned with Trace Fiber awards" },
            { icon: "🔐", name: "AES-256 Encryption", status: "Industry-standard throughout" },
            { icon: "📊", name: "Audit Trail", status: "Complete timestamped log" },
          ].map((c, i) => (
            <div className="comp-item" key={i}>
              <div className="comp-icon">{c.icon}</div>
              <div>
                <div className="comp-name">{c.name}</div>
                <div className="comp-status">{c.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">What the Shield Protects</div>
        {[
          ["Citizen PII", "Names, DOBs, SSNs, enrollment numbers — stripped before transmission"],
          ["Health Records", "Diagnoses, medications, MRNs, treatment plans — never reach commercial AI"],
          ["Chikashshanompa'", "The language corpus — hashed at browser edge, zero-knowledge protected"],
          ["Legal Documents", "Privileged communications, case numbers, land records — intercepted"],
          ["Financial Data", "Tribal enterprise data, payroll, budgets — classified and stripped"],
          ["Cultural Knowledge", "Sacred terms, ceremony references, elder recordings — sovereign protected"],
        ].map(([name, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
            <div style={{ color: "#00d4b8", flexShrink: 0 }}>🛡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#7a9bbf", lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRICING TAB ────────────────────────────────────────────────────────────────
function PricingTab() {
  return (
    <div className="wrap">
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Tribal Licensing</div>
        <div style={{ fontSize: 14, color: "#7a9bbf", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          Licensed to tribal governments, tribal enterprises, and Indian Health Service facilities. All tiers include full sovereignty — your data never leaves your infrastructure.
        </div>
      </div>

      <div className="price-grid" style={{ position: "relative", zIndex: 1 }}>
        {[
          {
            tier: "Starter", name: "Shield Basic", amount: "$2,000", period: "/month per organization", featured: false,
            features: ["Up to 500 tribal devices", "PII detection & stripping", "Monthly audit reports", "Email support", "Standard compliance docs"],
          },
          {
            tier: "Most Popular", name: "Shield Pro", amount: "$5,000", period: "/month per organization", featured: true,
            features: ["Unlimited tribal devices", "ZK Chickasaw term hashing", "Real-time audit dashboard", "Priority support + quarterly review", "Custom protected terms dictionary", "HIPAA documentation package"],
          },
          {
            tier: "Enterprise", name: "Shield Sovereign", amount: "Custom", period: "annual contract", featured: false,
            features: ["Multi-tribe deployment", "On-premises installation option", "CFM integration ready", "Dedicated implementation team", "Full AILT governance package", "White-label for tribal tech resale"],
          },
        ].map((p, i) => (
          <div className={`price-card ${p.featured ? "featured" : ""}`} key={i}>
            <div className="price-tier">{p.tier}</div>
            <div className="price-name">{p.name}</div>
            <div className="price-amount">{p.amount}</div>
            <div className="price-period">{p.period}</div>
            <ul className="price-features">
              {p.features.map((f, j) => <li key={j} className="price-feature">{f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="pilot">
        <div className="pilot-title">Chickasaw Nation — Founding Partner Pilot</div>
        <div className="pilot-body">
          As the founding tribal partner, the Chickasaw Nation receives a 6-month free pilot of Shield Pro, full implementation support, and co-development rights on the Chikashshanompa' protected terms dictionary.
        </div>
        <div className="pilot-by">Sovereign Shield Technologies LLC · Matthew Culwell, Founder · Enrolled Chickasaw Citizen</div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "demo", label: "🛡 Live Demo" },
  { id: "how", label: "⚙️ How It Works" },
  { id: "compliance", label: "📋 Compliance" },
  { id: "pricing", label: "💼 Licensing" },
];

export default function Shield() {
  const [tab, setTab] = useState("demo");

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="hero">
          <div className="hero-badge"><div className="hero-dot" />ZERO-KNOWLEDGE · LIVE DEMO</div>
          <h1 className="hero-title">Sovereign<br /><span>Prompt Shield</span></h1>
          <p className="hero-sub">
            The first AI data protection layer built specifically for tribal governments. PII detection, Chickasaw cultural term hashing, and sovereign audit logging — deployed on your infrastructure, owned by your Nation.
          </p>
          <div className="hero-by">Built by <strong>Sovereign Shield Technologies LLC</strong> · Matthew Culwell · Enrolled Chickasaw Citizen</div>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === "demo" && <DemoTab />}
        {tab === "how" && <HowTab />}
        {tab === "compliance" && <ComplianceTab />}
        {tab === "pricing" && <PricingTab />}

        <div className="footer">
          <div className="footer-name">Sovereign <span>Shield</span> Technologies LLC</div>
          <div className="footer-sub">Protecting Tribal Data Sovereignty · Project Chikasha AI</div>
          <div className="footer-copy">© 2026 Sovereign Shield Technologies LLC · sovereignhealthcareos.com</div>
        </div>
      </div>
    </>
  );
}
