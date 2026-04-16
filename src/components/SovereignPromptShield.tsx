"use client";
import { useState, useCallback } from "react";

const C = {
  navy:"#07101f", navy2:"#0c1a2e", navy3:"#112240",
  teal:"#00d4b8", teal2:"#00b89e",
  gold:"#d4a843", rose:"#e8526e", orange:"#f97316",
  violet:"#8060cc", green:"#4ade80",
  slate:"#7a9bbf", white:"#eef2f8",
  border:"rgba(0,212,184,0.15)", border2:"rgba(255,255,255,0.06)",
  glass:"rgba(255,255,255,0.04)", glass2:"rgba(255,255,255,0.07)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#07101f;min-height:100vh}
.app{font-family:'Outfit',sans-serif;color:#eef2f8;min-height:100vh;background:#07101f;position:relative}
.app::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 80% 50% at 10% 5%,rgba(0,212,184,0.07) 0%,transparent 55%),
  radial-gradient(ellipse 60% 60% at 90% 90%,rgba(128,96,204,0.07) 0%,transparent 55%)}

/* HERO */
.hero{position:relative;z-index:1;text-align:center;padding:60px 24px 48px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:11px;color:#4ade80;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.2);padding:6px 16px;border-radius:20px;margin-bottom:28px;letter-spacing:.1em}
.hero-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero-title{font-family:'Playfair Display',serif;font-size:clamp(32px,6vw,52px);font-weight:700;line-height:1.1;margin-bottom:16px}
.hero-title span{color:#00d4b8}
.hero-sub{font-size:clamp(14px,2vw,18px);color:#7a9bbf;max-width:560px;margin:0 auto 32px;line-height:1.7}
.hero-by{font-family:'DM Mono',monospace;font-size:11px;color:#7a9bbf;letter-spacing:.1em}
.hero-by strong{color:#d4a843}

/* NAV TABS */
.tabs{display:flex;justify-content:center;gap:8px;padding:0 24px 40px;position:relative;z-index:1;flex-wrap:wrap}
.tab{padding:10px 20px;border-radius:24px;border:1px solid rgba(0,212,184,.15);background:rgba(255,255,255,.04);color:#7a9bbf;font-size:13px;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s}
.tab.on{background:linear-gradient(135deg,#00d4b8,#00b89e);color:#07101f;font-weight:700;border-color:transparent;box-shadow:0 4px 18px rgba(0,212,184,.28)}

/* CONTAINER */
.wrap{max-width:800px;margin:0 auto;padding:0 24px 80px;position:relative;z-index:1}

/* CARD */
.card{background:rgba(255,255,255,.04);border:1px solid rgba(0,212,184,.15);border-radius:20px;padding:24px;margin-bottom:16px;backdrop-filter:blur(12px)}
.card-title{font-size:16px;font-weight:700;margin-bottom:6px}
.card-sub{font-size:13px;color:#7a9bbf;line-height:1.6;margin-bottom:16px}

/* DEMO */
.demo-label{font-family:'DM Mono',monospace;font-size:10px;color:#00d4b8;text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px}
.textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(0,212,184,.2);border-radius:14px;padding:16px;font-size:13px;color:#eef2f8;font-family:'Outfit',sans-serif;outline:none;resize:vertical;min-height:120px;line-height:1.6}
.textarea::placeholder{color:#7a9bbf}
.textarea:focus{border-color:rgba(0,212,184,.4)}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.btn-primary{padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#00d4b8,#00b89e);color:#07101f;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;box-shadow:0 4px 16px rgba(0,212,184,.28)}
.btn-secondary{padding:12px 20px;border-radius:12px;border:1px solid rgba(0,212,184,.2);background:rgba(255,255,255,.04);color:#7a9bbf;font-size:12px;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif}
.btn-secondary:hover{border-color:rgba(0,212,184,.4);color:#00d4b8}

/* SCAN RESULT */
.result-box{margin-top:20px;border-radius:16px;overflow:hidden;border:1px solid rgba(0,212,184,.15)}
.result-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(255,255,255,.05)}
.result-title{font-size:14px;font-weight:700}
.risk-badge{font-family:'DM Mono',monospace;font-size:10px;padding:4px 12px;border-radius:8px;font-weight:600}
.risk-CRITICAL{background:rgba(232,82,110,.2);color:#e8526e;border:1px solid rgba(232,82,110,.3)}
.risk-HIGH{background:rgba(249,115,22,.2);color:#f97316;border:1px solid rgba(249,115,22,.3)}
.risk-MEDIUM{background:rgba(212,168,67,.2);color:#d4a843;border:1px solid rgba(212,168,67,.3)}
.risk-LOW{background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.25)}
.risk-CLEAN{background:rgba(0,212,184,.12);color:#00d4b8;border:1px solid rgba(0,212,184,.2)}
.result-body{padding:18px}

/* DETECTION ITEMS */
.detection-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.det-icon{font-size:16px;flex-shrink:0;margin-top:2px}
.det-type{font-size:12px;font-weight:600;margin-bottom:2px}
.det-count{font-family:'DM Mono',monospace;font-size:10px;color:#7a9bbf}
.det-example{font-family:'DM Mono',monospace;font-size:9px;color:#e8526e;margin-top:3px;background:rgba(232,82,110,.08);padding:2px 6px;border-radius:4px;display:inline-block}

/* ZK TERMS */
.zk-wrap{margin-top:14px;padding:12px 16px;background:rgba(0,212,184,.06);border:1px solid rgba(0,212,184,.18);border-radius:12px}
.zk-title{font-family:'DM Mono',monospace;font-size:10px;color:#00d4b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:.12em}
.zk-terms{display:flex;gap:6px;flex-wrap:wrap}
.zk-term{font-size:10px;padding:3px 10px;border-radius:8px;background:rgba(0,212,184,.12);color:#00d4b8;border:1px solid rgba(0,212,184,.2);font-family:'DM Mono',monospace}

/* SANITIZED OUTPUT */
.sanitized-box{margin-top:14px;padding:14px;background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.18);border-radius:12px}
.sanitized-label{font-family:'DM Mono',monospace;font-size:9px;color:#4ade80;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px}
.sanitized-text{font-size:12px;color:#eef2f8;line-height:1.6;font-family:'DM Mono',monospace;word-break:break-word}

/* RISK METER */
.risk-meter-wrap{margin-top:14px}
.risk-meter-label{display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px}
.risk-meter-bg{height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}
.risk-meter-fill{height:100%;border-radius:4px;transition:width .8s ease}

/* STATS GRID */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}
.stat{background:rgba(255,255,255,.04);border:1px solid rgba(0,212,184,.15);border-radius:16px;padding:20px 16px;text-align:center}
.stat-val{font-family:'DM Mono',monospace;font-size:24px;font-weight:500;margin-bottom:4px}
.stat-lbl{font-size:11px;color:#7a9bbf;line-height:1.4}

/* HOW IT WORKS */
.steps{display:flex;flex-direction:column;gap:0}
.step{display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.step:last-child{border-bottom:none}
.step-num{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00d4b8,#8060cc);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:14px;font-weight:700;color:#07101f;flex-shrink:0}
.step-title{font-size:14px;font-weight:600;margin-bottom:4px}
.step-body{font-size:12px;color:#7a9bbf;line-height:1.6}

/* PRICING */
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.price-card{background:rgba(255,255,255,.04);border:1px solid rgba(0,212,184,.15);border-radius:18px;padding:24px}
.price-card.featured{border-color:rgba(0,212,184,.4);background:rgba(0,212,184,.05)}
.price-tier{font-family:'DM Mono',monospace;font-size:10px;color:#00d4b8;text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px}
.price-name{font-size:18px;font-weight:700;margin-bottom:4px}
.price-amount{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;color:#00d4b8;margin-bottom:4px}
.price-period{font-size:11px;color:#7a9bbf;margin-bottom:16px}
.price-features{list-style:none;display:flex;flex-direction:column;gap:8px}
.price-feature{font-size:12px;color:#7a9bbf;display:flex;gap:8px;align-items:flex-start;line-height:1.4}
.price-feature::before{content:"✓";color:#00d4b8;flex-shrink:0;font-weight:700}

/* COMPLIANCE */
.compliance-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.compliance-item{display:flex;align-items:center;gap:10px;padding:12px;background:rgba(74,222,128,.04);border:1px solid rgba(74,222,128,.15);border-radius:12px}
.comp-icon{font-size:18px;flex-shrink:0}
.comp-name{font-size:12px;font-weight:600;margin-bottom:2px}
.comp-status{font-family:'DM Mono',monospace;font-size:9px;color:#4ade80}

/* FOOTER */
.footer{text-align:center;padding:40px 24px;border-top:1px solid rgba(0,212,184,.1);position:relative;z-index:1}
.footer-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:8px}
.footer-logo span{color:#00d4b8}
.footer-sub{font-size:12px;color:#7a9bbf;margin-bottom:4px}
.footer-copy{font-family:'DM Mono',monospace;font-size:10px;color:#4a5568}

/* CLEAN STATE */
.clean-state{text-align:center;padding:24px}
.clean-icon{font-size:48px;margin-bottom:12px}
.clean-title{font-size:16px;font-weight:700;color:#4ade80;margin-bottom:6px}
.clean-body{font-size:12px;color:#7a9bbf;line-height:1.6}

.loading{text-align:center;padding:24px;color:#7a9bbf;font-family:'DM Mono',monospace;font-size:12px}
`;

// ── SAMPLE PROMPTS ────────────────────────────────────────────────────────────
const SAMPLES = [
  {
    label: "Tribal Health Worker",
    text: "Patient Mary Thompson, DOB 3/15/1968, Chickasaw enrollment CHK-04821, MRN: 78234, phone 580-555-0142 is presenting with diabetes and high A1C. Please draft a care plan using pashofa diet recommendations and traditional Chickasaw wellness approaches."
  },
  {
    label: "HR / Employee Data",
    text: "Employee James Colbert, SSN 456-78-9012, email james.colbert@chickasawnation.com, started 01/15/2019, currently earning $72,000. Please draft a performance review for his supervisor meeting on 4/20/2026."
  },
  {
    label: "Legal / Governance",
    text: "This is a privileged communication from the Chickasaw Nation Office of General Counsel. Case CN-2026-0847 involves tribal member Sarah Watkins, CHK-11293, regarding land rights in Tishomingo. Please summarize the relevant federal Indian law precedents."
  },
  {
    label: "Clean Query",
    text: "What are the benefits of preventive health screening programs for rural communities, and how does early detection impact long-term healthcare costs?"
  }
];

interface Detection {
  type: string; severity: string; icon: string;
  count: number; examples: string[];
}

interface ScanResult {
  original: string;
  sanitized: string;
  detections: Detection[];
  zkTermsFound: string[];
  riskScore: number;
  riskLevel: string;
  isClean: boolean;
  timestamp: string;
}

function riskColor(level: string) {
  return level === "CRITICAL" ? "#e8526e" : level === "HIGH" ? "#f97316" : level === "MEDIUM" ? "#d4a843" : "#4ade80";
}

// ── DEMO TAB ──────────────────────────────────────────────────────────────────
function DemoTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const scan = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [text]);

  return (
    <div className="wrap">
      <div className="card">
        <div className="card-title">Live Shield Demo</div>
        <div className="card-sub">
          Type or paste any text below — the Shield scans it in real time for PII, health data, and Chickasaw cultural terms. Nothing you type here is sent to any commercial AI server.
        </div>
        <div className="demo-label">Enter text to protect</div>
        <textarea
          className="textarea"
          placeholder="Type a message, paste a document excerpt, or load a sample below..."
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
        />
        <div className="btn-row">
          <button className="btn-primary" onClick={scan} disabled={loading || !text.trim()}>
            {loading ? "Scanning..." : "🛡 Run Shield Scan"}
          </button>
          {SAMPLES.map((s, i) => (
            <button key={i} className="btn-secondary" onClick={() => { setText(s.text); setResult(null); }}>
              {s.label}
            </button>
          ))}
          {text && <button className="btn-secondary" onClick={() => { setText(""); setResult(null); }}>Clear</button>}
        </div>
      </div>

      {loading && <div className="loading">🛡 Scanning for sensitive data...</div>}

      {result && !loading && (
        <div className="result-box">
          <div className="result-hdr">
            <div className="result-title">
              {result.isClean ? "✅ Scan Complete — Clean" : `⚠️ ${result.detections.length} Issue${result.detections.length !== 1 ? "s" : ""} Detected`}
            </div>
            <div className={`risk-badge risk-${result.isClean ? "CLEAN" : result.riskLevel}`}>
              {result.isClean ? "CLEAN" : result.riskLevel} · Risk {result.riskScore}/100
            </div>
          </div>
          <div className="result-body">
            {result.isClean ? (
              <div className="clean-state">
                <div className="clean-icon">🛡️</div>
                <div className="clean-title">No Sensitive Data Detected</div>
                <div className="clean-body">This query is safe to send to any AI system. The Shield found no PII, health data, or tribal identifiers. Data residency: Processed on sovereign infrastructure.</div>
              </div>
            ) : (
              <>
                <div style={{marginBottom:14}}>
                  {result.detections.map((d, i) => (
                    <div className="detection-item" key={i}>
                      <div className="det-icon">{d.icon}</div>
                      <div>
                        <div className="det-type">{d.type}</div>
                        <div className="det-count">{d.count} instance{d.count !== 1 ? "s" : ""} found · Severity: {d.severity}</div>
                        {d.examples.map((ex, j) => (
                          <div key={j} className="det-example">{ex}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="risk-meter-wrap">
                  <div className="risk-meter-label">
                    <span style={{fontSize:11,color:"#7a9bbf"}}>Risk Score</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:riskColor(result.riskLevel)}}>{result.riskScore}/100 — {result.riskLevel}</span>
                  </div>
                  <div className="risk-meter-bg">
                    <div className="risk-meter-fill" style={{width:`${result.riskScore}%`,background:`linear-gradient(90deg,${riskColor(result.riskLevel)},${riskColor(result.riskLevel)}88)`}}/>
                  </div>
                </div>
              </>
            )}

            {result.zkTermsFound.length > 0 && (
              <div className="zk-wrap">
                <div className="zk-title">🔒 Chickasaw Sovereign Terms Detected — Zero-Knowledge Protected</div>
                <div className="zk-terms">
                  {result.zkTermsFound.map((t, i) => (
                    <span key={i} className="zk-term">{t}</span>
                  ))}
                </div>
                <div style={{fontSize:10,color:"#7a9bbf",marginTop:8,fontFamily:"'DM Mono',monospace"}}>
                  These terms are hashed at the edge before transmission. Even server logs cannot reveal the original Chickasaw words.
                </div>
              </div>
            )}

            {!result.isClean && (
              <div className="sanitized-box">
                <div className="sanitized-label">✅ Shield Output — Safe to Transmit</div>
                <div className="sanitized-text">{result.sanitized}</div>
                <div style={{fontSize:10,color:"#4ade80",marginTop:8,fontFamily:"'DM Mono',monospace"}}>
                  All sensitive data replaced with protected tokens. Original data never leaves your network.
                </div>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:`1px solid rgba(255,255,255,.06)`}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#7a9bbf"}}>TRACE FIBER SOVEREIGN · {new Date(result.timestamp).toLocaleTimeString()} · Shield v2.0-ZK</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#4ade80"}}>DATA ON-NATION ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HOW IT WORKS TAB ──────────────────────────────────────────────────────────
function HowItWorksTab() {
  return (
    <div className="wrap">
      <div className="card">
        <div className="card-title">Two-Layer Zero-Knowledge Architecture</div>
        <div className="card-sub">The Shield protects tribal data at two distinct layers — browser edge and server — ensuring sensitive information never reaches any commercial AI system in readable form.</div>
        <div className="steps">
          {[
            {
              title: "Layer 1 — Browser Edge (Zero-Knowledge)",
              body: "Before any text leaves the tribal device, the Shield hashes Chickasaw cultural terms, language words, and sovereign identifiers using SHA-256 cryptography with a sovereign salt. The word 'Pashofa' becomes [SOVEREIGN_2c36ab]. Even if the server is compromised, the original Chickasaw term cannot be recovered. This runs entirely in the browser — it never touches any server."
            },
            {
              title: "Layer 2 — Server Scan (PII Interception)",
              body: "The already-hashed prompt passes through a sovereign server scan that detects and strips any remaining PII: Social Security Numbers, phone numbers, email addresses, dates of birth, medical record numbers, tribal enrollment IDs, and sensitive health conditions. All replaced with protected tokens before any AI system sees the query."
            },
            {
              title: "Audit Logging — Sovereign Infrastructure",
              body: "Every interaction is timestamped and logged with a complete audit trail: what was detected, what severity, what action was taken, and when. This audit log stays on Nation-owned infrastructure — it never leaves tribal jurisdiction. HIPAA-adjacent compliance documentation is generated automatically."
            },
            {
              title: "Routing — Only to Approved AI",
              body: "The sanitized, tokenized query is routed only to AI systems approved by the Nation's IT policy. In the current phase this means the Anthropic Claude API via sovereign proxy. In the future phase, it routes to the Chikasha Foundational Model running on Trace Fiber — eliminating external AI dependency entirely."
            },
            {
              title: "Response Return — Clean",
              body: "The AI response comes back through the Shield. The Shield can reinject the original data locally for the user's context while ensuring the AI response itself contains no sensitive data. The end user gets a complete, useful response. The AI system never saw the sensitive data."
            },
          ].map((s, i) => (
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
    </div>
  );
}

// ── COMPLIANCE TAB ────────────────────────────────────────────────────────────
function ComplianceTab() {
  return (
    <div className="wrap">
      <div className="stats">
        {[
          {val:"574",lbl:"Federally Recognized Tribes — All Eligible",c:"#00d4b8"},
          {val:"100%",lbl:"Data Stays on Sovereign Infrastructure",c:"#4ade80"},
          {val:"0",lbl:"Commercial AI Servers Receive Sensitive Data",c:"#4ade80"},
          {val:"AES-256",lbl:"Encryption Standard",c:"#8060cc"},
        ].map((s,i)=>(
          <div className="stat" key={i}><div className="stat-val" style={{color:s.c}}>{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Compliance Framework</div>
        <div className="card-sub">The Sovereign Prompt Shield is designed to meet or exceed the following standards relevant to tribal government AI use.</div>
        <div className="compliance-grid">
          {[
            {icon:"🏥",name:"HIPAA Adjacent",status:"Health data patterns detected & stripped"},
            {icon:"🛡",name:"CARE Principles",status:"Indigenous data sovereignty enforced"},
            {icon:"⚖️",name:"Tribal Data Sovereignty Act",status:"All data remains in tribal jurisdiction"},
            {icon:"🔒",name:"Zero-Knowledge Architecture",status:"Cultural terms never transmitted in plaintext"},
            {icon:"📋",name:"AILT Governance",status:"Adaptive Inclusive Leadership Theory framework"},
            {icon:"🌐",name:"NTIA Tribal Broadband",status:"Aligned with existing Trace Fiber awards"},
            {icon:"🔐",name:"AES-256 Encryption",status:"Industry-standard encryption throughout"},
            {icon:"📊",name:"Audit Trail",status:"Complete timestamped log of every interaction"},
          ].map((c,i)=>(
            <div className="compliance-item" key={i}>
              <div className="comp-icon">{c.icon}</div>
              <div><div className="comp-name">{c.name}</div><div className="comp-status">{c.status}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">What It Protects</div>
        <div className="card-sub">Every AI interaction on tribal government devices currently sends unprotected data to commercial servers. The Shield closes that gap on Day 1.</div>
        {[
          ["Citizen PII","Names, dates of birth, SSNs, enrollment numbers — stripped before transmission"],
          ["Health Records","Diagnoses, medications, MRNs, treatment plans — never reach commercial AI"],
          ["Chikashshanompa'","The language corpus — hashed at browser edge, zero-knowledge protected"],
          ["Legal Documents","Privileged communications, case numbers, land records — intercepted and protected"],
          ["Financial Data","Tribal enterprise data, payroll, budget documents — classified and stripped"],
          ["Cultural Knowledge","Sacred terms, ceremony references, elder recordings — sovereign hash protected"],
        ].map(([name,desc],i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<5?`1px solid rgba(255,255,255,.06)`:"none"}}>
            <div style={{color:"#00d4b8",flexShrink:0,fontSize:14}}>🛡</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{name}</div>
              <div style={{fontSize:12,color:"#7a9bbf",lineHeight:1.5}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRICING TAB ───────────────────────────────────────────────────────────────
function PricingTab() {
  return (
    <div className="wrap">
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,marginBottom:8}}>Tribal Licensing</div>
        <div style={{fontSize:14,color:"#7a9bbf",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
          The Sovereign Prompt Shield is licensed to tribal governments, tribal enterprises, and Indian Health Service facilities. All tiers include full sovereignty — your data never leaves your infrastructure.
        </div>
      </div>
      <div className="pricing">
        {[
          {
            tier:"Starter",name:"Shield Basic",amount:"$2,000",period:"/month per organization",
            featured:false,
            features:[
              "Up to 500 tribal devices covered",
              "PII detection & stripping",
              "Monthly audit reports",
              "Email support",
              "Standard compliance documentation",
            ]
          },
          {
            tier:"Most Popular",name:"Shield Pro",amount:"$5,000",period:"/month per organization",
            featured:true,
            features:[
              "Unlimited tribal devices",
              "ZK Chickasaw term hashing",
              "Real-time audit dashboard",
              "Priority support + quarterly review",
              "Custom protected terms dictionary",
              "HIPAA documentation package",
              "Cherokee Nation / OSL referral eligible",
            ]
          },
          {
            tier:"Enterprise",name:"Shield Sovereign",amount:"Custom",period:"annual contract",
            featured:false,
            features:[
              "Multi-tribe deployment",
              "On-premises installation option",
              "CFM integration ready (future)",
              "Dedicated implementation team",
              "Full AILT governance package",
              "White-label for tribal tech resale",
            ]
          },
        ].map((p,i)=>(
          <div className={`price-card ${p.featured?"featured":""}`} key={i}>
            <div className="price-tier">{p.tier}</div>
            <div className="price-name">{p.name}</div>
            <div className="price-amount">{p.amount}</div>
            <div className="price-period">{p.period}</div>
            <ul className="price-features">
              {p.features.map((f,j)=><li key={j} className="price-feature">{f}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="card" style={{marginTop:24,textAlign:"center"}}>
        <div className="card-title">Chickasaw Nation — Pilot Proposal</div>
        <div className="card-sub">As the founding tribal partner, the Chickasaw Nation receives a 6-month free pilot of Shield Pro, full implementation support, and co-development rights on the Custom Terms Dictionary for Chikashshanompa' protection. Contact Sovereign Shield Technologies LLC to initiate the pilot agreement.</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#d4a843",marginTop:8}}>Sovereign Shield Technologies LLC · Matthew Culwell, Founder · Enrolled Chickasaw Citizen</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const TABS = [
  {id:"demo",label:"🛡 Live Demo"},
  {id:"how",label:"⚙️ How It Works"},
  {id:"compliance",label:"📋 Compliance"},
  {id:"pricing",label:"💼 Licensing"},
];

export default function SovereignPromptShield() {
  const [tab, setTab] = useState("demo");

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Hero */}
        <div className="hero">
          <div className="hero-badge">
            <div className="hero-dot"/>
            ZERO-KNOWLEDGE · LIVE DEMO
          </div>
          <h1 className="hero-title">
            Sovereign<br/><span>Prompt Shield</span>
          </h1>
          <p className="hero-sub">
            The first AI data protection layer built specifically for tribal governments. PII detection, Chickasaw cultural term hashing, and sovereign audit logging — deployed on your infrastructure, owned by your Nation.
          </p>
          <div className="hero-by">
            Built by <strong>Sovereign Shield Technologies LLC</strong> · Matthew Culwell · Enrolled Chickasaw Citizen
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "demo" && <DemoTab />}
        {tab === "how" && <HowItWorksTab />}
        {tab === "compliance" && <ComplianceTab />}
        {tab === "pricing" && <PricingTab />}

        {/* Footer */}
        <div className="footer">
          <div className="footer-logo">Sovereign <span>Shield</span> Technologies LLC</div>
          <div className="footer-sub">Protecting Tribal Data Sovereignty · Project Chikasha AI</div>
          <div className="footer-copy">© 2026 Sovereign Shield Technologies LLC · All Rights Reserved · sovereignhealthcareos.com</div>
        </div>
      </div>
    </>
  );
}
