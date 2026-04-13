"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  navy:"#07101f",navy2:"#0c1a2e",navy3:"#112240",
  teal:"#00d4b8",teal2:"#00b89e",tealDim:"rgba(0,212,184,0.1)",
  gold:"#d4a843",goldDim:"rgba(212,168,67,0.1)",
  rose:"#e8526e",roseDim:"rgba(232,82,110,0.08)",
  violet:"#8060cc",violetDim:"rgba(128,96,204,0.1)",
  green:"#4ade80",greenDim:"rgba(74,222,128,0.1)",
  orange:"#f97316",orangeDim:"rgba(249,115,22,0.1)",
  slate:"#7a9bbf",white:"#eef2f8",
  border:"rgba(0,212,184,0.14)",border2:"rgba(255,255,255,0.06)",
  glass:"rgba(255,255,255,0.04)",glass2:"rgba(255,255,255,0.07)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.hos{display:flex;flex-direction:column;height:100vh;font-family:'Outfit',sans-serif;color:#eef2f8;background:#07101f;position:relative;overflow:hidden;max-width:480px;margin:0 auto}
.hos::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 90% 50% at 15% 5%,rgba(0,212,184,0.07) 0%,transparent 55%),
  radial-gradient(ellipse 70% 70% at 85% 85%,rgba(128,96,204,0.07) 0%,transparent 55%)}

.hdr{position:relative;z-index:10;flex-shrink:0;padding:14px 18px 12px;background:rgba(7,16,31,0.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,212,184,0.14)}
.hdr-top{display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#00d4b8,#8060cc);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 18px rgba(0,212,184,0.28);flex-shrink:0}
.logo-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#eef2f8}
.logo-sub{font-family:'DM Mono',monospace;font-size:8px;color:#00d4b8;letter-spacing:.18em;text-transform:uppercase;margin-top:1px}
.hdr-right{text-align:right}
.hdr-patient{font-size:12px;font-weight:600}
.hdr-id{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf;margin-top:1px}
.shield-active{display:inline-flex;align-items:center;gap:4px;font-family:'DM Mono',monospace;font-size:8px;color:#4ade80;margin-top:3px}
.pulse{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

.mode-bar{display:flex;gap:5px;padding:10px 18px;background:rgba(7,16,31,0.95);border-bottom:1px solid rgba(0,212,184,0.14);flex-shrink:0;position:relative;z-index:9;overflow-x:auto;scrollbar-width:none}
.mode-bar::-webkit-scrollbar{display:none}
.mode-btn{flex-shrink:0;padding:7px 12px;border-radius:20px;border:1px solid rgba(0,212,184,0.14);background:rgba(255,255,255,0.04);color:#7a9bbf;font-size:11px;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;white-space:nowrap}
.mode-btn.on{background:linear-gradient(135deg,#00d4b8,#00b89e);color:#07101f;font-weight:700;border-color:transparent;box-shadow:0 3px 14px rgba(0,212,184,0.28)}
.mode-btn.shield-btn.on{background:linear-gradient(135deg,#4ade80,#22c55e);color:#07101f}

.ring-wrap{display:flex;gap:16px;align-items:center;padding:16px 18px 0;flex-shrink:0}
.ring-pos{position:relative;width:88px;height:88px;flex-shrink:0}
.ring-svg{transform:rotate(-90deg)}
.ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring-num{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;color:#00d4b8;line-height:1}
.ring-lbl{font-size:8px;color:#7a9bbf;text-transform:uppercase;letter-spacing:.12em;margin-top:2px}
.score-info{flex:1}
.score-title{font-size:20px;font-weight:700;margin-bottom:3px}
.score-sub{font-size:11px;color:#7a9bbf;line-height:1.5}
.trend{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:'DM Mono',monospace;font-size:10px;color:#00d4b8;background:rgba(0,212,184,.1);padding:4px 10px;border-radius:20px;border:1px solid rgba(0,212,184,.2)}

.vitals-row{display:flex;gap:7px;padding:12px 18px 0;overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.vitals-row::-webkit-scrollbar{display:none}
.vital{flex-shrink:0;background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,184,0.14);border-radius:14px;padding:10px 12px;min-width:84px}
.vital-icon{font-size:14px;margin-bottom:3px}
.vital-val{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;line-height:1}
.vital-unit{font-size:8px;color:#7a9bbf}
.vital-name{font-size:9px;color:#7a9bbf;margin-top:2px}
.ok{color:#00d4b8}.warn{color:#d4a843}.alert{color:#e8526e}

.scroll{flex:1;overflow-y:auto;position:relative;z-index:5;scrollbar-width:none;min-height:0}
.scroll::-webkit-scrollbar{display:none}
.pad{padding:14px 18px 110px}

.sec{font-family:'DM Mono',monospace;font-size:9px;color:#00d4b8;text-transform:uppercase;letter-spacing:.18em;margin:16px 0 8px}
.sec:first-child{margin-top:0}

.card{background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,184,0.14);border-radius:18px;padding:15px;margin-bottom:10px;backdrop-filter:blur(12px)}
.card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.card-title{font-size:13px;font-weight:600}
.badge{font-family:'DM Mono',monospace;font-size:9px;padding:3px 8px;border-radius:8px}
.b-red{background:rgba(232,82,110,.18);color:#e8526e;border:1px solid rgba(232,82,110,.28)}
.b-gold{background:rgba(212,168,67,.18);color:#d4a843;border:1px solid rgba(212,168,67,.28)}
.b-teal{background:rgba(0,212,184,.14);color:#00d4b8;border:1px solid rgba(0,212,184,.2)}
.b-violet{background:rgba(128,96,204,.18);color:#b090f0;border:1px solid rgba(128,96,204,.28)}
.b-green{background:rgba(74,222,128,.14);color:#4ade80;border:1px solid rgba(74,222,128,.2)}
.b-orange{background:rgba(249,115,22,.18);color:#f97316;border:1px solid rgba(249,115,22,.28)}

.dom-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.dom-item{background:rgba(255,255,255,0.07);border:1px solid rgba(0,212,184,0.14);border-radius:14px;padding:13px}
.dom-name{font-size:10px;color:#7a9bbf;margin-bottom:7px}
.dom-bg{height:4px;background:rgba(255,255,255,.07);border-radius:2px;margin-bottom:5px;overflow:hidden}
.dom-fill{height:100%;border-radius:2px}
.dom-score{font-family:'DM Mono',monospace;font-size:17px;font-weight:500}

.insight{border-radius:16px;padding:14px;margin-bottom:9px;border-left:3px solid}
.insight.crit{border-color:#e8526e;background:rgba(232,82,110,0.05)}
.insight.watch{border-color:#d4a843;background:rgba(212,168,67,0.05)}
.insight.pos{border-color:#00d4b8;background:rgba(0,212,184,0.05)}
.insight-hdr{display:flex;align-items:center;gap:7px;margin-bottom:6px}
.insight-title{font-size:12px;font-weight:600}
.insight-body{font-size:11px;color:#7a9bbf;line-height:1.6}
.insight-foot{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.insight-cta{font-size:10px;font-weight:600;color:#00d4b8;padding:5px 12px;border:1px solid rgba(0,212,184,.3);border-radius:20px;background:rgba(0,212,184,.07);cursor:pointer}
.insight-conf{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf}

.tl-item{display:flex;gap:12px;margin-bottom:14px}
.tl-col{display:flex;flex-direction:column;align-items:center}
.tl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:2px}
.tl-line{width:1px;flex:1;background:rgba(0,212,184,0.14);margin-top:3px}
.tl-body{flex:1;padding-bottom:12px}
.tl-date{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf;margin-bottom:2px}
.tl-title{font-size:12px;font-weight:600;margin-bottom:2px}
.tl-text{font-size:11px;color:#7a9bbf;line-height:1.5}

.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.stat-item{background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,184,0.14);border-radius:14px;padding:12px 8px;text-align:center}
.stat-val{font-family:'DM Mono',monospace;font-size:16px;font-weight:500}
.stat-lbl{font-size:9px;color:#7a9bbf;margin-top:3px;line-height:1.3}

.prog-row{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.prog-lbl{font-size:10px;color:#7a9bbf;width:80px;flex-shrink:0;line-height:1.3}
.prog-bg{flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.prog-fill{height:100%;border-radius:3px;transition:width 1s ease}
.prog-val{font-family:'DM Mono',monospace;font-size:10px;width:38px;text-align:right;flex-shrink:0}

.meal-card{background:rgba(255,255,255,0.07);border:1px solid rgba(0,212,184,0.14);border-radius:14px;padding:13px;margin-bottom:8px}
.meal-time{font-family:'DM Mono',monospace;font-size:9px;color:#00d4b8;text-transform:uppercase;letter-spacing:.12em;margin-bottom:4px}
.meal-name{font-size:13px;font-weight:600;margin-bottom:3px}
.meal-desc{font-size:11px;color:#7a9bbf;line-height:1.5;margin-bottom:7px}
.meal-tags{display:flex;gap:5px;flex-wrap:wrap}
.meal-tag{font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(0,212,184,0.1);color:#00d4b8;border:1px solid rgba(0,212,184,.2)}

.gov-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
.gov-name{font-size:11px;color:#7a9bbf;flex:1}
.gov-status{font-family:'DM Mono',monospace;font-size:10px}

.cmp-row{display:flex;align-items:center;gap:0;margin-bottom:7px}
.cmp-lbl{font-size:10px;color:#7a9bbf;width:90px;flex-shrink:0}
.cmp-old{font-family:'DM Mono',monospace;font-size:11px;color:#e8526e;width:65px;text-align:right;flex-shrink:0}
.cmp-arr{font-size:10px;color:#7a9bbf;padding:0 5px}
.cmp-new{font-family:'DM Mono',monospace;font-size:11px;width:65px;flex-shrink:0}

/* CHAT */
.chat-wrap{display:flex;flex-direction:column;height:100%;padding:12px 18px 0;min-height:0}
.chat-ai-hdr{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-shrink:0}
.chat-msgs{flex:1;overflow-y:auto;padding-bottom:8px;scrollbar-width:none;min-height:0}
.chat-msgs::-webkit-scrollbar{display:none}
.bubble{max-width:88%;margin-bottom:12px}
.bubble.user{margin-left:auto}
.bubble-inner{padding:11px 15px;border-radius:18px;font-size:12px;line-height:1.6}
.bubble.ai .bubble-inner{background:rgba(255,255,255,0.07);border:1px solid rgba(0,212,184,0.14);border-bottom-left-radius:4px}
.bubble.user .bubble-inner{background:linear-gradient(135deg,#00d4b8,#00b89e);color:#07101f;border-bottom-right-radius:4px;font-weight:500}
.bubble-meta{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf;margin-top:3px}
.shield-tag{display:inline-flex;align-items:center;gap:4px;font-family:'DM Mono',monospace;font-size:8px;padding:2px 7px;border-radius:6px;margin-top:4px}
.shield-tag.clean{background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.2)}
.shield-tag.flagged{background:rgba(249,115,22,.12);color:#f97316;border:1px solid rgba(249,115,22,.2)}
.shield-tag.critical{background:rgba(232,82,110,.12);color:#e8526e;border:1px solid rgba(232,82,110,.2)}
.tdot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#7a9bbf;animation:blink 1.2s infinite;margin:0 1px}
.tdot:nth-child(2){animation-delay:.2s}.tdot:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.25}40%{opacity:1}}
.qprompts{display:flex;gap:7px;margin-bottom:10px;overflow-x:auto;scrollbar-width:none;flex-shrink:0}
.qprompts::-webkit-scrollbar{display:none}
.qp{flex-shrink:0;padding:6px 12px;border-radius:20px;font-size:10px;font-weight:500;cursor:pointer;border:1px solid rgba(0,212,184,0.14);background:rgba(255,255,255,0.04);color:#7a9bbf;white-space:nowrap;font-family:'Outfit',sans-serif}
.chat-bottom{border-top:1px solid rgba(0,212,184,0.14);padding:10px 0 0;flex-shrink:0}
.chat-row{display:flex;gap:9px}
.chat-in{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(0,212,184,0.14);border-radius:24px;padding:11px 17px;font-size:12px;color:#eef2f8;font-family:'Outfit',sans-serif;outline:none}
.chat-in::placeholder{color:#7a9bbf}
.chat-in:focus{border-color:rgba(0,212,184,.4)}
.chat-send{width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#00d4b8,#00b89e);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,212,184,.28)}

/* SHIELD DASHBOARD */
.shield-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px}
.shield-stat-item{background:rgba(255,255,255,0.04);border:1px solid rgba(74,222,128,0.2);border-radius:14px;padding:12px 8px;text-align:center}
.shield-stat-val{font-family:'DM Mono',monospace;font-size:16px;font-weight:500;color:#4ade80}
.shield-stat-lbl{font-size:9px;color:#7a9bbf;margin-top:3px;line-height:1.3}
.log-item{background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,184,0.14);border-radius:14px;padding:13px;margin-bottom:8px}
.log-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.log-time{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf}
.log-flags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px}
.log-flag{font-size:8px;padding:2px 7px;border-radius:6px}
.log-flag.CRITICAL{background:rgba(232,82,110,.15);color:#e8526e;border:1px solid rgba(232,82,110,.25)}
.log-flag.HIGH{background:rgba(249,115,22,.15);color:#f97316;border:1px solid rgba(249,115,22,.25)}
.log-flag.MEDIUM{background:rgba(212,168,67,.15);color:#d4a843;border:1px solid rgba(212,168,67,.25)}
.log-flag.LOW{background:rgba(0,212,184,.1);color:#00d4b8;border:1px solid rgba(0,212,184,.2)}
.log-action{font-family:'DM Mono',monospace;font-size:9px;color:#7a9bbf}
.risk-meter{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin-top:6px}
.risk-fill{height:100%;border-radius:3px;transition:width .8s ease}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;z-index:20;background:rgba(7,16,31,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(0,212,184,0.14);display:flex;padding:7px 0 env(safe-area-inset-bottom,14px)}
.bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 4px;cursor:pointer;border:none;background:none;color:#7a9bbf;transition:color .2s}
.bnav-btn.on{color:#00d4b8}
.bnav-btn.shield-nav.on{color:#4ade80}
.bnav-icon{font-size:18px}
.bnav-lbl{font-size:8px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em}

.abar-wrap{margin-bottom:10px}
.abar-top{display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px}
.abar-lbl{color:#7a9bbf}
.abar-bg{height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
.abar-fill{height:100%;border-radius:3px;transition:width 1.1s ease}
`;

// ── DATA ──────────────────────────────────────────────────────────────────────
const PATIENT = { name:"Mary Culwell", id:"CHK-2026-04821", age:67, score:74 };

const VITALS = [
  {icon:"❤️",val:"118/76",unit:"mmHg",name:"Blood Pressure",s:"ok"},
  {icon:"🩸",val:"6.4",unit:"A1C %",name:"Glycemic",s:"warn"},
  {icon:"🔬",val:"212",unit:"mg/dL",name:"LDL Chol.",s:"alert"},
  {icon:"⚡",val:"68",unit:"bpm",name:"Heart Rate",s:"ok"},
  {icon:"🫁",val:"96",unit:"SpO₂ %",name:"Oxygen Sat",s:"ok"},
  {icon:"⚖️",val:"174",unit:"lbs",name:"Body Weight",s:"warn"},
];

const DOMAINS = [
  {name:"🔬 Metabolic",score:58,c:C.gold},
  {name:"❤️ Cardiovascular",score:62,c:C.rose},
  {name:"🧠 Cognitive",score:81,c:C.teal},
  {name:"🎗️ Oncology",score:88,c:C.teal},
  {name:"💧 Renal",score:79,c:C.teal},
  {name:"🌿 Mental Health",score:72,c:C.violet},
];

const INSIGHTS = [
  {type:"crit",icon:"⚠️",title:"Elevated LDL — Action Required",body:"LDL of 212 mg/dL significantly elevates 10-year cardiovascular risk. Statin evaluation and dietary protocol recommended within 14 days.",cta:"Schedule Consult",conf:"94%"},
  {type:"watch",icon:"📈",title:"Prediabetes Progression Risk",body:"A1C at 6.4%. Fountain Life data shows 51% of members with your profile return to normal blood sugar within 14 months on metabolic protocol.",cta:"Start Protocol",conf:"89%"},
  {type:"pos",icon:"✅",title:"Cognitive Biomarkers Stable",body:"Cerebrovascular flow and inflammatory markers within optimal range. Current supplement regimen producing measurable protective effect.",cta:"View Report",conf:"97%"},
];

const BLOOD_PANEL = [
  {name:"Total Cholesterol",val:"238",unit:"mg/dL",pct:79,c:C.gold},
  {name:"LDL Cholesterol",val:"212",unit:"mg/dL",pct:92,c:C.rose},
  {name:"HDL Cholesterol",val:"52",unit:"mg/dL",pct:60,c:C.teal},
  {name:"Triglycerides",val:"148",unit:"mg/dL",pct:65,c:C.teal},
  {name:"A1C (Glycemic)",val:"6.4",unit:"%",pct:80,c:C.gold},
  {name:"Fasting Glucose",val:"114",unit:"mg/dL",pct:75,c:C.gold},
  {name:"eGFR (Kidney)",val:"74",unit:"mL/min",pct:55,c:C.teal},
  {name:"CRP (Inflammation)",val:"2.1",unit:"mg/L",pct:70,c:C.gold},
  {name:"Vitamin D",val:"34",unit:"ng/mL",pct:45,c:C.gold},
  {name:"TSH (Thyroid)",val:"2.4",unit:"mIU/L",pct:50,c:C.teal},
];

const MEALS = [
  {time:"Breakfast 7:00 AM",name:"Traditional Pashofa Bowl",desc:"Cracked corn with wild turkey protein, sage, and native berries. Anti-inflammatory + high fiber.",tags:["Traditional","Anti-inflammatory","High Fiber"]},
  {time:"Lunch 12:00 PM",name:"Venison & Three Sisters",desc:"Lean venison over corn, beans, and squash. Complete amino acid profile, low glycemic index.",tags:["Cultural Heritage","High Protein","Low GI"]},
  {time:"Dinner 6:30 PM",name:"Catfish & Fiddlehead Greens",desc:"Oklahoma catfish with spring fiddlehead ferns, wild onion, and hominy. Lean protein + folate.",tags:["Traditional","Low Cholesterol","High Folate"]},
];

const TIMELINE = [
  {dot:C.teal,date:"Apr 10, 2026",title:"AI Full-Body Scan",text:"Whole-body MRI + liquid biopsy. No oncological signals. Cardiovascular wall thickness unchanged."},
  {dot:C.gold,date:"Mar 3, 2026",title:"Metabolic Panel — Flag",text:"LDL 198→212 mg/dL. A1C 6.1%→6.4%. Metabolic protocol upgraded to Level 2."},
  {dot:C.violet,date:"Jan 28, 2026",title:"Cognitive Assessment",text:"MOCA 27/30. Brain aging markers stable. Omega-3 and aerobic protocol initiated."},
  {dot:C.teal,date:"Dec 15, 2025",title:"Enrollment & Baseline",text:"Health score: 68. CFM sovereign data vault created on Trace Fiber."},
];

// ── SHIELD LOG TYPE ───────────────────────────────────────────────────────────
interface ShieldLog {
  timestamp: string;
  riskLevel: string;
  riskScore: number;
  flagsDetected: Array<{ type: string; severity: string; count: number }>;
  action: string;
  query: string;
}

function domC(s:number){return s>=80?C.teal:s>=60?C.gold:C.rose}

function ABar({label,pct,color,delay=0,right}:{label:string;pct:number;color:string;delay?:number;right?:string}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),300+delay);return()=>clearTimeout(t)},[pct,delay]);
  return(
    <div className="abar-wrap">
      <div className="abar-top"><span className="abar-lbl">{label}</span><span style={{color,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{right||`${pct}%`}</span></div>
      <div className="abar-bg"><div className="abar-fill" style={{width:`${w}%`,background:`linear-gradient(90deg,${color},${color}88)`}}/></div>
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────────
function Overview(){
  return(
    <div className="pad">
      <div className="sec">Risk Domains</div>
      <div className="dom-grid">
        {DOMAINS.map((d,i)=>(
          <div className="dom-item" key={i}>
            <div className="dom-name">{d.name}</div>
            <div className="dom-bg"><div className="dom-fill" style={{width:`${d.score}%`,background:`linear-gradient(90deg,${domC(d.score)},${domC(d.score)}77)`}}/></div>
            <div className="dom-score" style={{color:domC(d.score)}}>{d.score}<span style={{fontSize:10,color:C.slate}}>/100</span></div>
          </div>
        ))}
      </div>
      <div className="sec">Platform Intelligence</div>
      <div className="stat-grid">
        <div className="stat-item"><div className="stat-val" style={{color:C.teal}}>15B+</div><div className="stat-lbl">Clinical Data Points</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.gold}}>96%</div><div className="stat-lbl">Pre-Symptom Detection</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.violet}}>13:1</div><div className="stat-lbl">Prevention ROI</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.green}}>$20M+</div><div className="stat-lbl">Annual/1K Members</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.teal}}>51%</div><div className="stat-lbl">Prediabetes Reversed</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.rose}}>4×</div><div className="stat-lbl">Cancer Detection</div></div>
      </div>
      <div className="sec">Active Protocols</div>
      {[
        {label:"Metabolic Reversal",pct:34,color:C.gold,detail:"Week 5 of 18 · A1C target: 5.7%"},
        {label:"Cardiovascular Defense",pct:20,color:C.rose,detail:"LDL reduction · Target: <170 mg/dL"},
        {label:"Longevity Optimization",pct:61,color:C.teal,detail:"Supplement + sleep + exercise"},
        {label:"Cognitive Protection",pct:78,color:C.violet,detail:"Brain health markers — stable"},
      ].map((p,i)=>(
        <div className="card" key={i}>
          <div className="card-hdr"><span className="card-title">{p.label}</span><span className="badge b-violet">{p.pct}%</span></div>
          <div className="prog-bg"><div className="prog-fill" style={{width:`${p.pct}%`,background:`linear-gradient(90deg,${p.color},${p.color}88)`}}/></div>
          <div style={{fontSize:10,color:C.slate,marginTop:6}}>{p.detail}</div>
        </div>
      ))}
    </div>
  );
}

function Insights(){
  return(
    <div className="pad">
      <div className="sec">AI Clinical Insights</div>
      {INSIGHTS.map((ins,i)=>(
        <div key={i} className={`insight ${ins.type}`}>
          <div className="insight-hdr"><span style={{fontSize:14}}>{ins.icon}</span><span className="insight-title">{ins.title}</span></div>
          <div className="insight-body">{ins.body}</div>
          <div className="insight-foot">
            <span className="insight-cta">{ins.cta} →</span>
            <span className="insight-conf">AI Confidence: {ins.conf}</span>
          </div>
        </div>
      ))}
      <div className="sec">Health Timeline</div>
      {TIMELINE.map((t,i)=>(
        <div className="tl-item" key={i}>
          <div className="tl-col">
            <div className="tl-dot" style={{background:t.dot,boxShadow:`0 0 8px ${t.dot}55`}}/>
            {i<TIMELINE.length-1&&<div className="tl-line"/>}
          </div>
          <div className="tl-body">
            <div className="tl-date">{t.date}</div>
            <div className="tl-title">{t.title}</div>
            <div className="tl-text">{t.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BloodPanel(){
  return(
    <div className="pad">
      <div className="sec">Comprehensive Blood Analysis</div>
      <div className="card">
        {BLOOD_PANEL.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:i<BLOOD_PANEL.length-1?`1px solid ${C.border2}`:"none"}}>
            <div style={{fontSize:10,color:C.slate,width:110,flexShrink:0}}>{b.name}</div>
            <div style={{flex:1,height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${b.pct}%`,background:`linear-gradient(90deg,${b.c},${b.c}88)`,borderRadius:2}}/>
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:b.c,width:55,textAlign:"right",flexShrink:0}}>{b.val}<span style={{fontSize:8,color:C.slate}}> {b.unit}</span></div>
          </div>
        ))}
      </div>
      <div className="stat-grid">
        <div className="stat-item"><div className="stat-val" style={{color:C.gold}}>B–</div><div className="stat-lbl">Panel Grade</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.rose}}>2</div><div className="stat-lbl">Flagged</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.teal}}>8</div><div className="stat-lbl">In Range</div></div>
      </div>
    </div>
  );
}

function Nutrition(){
  return(
    <div className="pad">
      <div className="sec">Personalized Nutrition Plan</div>
      <div className="stat-grid" style={{marginBottom:10}}>
        <div className="stat-item"><div className="stat-val" style={{color:C.teal}}>1,820</div><div className="stat-lbl">Target Calories</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.gold}}>118g</div><div className="stat-lbl">Protein</div></div>
        <div className="stat-item"><div className="stat-val" style={{color:C.violet}}>28g</div><div className="stat-lbl">Fiber</div></div>
      </div>
      {MEALS.map((m,i)=>(
        <div className="meal-card" key={i}>
          <div className="meal-time">{m.time}</div>
          <div className="meal-name">{m.name}</div>
          <div className="meal-desc">{m.desc}</div>
          <div className="meal-tags">{m.tags.map((t,j)=><span key={j} className="meal-tag">{t}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function Telehealth(){
  return(
    <div className="pad">
      <div className="sec">Upcoming Appointments</div>
      <div className="card">
        {[
          {icon:"🩺",title:"Dr. Sarah Ahtone, MD",body:"Metabolic review + statin discussion · Apr 28, 2026 · 10:30 AM"},
          {icon:"❤️",title:"Cardiology — Dr. Redhawk",body:"LDL management + echo review · May 12, 2026 · 2:00 PM"},
          {icon:"🔬",title:"Lab Draw — Fasting Panel",body:"A1C, lipid panel, kidney function · Apr 22, 2026 · 7:00 AM"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<2?`1px solid ${C.border2}`:"none"}}>
            <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
            <div><div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{r.title}</div><div style={{fontSize:11,color:C.slate}}>{r.body}</div></div>
          </div>
        ))}
      </div>
      <div className="sec">Cost Comparison</div>
      <div className="card">
        {[
          {lbl:"ER Visit (avoided)",old:"$3,200",nw:"$0",c:C.green},
          {lbl:"Specialist Referral",old:"$450",nw:"$0",c:C.teal},
          {lbl:"Annual Per-Capita",old:"$12,500",nw:"$1,800",c:C.green},
        ].map((r,i)=>(
          <div className="cmp-row" key={i}>
            <div className="cmp-lbl">{r.lbl}</div>
            <div className="cmp-old">{r.old}</div>
            <div className="cmp-arr">→</div>
            <div className="cmp-new" style={{color:r.c}}>{r.nw}</div>
          </div>
        ))}
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:C.slate}}>Annual ER diversion savings</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:18,color:C.green,fontWeight:600}}>$9.4M</span>
        </div>
      </div>
    </div>
  );
}

function Sovereignty(){
  return(
    <div className="pad">
      <div className="sec">Data Sovereignty Status</div>
      <div className="card">
        <div className="stat-grid">
          <div className="stat-item"><div className="stat-val" style={{color:C.green}}>100%</div><div className="stat-lbl">On-Nation Data</div></div>
          <div className="stat-item"><div className="stat-val" style={{color:C.teal}}>AES-256</div><div className="stat-lbl">Encryption</div></div>
          <div className="stat-item"><div className="stat-val" style={{color:C.violet}}>50yr</div><div className="stat-lbl">Retention</div></div>
        </div>
      </div>
      <div className="sec">Compliance</div>
      <div className="card">
        {[
          ["HIPAA Compliant","100%",C.green],
          ["CARE Principles","100%",C.teal],
          ["Tribal Data Sovereignty Act","Compliant",C.teal],
          ["AILT Governance","Active",C.violet],
          ["Chickasaw Nation AI Policy","Aligned",C.green],
        ].map(([name,status,c],i)=>(
          <div className="gov-row" key={i}>
            <div className="gov-name">{name}</div>
            <div className="gov-status" style={{color:c as string}}>{status}</div>
          </div>
        ))}
      </div>
      <div className="sec">CARE Principles</div>
      <div className="card">
        {[
          {l:"C",name:"Collective Benefit",desc:"AI benefits the Nation — not just efficient subgroups"},
          {l:"A",name:"Authority to Control",desc:"Chickasaw Nation owns all data, models, and outputs"},
          {l:"R",name:"Responsibility",desc:"SST LLC and tribal AI committee co-accountable"},
          {l:"E",name:"Ethics",desc:"Every training epoch reviewed for cultural alignment"},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"9px 0",borderBottom:i<3?`1px solid ${C.border2}`:"none"}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.teal},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:C.navy,flexShrink:0}}>{p.l}</div>
            <div><div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{p.name}</div><div style={{fontSize:10,color:C.slate,lineHeight:1.5}}>{p.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Impact(){
  return(
    <div className="pad">
      <div className="sec">Your Cost Avoidance</div>
      <div className="card">
        <ABar label="Cancer (early detect)" pct={85} color={C.teal} right="$42,000"/>
        <ABar label="Metabolic reversal" pct={65} color={C.gold} delay={100} right="$28,000"/>
        <ABar label="Cardiovascular" pct={76} color={C.rose} delay={200} right="$37,000"/>
        <ABar label="ER reduction" pct={45} color={C.violet} delay={300} right="$14,000"/>
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:C.slate}}>Total projected this year</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:C.teal,fontWeight:500}}>$121,000</span>
        </div>
      </div>
      <div className="sec">Nation-Wide (1,000 Members)</div>
      <div className="stat-grid">
        {[{val:"$20.2M",lbl:"Annual Benefit",c:C.teal},{val:"13:1",lbl:"ROI Ratio",c:C.gold},{val:"$18.7M",lbl:"Net Benefit",c:C.green}].map((s,i)=>(
          <div className="stat-item" key={i}><div className="stat-val" style={{color:s.c}}>{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
        ))}
      </div>
      <div className="sec">5-Year Projection</div>
      <div className="card">
        {[
          {yr:"Year 1",total:"$740K",c:C.slate},
          {yr:"Year 2",total:"$3.85M",c:C.gold},
          {yr:"Year 3",total:"$8.3M",c:C.teal},
          {yr:"Year 4",total:"$12.6M",c:C.teal},
          {yr:"Year 5",total:"$17.5M",c:C.green},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${C.border2}`:"none"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.slate}}>{r.yr}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:r.c,fontWeight:600}}>{r.total}</span>
          </div>
        ))}
        <div style={{marginTop:10,display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
          <span style={{fontSize:10,color:C.slate}}>5-Year Cumulative</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:18,color:C.green,fontWeight:600}}>$43M+</span>
        </div>
      </div>
    </div>
  );
}

// ── SHIELD DASHBOARD ──────────────────────────────────────────────────────────
function ShieldDashboard({logs}:{logs:ShieldLog[]}){
  const protected_count = logs.length;
  const flagged_count = logs.filter(l=>l.riskLevel!=="LOW").length;
  const critical_count = logs.filter(l=>l.riskLevel==="CRITICAL").length;

  const riskColor = (level:string) => level==="CRITICAL"?C.rose:level==="HIGH"?C.orange:level==="MEDIUM"?C.gold:C.teal;

  return(
    <div className="pad">
      <div className="sec">Shield Status — Live</div>
      <div className="shield-stat">
        <div className="shield-stat-item"><div className="shield-stat-val">{protected_count}</div><div className="shield-stat-lbl">Queries Protected</div></div>
        <div className="shield-stat-item"><div className="shield-stat-val" style={{color:flagged_count>0?C.orange:C.green}}>{flagged_count}</div><div className="shield-stat-lbl">PII Detected</div></div>
        <div className="shield-stat-item"><div className="shield-stat-val" style={{color:critical_count>0?C.rose:C.green}}>{critical_count}</div><div className="shield-stat-lbl">Critical Flags</div></div>
      </div>

      <div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Sovereign Prompt Shield</span>
          <span className="badge b-green">ACTIVE</span>
        </div>
        {[
          ["Data Residency","Trace Fiber — On Nation",C.green],
          ["PII Detection","Real-time scan on every query",C.teal],
          ["Audit Logging","Every interaction timestamped",C.teal],
          ["Routing","All queries → Health OS AI only",C.violet],
          ["Commercial AI Exposure","ZERO",C.green],
        ].map(([k,v,c],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<4?`1px solid ${C.border2}`:"none"}}>
            <span style={{fontSize:10,color:C.slate}}>{k}</span>
            <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:c as string}}>{v}</span>
          </div>
        ))}
      </div>

      <div className="sec">Live Audit Log</div>
      {logs.length===0?(
        <div className="card" style={{textAlign:"center",padding:"24px"}}>
          <div style={{fontSize:24,marginBottom:8}}>🛡️</div>
          <div style={{fontSize:12,color:C.slate}}>No queries yet. Send a message in the AI tab to see the Shield in action.</div>
        </div>
      ):(
        [...logs].reverse().map((log,i)=>(
          <div className="log-item" key={i}>
            <div className="log-top">
              <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="badge" style={{background:`rgba(${log.riskLevel==="CRITICAL"?"232,82,110":log.riskLevel==="HIGH"?"249,115,22":log.riskLevel==="MEDIUM"?"212,168,67":"0,212,184"},.15)`,color:riskColor(log.riskLevel),border:`1px solid ${riskColor(log.riskLevel)}44`}}>{log.riskLevel}</span>
            </div>
            <div style={{fontSize:10,color:C.slate,marginBottom:6,fontStyle:"italic"}}>"{log.query.substring(0,60)}{log.query.length>60?"...":""}"</div>
            {log.flagsDetected.length>0&&(
              <div className="log-flags">
                {log.flagsDetected.map((f,j)=>(
                  <span key={j} className={`log-flag ${f.severity}`}>{f.type}</span>
                ))}
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div className="log-action">{log.action}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:riskColor(log.riskLevel)}}>Risk: {log.riskScore}/100</div>
            </div>
            <div className="risk-meter">
              <div className="risk-fill" style={{width:`${log.riskScore}%`,background:`linear-gradient(90deg,${riskColor(log.riskLevel)},${riskColor(log.riskLevel)}88)`}}/>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── AI CHAT WITH SHIELD ───────────────────────────────────────────────────────
function AIChat({onShieldLog}:{onShieldLog:(log:ShieldLog)=>void}){
  const [msgs,setMsgs]=useState([{role:"ai",text:"Halito, Mary. Your health score improved 8.8% since your last scan. I'm tracking two areas closely: LDL at 212 and A1C at 6.4%. Every message you send is protected by the Sovereign Prompt Shield — your data never leaves Trace Fiber. What would you like to know?",shield:null as ShieldLog|null}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const endRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[msgs,typing]);

  const send=useCallback(async(text:string)=>{
    if(!text.trim()||typing)return;
    const msg=text.trim();
    const next=[...msgs,{role:"user",text:msg,shield:null}];
    setMsgs(next);setInput("");setTyping(true);
    try{
      const res=await fetch("/api/shield",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:next.filter(m=>m.role!=="ai"||next.indexOf(m)>0).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),
          patientId:PATIENT.id
        })
      });
      const data=await res.json();
      const shieldData = data.shield as ShieldLog;
      if(shieldData){
        shieldData.query=msg;
        onShieldLog(shieldData);
      }
      setMsgs(p=>[...p,{role:"ai",text:data.content||"Unable to connect.",shield:shieldData}]);
    }catch{
      setMsgs(p=>[...p,{role:"ai",text:"Secure health channel momentarily unavailable. Data remains protected on Trace Fiber.",shield:null}]);
    }finally{setTyping(false);}
  },[msgs,typing,onShieldLog]);

  const shieldColor=(log:ShieldLog|null)=>{
    if(!log)return"clean";
    if(log.riskLevel==="CRITICAL")return"critical";
    if(log.riskLevel==="HIGH"||log.riskLevel==="MEDIUM")return"flagged";
    return"clean";
  };

  const shieldLabel=(log:ShieldLog|null)=>{
    if(!log)return"🛡 Shield Protected";
    if(log.riskLevel==="CRITICAL")return`🛡 PII Redacted — ${log.flagsDetected.map(f=>f.type).join(", ")}`;
    if(log.flagsDetected.length>0)return`🛡 ${log.flagsDetected.length} item(s) flagged`;
    return"🛡 Clean — No PII Detected";
  };

  return(
    <div className="chat-wrap">
      <div className="chat-ai-hdr">
        <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>🧬</div>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>Chikasha Health AI</div>
          <div style={{fontSize:9,color:C.teal,fontFamily:"'DM Mono',monospace"}}>CFM v1.2 · Sovereign Prompt Shield Active</div>
        </div>
      </div>
      <div className="qprompts">
        {["Explain my LDL risk","Prediabetes action plan","My cognitive score","Cost savings","Next scan prep","My SSN is 123-45-6789","Call Dr. Smith at 555-123-4567"].map(q=>(
          <button key={q} className="qp" onClick={()=>send(q)}>{q}</button>
        ))}
      </div>
      <div className="chat-msgs">
        {msgs.map((m,i)=>(
          <div key={i} className={`bubble ${m.role}`}>
            <div className="bubble-inner" style={{whiteSpace:"pre-wrap"}}>{m.text}</div>
            <div className="bubble-meta">{m.role==="ai"?"🧬 Chikasha AI":"You"}</div>
            {m.role==="ai"&&i>0&&(
              <div className={`shield-tag ${shieldColor(m.shield)}`}>
                {shieldLabel(m.shield)}
              </div>
            )}
          </div>
        ))}
        {typing&&<div className="bubble ai"><div className="bubble-inner"><span className="tdot"/><span className="tdot"/><span className="tdot"/></div></div>}
        <div ref={endRef}/>
      </div>
      <div className="chat-bottom">
        <div className="chat-row">
          <input className="chat-in" placeholder="Ask your health AI — Shield protects every message..." value={input}
            onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)}/>
          <button className="chat-send" onClick={()=>send(input)}>➤</button>
        </div>
      </div>
    </div>
  );
}

function Profile(){
  return(
    <div className="pad">
      <div style={{textAlign:"center",padding:"16px 0 20px"}}>
        <div style={{width:68,height:68,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 10px"}}>👤</div>
        <div style={{fontSize:20,fontWeight:700}}>{PATIENT.name}</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.slate,marginTop:3}}>{PATIENT.id}</div>
        <div style={{fontSize:11,color:C.gold,marginTop:5}}>Enrolled Chickasaw Citizen · Age {PATIENT.age}</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:5,fontFamily:"'DM Mono',monospace",fontSize:8,color:C.green,background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.2)",padding:"3px 10px",borderRadius:20,marginTop:10}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
          Shield Active · Trace Fiber Sovereign
        </div>
      </div>
      <div className="sec">Profile</div>
      {[
        ["Enrollment","December 15, 2025"],["Program","Chikasha Health OS — Full"],
        ["Primary Physician","Dr. Sarah Ahtone, MD"],["Next Scan","July 2, 2026"],
        ["Data Vault","Trace Fiber · AES-256 · Sovereign"],["AI Model","CFM v1.2 · AILT Governed"],
        ["Shield Version","Sovereign Prompt Shield v1.0"],["Protocols Active","4 of 4"],
      ].map(([k,v],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border2}`}}>
          <span style={{fontSize:11,color:C.slate}}>{k}</span>
          <span style={{fontSize:11,fontWeight:500,textAlign:"right",maxWidth:"55%"}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const PATIENT_NAV=[
  {id:"overview",icon:"🏥",label:"Health"},
  {id:"insights",icon:"💡",label:"Insights"},
  {id:"nutrition",icon:"🌽",label:"Nutrition"},
  {id:"ai",icon:"🧬",label:"AI"},
  {id:"profile",icon:"👤",label:"Profile"},
];

const CLINICAL_NAV=[
  {id:"blood",icon:"🔬",label:"Blood"},
  {id:"telehealth",icon:"📡",label:"Telehealth"},
  {id:"sovereignty",icon:"🛡",label:"Sovereign"},
  {id:"impact",icon:"📊",label:"Impact"},
  {id:"shield",icon:"🔒",label:"Shield"},
];

export default function ChikashaHealthOS(){
  const [mode,setMode]=useState("patient");
  const [page,setPage]=useState("overview");
  const [shieldLogs,setShieldLogs]=useState<ShieldLog[]>([]);

  const nav=mode==="patient"?PATIENT_NAV:CLINICAL_NAV;

  useEffect(()=>{
    const ids=nav.map(n=>n.id);
    if(!ids.includes(page))setPage(ids[0]);
  },[mode]);

  const addShieldLog=useCallback((log:ShieldLog)=>{
    setShieldLogs(prev=>[...prev,log]);
  },[]);

  const showRing=mode==="patient"&&page!=="ai"&&page!=="profile";

  const renderPage=()=>{
    switch(page){
      case"overview":return<Overview/>;
      case"insights":return<Insights/>;
      case"nutrition":return<Nutrition/>;
      case"blood":return<BloodPanel/>;
      case"telehealth":return<Telehealth/>;
      case"sovereignty":return<Sovereignty/>;
      case"impact":return<Impact/>;
      case"shield":return<ShieldDashboard logs={shieldLogs}/>;
      case"profile":return<Profile/>;
      case"ai":return(
        <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"12px 18px 100px",minHeight:0}}>
          <AIChat onShieldLog={addShieldLog}/>
        </div>
      );
      default:return<Overview/>;
    }
  };

  return(
    <>
      <style>{CSS}</style>
      <div className="hos">
        <div className="hdr">
          <div className="hdr-top">
            <div className="logo">
              <div className="logo-mark">⚕</div>
              <div>
                <div className="logo-name">Chikasha Health OS</div>
                <div className="logo-sub">Sovereign Health Intelligence</div>
              </div>
            </div>
            <div className="hdr-right">
              <div className="hdr-patient">{PATIENT.name}</div>
              <div className="hdr-id">{PATIENT.id}</div>
              <div className="shield-active"><div className="pulse"/>SHIELD ON</div>
            </div>
          </div>
        </div>

        {showRing&&(
          <>
            <div className="ring-wrap">
              <div className="ring-pos">
                <svg width="88" height="88" viewBox="0 0 88 88" className="ring-svg">
                  <circle cx="44" cy="44" r="37" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                  <circle cx="44" cy="44" r="37" fill="none" stroke="url(#rg)" strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={`${2*Math.PI*37}`}
                    strokeDashoffset={`${2*Math.PI*37*(1-PATIENT.score/100)}`}/>
                  <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={C.teal}/><stop offset="100%" stopColor={C.violet}/>
                  </linearGradient></defs>
                </svg>
                <div className="ring-inner">
                  <div className="ring-num">{PATIENT.score}</div>
                  <div className="ring-lbl">Score</div>
                </div>
              </div>
              <div className="score-info">
                <div className="score-title">Moderate Risk</div>
                <div className="score-sub">2 active alerts · Next scan 83 days</div>
                <div className="trend">↑ +8.8% since last scan</div>
              </div>
            </div>
            <div className="vitals-row">
              {VITALS.map((v,i)=>(
                <div className="vital" key={i}>
                  <div className="vital-icon">{v.icon}</div>
                  <div className={`vital-val ${v.s}`}>{v.val}</div>
                  <div className="vital-unit">{v.unit}</div>
                  <div className="vital-name">{v.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mode-bar">
          <button className={`mode-btn ${mode==="patient"?"on":""}`} onClick={()=>setMode("patient")}>👤 Patient</button>
          <button className={`mode-btn ${mode==="clinical"?"on":""}`} onClick={()=>setMode("clinical")}>⚕ Clinical</button>
          <button className={`mode-btn shield-btn ${page==="shield"?"on":""}`} onClick={()=>{setMode("clinical");setPage("shield")}}>
            🔒 Shield {shieldLogs.length>0?`(${shieldLogs.length})`:""}
          </button>
        </div>

        <div className="scroll">{renderPage()}</div>

        <div className="bnav">
          {nav.map(n=>(
            <button key={n.id} className={`bnav-btn ${n.id==="shield"?"shield-nav":""} ${page===n.id?"on":""}`} onClick={()=>setPage(n.id)}>
              <span className="bnav-icon">{n.icon}</span>
              <span className="bnav-lbl">{n.id==="shield"&&shieldLogs.length>0?`Shield(${shieldLogs.length})`:n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
