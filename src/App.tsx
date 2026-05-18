import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from "recharts";

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const THRUST_AREAS = [
  "Revenue Growth", "Cost Reduction", "Customer Satisfaction",
  "Process Improvement", "People Development", "Innovation",
  "Quality & Compliance", "Safety & Environment",
];
const UOM_OPTIONS = [
  { v: "min",  l: "Numeric / Min — Higher is Better (e.g. Revenue, NPS)" },
  { v: "max",  l: "Numeric / Max — Lower is Better (e.g. TAT, Cost)" },
  { v: "pct",  l: "Percentage (%)" },
  { v: "date", l: "Timeline — Date-based Completion" },
  { v: "zero", l: "Zero-based — Zero = Success (e.g. Incidents)" },
];
const STATUS_OPTS = ["Not Started", "On Track", "Completed"];
const QUARTERS    = ["Q1", "Q2", "Q3", "Q4"];
const Q_WINDOWS   = { Q1: "July", Q2: "October", Q3: "January", Q4: "March / April" };
const CH_COLS     = ["#10b981","#34d399","#fbbf24","#f87171","#34d399","#0891b2","#db2777","#65a30d"];

// ═══════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════
const USERS = [
  { id:"e1", name:"Aisha Kumar",   role:"employee", managerId:"m1", dept:"Sales"       },
  { id:"e2", name:"Raj Patel",     role:"employee", managerId:"m1", dept:"Sales"       },
  { id:"e3", name:"Priya Singh",   role:"employee", managerId:"m1", dept:"Engineering" },
  { id:"m1", name:"Vikram Sharma", role:"manager",  managerId:"a1", dept:"Sales"       },
  { id:"a1", name:"Neha Joshi",    role:"admin",    managerId:null, dept:"HR"          },
];

let _gid = 30, _aid = 10;
const newGid = () => ++_gid;
const newAid = () => ++_aid;

const INIT_GOALS = [
  { id:1,  empId:"e1", thrustArea:"Revenue Growth",       title:"Quarterly Sales Target",       desc:"Achieve ₹10L cumulative revenue for FY 2024-25",     uom:"min",  target:1000000, weightage:40, status:"approved", locked:true,  shared:false, sharedFrom:null, createdAt:"2024-05-01", achievements:{ Q1:{actual:850000, status:"On Track",   mc:"Good progress — keep pushing!"},   Q2:{actual:960000, status:"On Track",   mc:"Excellent, almost there!"},  Q3:null, Q4:null } },
  { id:2,  empId:"e1", thrustArea:"Customer Satisfaction", title:"NPS Score Improvement",       desc:"Lift Net Promoter Score from 65 to 80 by year-end",   uom:"min",  target:80,      weightage:30, status:"approved", locked:true,  shared:false, sharedFrom:null, createdAt:"2024-05-01", achievements:{ Q1:{actual:70,      status:"On Track",   mc:""},                                Q2:{actual:76,      status:"On Track",   mc:"Positive trend — maintain."},Q3:null, Q4:null } },
  { id:3,  empId:"e1", thrustArea:"Process Improvement",  title:"Order TAT Reduction",         desc:"Reduce average order turnaround to under 24 hours",   uom:"max",  target:24,      weightage:30, status:"approved", locked:true,  shared:false, sharedFrom:null, createdAt:"2024-05-01", achievements:{ Q1:{actual:30,      status:"On Track",   mc:"Room for improvement in Q2."}, Q2:null, Q3:null, Q4:null } },
  { id:4,  empId:"e2", thrustArea:"Revenue Growth",       title:"New Enterprise Client Acquisition", desc:"Acquire 10 new enterprise clients in FY 2024-25", uom:"min",  target:10,      weightage:50, status:"submitted",locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-03", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
  { id:5,  empId:"e2", thrustArea:"Cost Reduction",       title:"Travel Cost Optimisation",    desc:"Reduce travel expenses by 20% year-on-year",          uom:"max",  target:50000,   weightage:30, status:"submitted",locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-03", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
  { id:6,  empId:"e2", thrustArea:"People Development",   title:"L&D Training Hours",          desc:"Complete at least 40 hours of learning & development", uom:"min",  target:40,      weightage:20, status:"submitted",locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-03", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
  { id:7,  empId:"e3", thrustArea:"Innovation",           title:"Sprint Velocity Improvement", desc:"Increase sprint delivery velocity by 25% vs baseline", uom:"min",  target:125,     weightage:40, status:"draft",    locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-04", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
  { id:8,  empId:"e3", thrustArea:"Quality & Compliance", title:"Production Bug Escape Rate",  desc:"Reduce bug escape rate to below 2%",                  uom:"max",  target:2,       weightage:30, status:"draft",    locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-04", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
  { id:9,  empId:"e3", thrustArea:"Safety & Environment", title:"Zero Critical Incidents",     desc:"Maintain zero critical security incidents for FY25",  uom:"zero", target:0,       weightage:30, status:"draft",    locked:false, shared:false, sharedFrom:null, createdAt:"2024-05-04", achievements:{ Q1:null, Q2:null, Q3:null, Q4:null } },
];

const INIT_AUDIT = [
  { id:1, goalId:1, goalTitle:"Quarterly Sales Target",    empName:"Aisha Kumar", by:"Vikram Sharma", type:"Goal Approved",           detail:"Status: submitted → approved",          ts:"2024-05-05 10:30" },
  { id:2, goalId:2, goalTitle:"NPS Score Improvement",    empName:"Aisha Kumar", by:"Vikram Sharma", type:"Goal Approved",           detail:"Status: submitted → approved",          ts:"2024-05-05 10:36" },
  { id:3, goalId:3, goalTitle:"Order TAT Reduction",      empName:"Aisha Kumar", by:"Vikram Sharma", type:"Goal Approved",           detail:"Status: submitted → approved",          ts:"2024-05-05 10:42" },
  { id:4, goalId:1, goalTitle:"Quarterly Sales Target",    empName:"Aisha Kumar", by:"Neha Joshi",    type:"Target Modified (Admin)", detail:"Target changed: ₹9,00,000 → ₹10,00,000",ts:"2024-05-06 14:22" },
];

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════
function calcScore(goal, q) {
  const a = goal.achievements?.[q];
  if (!a || a.actual === "" || a.actual === null || a.actual === undefined) return null;
  const ac = +a.actual, tgt = +goal.target;
  if (isNaN(ac)) return null;
  switch (goal.uom) {
    case "min": case "pct": return isNaN(tgt) || tgt === 0 ? null : Math.min((ac / tgt) * 100, 150);
    case "max": return isNaN(tgt) || ac === 0 ? null : Math.min((tgt / ac) * 100, 150);
    case "zero": return ac === 0 ? 100 : 0;
    case "date": return isNaN(tgt) || tgt === 0 ? null : Math.min((ac / tgt) * 100, 100);
    default: return null;
  }
}

function calcWeighted(goals, q) {
  const approved = goals.filter(g => g.status === "approved");
  let ws = 0, tw = 0;
  for (const g of approved) {
    const s = calcScore(g, q);
    if (s !== null) { ws += s * g.weightage; tw += g.weightage; }
  }
  return tw ? parseFloat((ws / tw).toFixed(1)) : null;
}

function fmtNum(n) {
  if (n === null || n === undefined || n === "") return "—";
  const num = +n;
  if (isNaN(num)) return "—";
  if (Math.abs(num) >= 100000) return "₹" + (num / 100000).toFixed(1) + "L";
  return num.toLocaleString("en-IN");
}

function exportGoalsCSV(goals) {
  const hdr = ["Employee","Dept","Goal Title","Thrust Area","UoM","Target","Weightage","Q1 Actual","Q1 Score","Q2 Actual","Q2 Score","Q3 Actual","Q3 Score","Q4 Actual","Q4 Score","Q4 Status"];
  const rows = goals.filter(g => g.status === "approved").map(g => {
    const emp = USERS.find(u => u.id === g.empId);
    return [emp?.name||"", emp?.dept||"", g.title, g.thrustArea, g.uom, g.target, g.weightage+"%",
      ...QUARTERS.flatMap(q => { const a = g.achievements[q]; const sc = calcScore(g,q); return [a?.actual??"", sc!==null?sc.toFixed(1)+"%":""]; }),
      g.achievements.Q4?.status||""];
  });
  const csv = [hdr,...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\\n");
  const b = new Blob([csv], { type:"text/csv" });
  const url = URL.createObjectURL(b);
  const a = document.createElement("a"); a.href=url; a.download="achievement_report.csv"; a.click();
}

// ═══════════════════════════════════════════════════════
// TINY COMPONENTS
// ═══════════════════════════════════════════════════════
function Avt({ name, size="sm" }) {
  const initials = (name||"").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const cs = ["#10b981","#34d399","#34d399","#f87171","#fbbf24"];
  const c  = cs[(name||"").charCodeAt(0) % cs.length] || "#94a3b8";
  const sz = { sm:"32px", md:"40px", lg:"48px" }[size];
  const fs = { sm:"11px", md:"13px", lg:"15px" }[size];
  return <div style={{ width:sz, height:sz, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:600, fontSize:fs, flexShrink:0 }}>{initials}</div>;
}

function Badge({ s }) {
  const map = {
    approved:      { bg:"#dcfce7", color:"#34d399", border:"#047857" },
    submitted:     { bg:"#dbeafe", color:"#60a5fa", border:"#1e3a8a" },
    draft:         { bg:"#1e293b", color:"#94a3b8", border:"#1e293b" },
    returned:      { bg:"#fef3c7", color:"#fcd34d", border:"#78350f" },
    "On Track":    { bg:"#dcfce7", color:"#34d399", border:"#047857" },
    "Completed":   { bg:"#ede9fe", color:"#6d28d9", border:"#064e3b" },
    "Not Started": { bg:"#1e293b", color:"#94a3b8", border:"#1e293b" },
  };
  const st = map[s] || map["draft"];
  return <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:"0.3px", background:st.bg, color:st.color, border:`1px solid ${st.border}`, whiteSpace:"nowrap" }}>{s}</span>;
}

function PBar({ score }) {
  const pct = Math.min(score||0, 100);
  const c = pct >= 100 ? "#34d399" : pct >= 75 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ width:"100%", background:"#1e293b", borderRadius:99, height:5, marginTop:4 }}>
      <div style={{ width:`${pct}%`, height:5, borderRadius:99, background:c, transition:"width .4s" }} />
    </div>
  );
}

function StatCard({ label, value, sub, accent="#10b981" }) {
  return (
    <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", borderTop:`3px solid ${accent}` }}>
      <p style={{ fontSize:11, color:"#64748b", marginBottom:4, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</p>
      <p style={{ fontSize:24, fontWeight:700, color:accent, margin:0, lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{sub}</p>}
    </div>
  );
}

function Modal({ title, onClose, children, wide=false }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#0f172a", borderRadius:16, width:"100%", maxWidth:wide?680:500, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#f8fafc" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#64748b", lineHeight:1, padding:0 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#e2e8f0", marginBottom:5 }}>{label}{required && <span style={{ color:"#f87171", marginLeft:3 }}>*</span>}</label>
      {children}
      {error && <p style={{ fontSize:11, color:"#f87171", marginTop:3 }}>{error}</p>}
    </div>
  );
}

const inpStyle = (err) => ({ width:"100%", border:`1px solid ${err?"#7f1d1d":"#1e293b"}`, borderRadius:12, padding:"8px 10px", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#0f172a" });

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const roleStyle = { employee:{ bg:"#dcfce7", c:"#34d399" }, manager:{ bg:"#dbeafe", c:"#60a5fa" }, admin:{ bg:"#ede9fe", c:"#6d28d9" } };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#0f172a", borderRadius:20, padding:32, width:"100%", maxWidth:380, boxShadow:"0 40px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, background:"linear-gradient(135deg, #10b981, #34d399)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 14px" }}>🎯</div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.5px" }}>GoalTrack</h1>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>AtomQuest Hackathon 1.0 · Atomberg Technologies</p>
        </div>
        <p style={{ fontSize:11, color:"#64748b", textAlign:"center", marginBottom: 24, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>Choose a role to demo</p>
        <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
          {USERS.map(u => (
            <button key={u.id} onClick={() => onLogin(u)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", border:"1.5px solid #1e293b", borderRadius:24, background:"#0f172a", cursor:"pointer", textAlign:"left", transition:"all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#10b981"; e.currentTarget.style.background="#f5f3ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#1e293b"; e.currentTarget.style.background="#fff"; }}>
              <Avt name={u.name} size="sm" />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#f8fafc" }}>{u.name}</p>
                <p style={{ margin:0, fontSize:11, color:"#64748b" }}>{u.dept}</p>
              </div>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:700, background:roleStyle[u.role].bg, color:roleStyle[u.role].c, textTransform:"capitalize" }}>{u.role}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize:11, color:"#475569", textAlign:"center", marginTop:20 }}>Pre-seeded demo data · No password required</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GOAL FORM MODAL
// ═══════════════════════════════════════════════════════
function GoalFormModal({ goal, myGoals, onSave, onClose }) {
  const isEdit = !!goal?.id;
  const [form, setForm] = useState({
    thrustArea: goal?.thrustArea || "",
    title:      goal?.title      || "",
    desc:       goal?.desc       || "",
    uom:        goal?.uom        || "min",
    target:     goal?.target     || "",
    weightage:  goal?.weightage  || "",
  });
  const [errs, setErrs] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const usedWeight = myGoals.filter(g => !isEdit || g.id !== goal?.id).reduce((s, g) => s + (+g.weightage || 0), 0);
  const remaining  = 100 - usedWeight;
  const totalGoals = myGoals.filter(g => !isEdit || g.id !== goal?.id).length;

  const validate = () => {
    const e = {};
    if (!form.thrustArea) e.thrustArea = "Please select a thrust area";
    if (!form.title.trim()) e.title = "Goal title is required";
    const wt = +form.weightage;
    if (!form.weightage) e.weightage = "Weightage is required";
    else if (wt < 10) e.weightage = "Minimum weightage is 10%";
    else if (wt > 100) e.weightage = "Cannot exceed 100%";
    else if (wt > remaining + 0.01) e.weightage = `Only ${remaining}% remaining`;
    if (form.uom !== "zero" && !String(form.target).trim()) e.target = "Target value is required";
    if (!isEdit && totalGoals >= 8) e.title = "Maximum 8 goals per employee reached";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...(isEdit ? { id: goal.id } : {}), ...form, weightage: +form.weightage, target: form.uom === "zero" ? 0 : +form.target }, isEdit);
  };

  return (
    <Modal title={isEdit ? "Edit Goal" : "Add New Goal"} onClose={onClose}>
      <div style={{ background:"#064e3b", border:"1px solid #064e3b", borderRadius:12, padding:"10px 12px", marginBottom: 24, fontSize:12, color:"#4338ca" }}>
        <strong>Remaining weight:</strong> {remaining}% &nbsp;·&nbsp; <strong>Goals:</strong> {totalGoals}/8 max &nbsp;·&nbsp; Min 10% per goal
      </div>
      <Field label="Thrust Area" required error={errs.thrustArea}>
        <select style={inpStyle(errs.thrustArea)} value={form.thrustArea} onChange={e => set("thrustArea", e.target.value)}>
          <option value="">Select thrust area…</option>
          {THRUST_AREAS.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Goal Title" required error={errs.title}>
        <input style={inpStyle(errs.title)} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Achieve Q2 Sales Target" />
      </Field>
      <Field label="Description / KPI Definition">
        <textarea style={{ ...inpStyle(false), height:64, resize:"vertical" }} value={form.desc} onChange={e => set("desc", e.target.value)} placeholder="Briefly describe this goal and how it will be measured…" />
      </Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Unit of Measurement (UoM)" required error={errs.uom}>
          <select style={inpStyle(errs.uom)} value={form.uom} onChange={e => set("uom", e.target.value)}>
            {UOM_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l.split("—")[0].trim()}</option>)}
          </select>
        </Field>
        <Field label={form.uom === "zero" ? "Target (auto: 0)" : "Target Value"} required={form.uom !== "zero"} error={errs.target}>
          <input style={inpStyle(errs.target)} type="number" value={form.uom === "zero" ? "0" : form.target} disabled={form.uom === "zero"} onChange={e => set("target", e.target.value)} placeholder="Enter target value" />
        </Field>
      </div>
      <Field label={`Weightage (%) — ${remaining}% remaining, min 10%`} required error={errs.weightage}>
        <input style={inpStyle(errs.weightage)} type="number" min="10" max={remaining} value={form.weightage} onChange={e => set("weightage", e.target.value)} placeholder="e.g. 30" />
      </Field>
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button onClick={onClose} style={{ flex:1, padding:"10px", border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Cancel</button>
        <button onClick={submit} style={{ flex:2, padding:"10px", border:"none", borderRadius:12, background:"#10b981", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>
          {isEdit ? "Save Changes" : "Add Goal"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// CHECK-IN MODAL (Employee)
// ═══════════════════════════════════════════════════════
function CheckinModal({ goal, quarter, onSave, onClose }) {
  const existing = goal.achievements?.[quarter] || {};
  const [actual, setActual] = useState(existing.actual ?? "");
  const [status, setStatus] = useState(existing.status || "On Track");
  const [err, setErr]       = useState("");
  const liveScore = actual !== "" && !isNaN(+actual) ? calcScore({ ...goal, achievements:{ [quarter]:{ actual:+actual } } }, quarter) : null;

  const submit = () => {
    if (actual === "" || isNaN(+actual)) { setErr("Enter a valid numeric value"); return; }
    onSave(goal.id, quarter, { actual:+actual, status, mc: existing.mc || "" });
  };

  return (
    <Modal title={`${quarter} Check-in — ${goal.title}`} onClose={onClose}>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:12, marginBottom: 24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12 }}>
        <div><span style={{ color:"#64748b" }}>Target</span><br/><strong style={{ fontSize:14 }}>{goal.uom === "zero" ? "0 (Zero = 100%)" : fmtNum(goal.target)}</strong></div>
        <div><span style={{ color:"#64748b" }}>Measurement</span><br/><strong style={{ fontSize:14 }}>{UOM_OPTIONS.find(o => o.v === goal.uom)?.l?.split("—")[0]?.trim()}</strong></div>
      </div>
      <Field label={goal.uom === "zero" ? "Actual Value (enter 0 for zero incidents)" : "Actual Achievement"} required error={err}>
        <input type="number" style={inpStyle(!!err)} value={actual} onChange={e => { setActual(e.target.value); setErr(""); }} placeholder="Enter actual value achieved" autoFocus />
      </Field>
      {liveScore !== null && (
        <div style={{ background: liveScore >= 100 ? "#dcfce7" : liveScore >= 75 ? "#dbeafe" : "#fef3c7", border:"1px solid #1e293b", borderRadius:12, padding:"10px 12px", marginBottom:12, fontSize:13 }}>
          <span style={{ color:"#e2e8f0" }}>Progress Score: </span>
          <strong style={{ fontSize:16, color: liveScore >= 100 ? "#34d399" : liveScore >= 75 ? "#60a5fa" : "#fcd34d" }}>{liveScore.toFixed(1)}%</strong>
          <span style={{ color:"#64748b", fontSize:11, marginLeft:8 }}>(weighted: {((liveScore * goal.weightage) / 100).toFixed(1)} pts)</span>
        </div>
      )}
      <Field label="Goal Status">
        <div style={{ display:"flex", gap:8 }}>
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{ flex:1, padding:"8px 4px", borderRadius:12, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${status === s ? "#10b981" : "#1e293b"}`, background:status === s ? "#f0f0ff" : "#fff", color:status === s ? "#10b981" : "#94a3b8" }}>{s}</button>
          ))}
        </div>
      </Field>
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button onClick={onClose} style={{ flex:1, padding:"10px", border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Cancel</button>
        <button onClick={submit} style={{ flex:2, padding:"10px", border:"none", borderRadius:12, background:"#10b981", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>Save Check-in</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// APPROVE MODAL (Manager)
// ═══════════════════════════════════════════════════════
function ApproveModal({ goal, onApprove, onReturn, onClose }) {
  const [wt, setWt]          = useState(goal.weightage);
  const [tgt, setTgt]        = useState(goal.target);
  const [reason, setReason]  = useState("");
  const [showReturn, setShow]= useState(false);
  const emp = USERS.find(u => u.id === goal.empId);

  return (
    <Modal title="Review & Approve Goal" onClose={onClose} wide>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#0f172a", borderRadius:16, marginBottom: 24 }}>
        <Avt name={emp?.name} />
        <div><p style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>{emp?.name}</p><p style={{ margin:0, fontSize:12, color:"#64748b" }}>{emp?.dept}</p></div>
        <Badge s={goal.status} />
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:16, padding:14, marginBottom:14 }}>
        <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:700, color:"#f8fafc" }}>{goal.title}</p>
        <p style={{ margin:"0 0 8px", fontSize:12, color:"#94a3b8" }}>{goal.desc}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, fontSize:12 }}>
          {[["Thrust Area", goal.thrustArea], ["UoM", UOM_OPTIONS.find(o=>o.v===goal.uom)?.v?.toUpperCase()], ["Submitted", goal.createdAt]].map(([l,v]) => (
            <div key={l} style={{ background:"#0f172a", borderRadius:6, padding:"8px 10px" }}>
              <span style={{ color:"#64748b" }}>{l}</span><br/>
              <strong style={{ color:"#e2e8f0" }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
      <div style={{ border:"1px solid #1e293b", borderRadius:16, padding:14, marginBottom:14 }}>
        <p style={{ margin:"0 0 10px", fontSize:12, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>Inline Edit (optional)</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Weightage (%)"><input type="number" style={inpStyle(false)} value={wt} onChange={e=>setWt(+e.target.value)} min="10" max="100" /></Field>
          <Field label="Target Value"><input type="number" style={inpStyle(false)} value={tgt} onChange={e=>setTgt(+e.target.value)} disabled={goal.uom==="zero"} /></Field>
        </div>
      </div>
      {showReturn ? (
        <>
          <Field label="Reason for Returning (shown to employee)">
            <textarea style={{ ...inpStyle(false), height:80, resize:"vertical" }} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain what needs to be changed…" autoFocus />
          </Field>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShow(false)} style={{ flex:1, padding:10, border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Back</button>
            <button onClick={()=>onReturn(goal.id,reason)} style={{ flex:2, padding:10, border:"none", borderRadius:12, background:"#fbbf24", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>↩ Confirm Return</button>
          </div>
        </>
      ) : (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={{ padding:"10px 14px", border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Cancel</button>
          <button onClick={()=>setShow(true)} style={{ flex:1, padding:10, border:"1.5px solid #78350f", borderRadius:12, background:"#451a03", cursor:"pointer", fontSize:13, fontWeight:600, color:"#fcd34d" }}>↩ Return for Rework</button>
          <button onClick={()=>onApprove(goal.id,{weightage:wt,target:tgt})} style={{ flex:2, padding:10, border:"none", borderRadius:12, background:"#34d399", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>✓ Approve Goal</button>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// MANAGER COMMENT MODAL
// ═══════════════════════════════════════════════════════
function MgrCommentModal({ goal, quarter, onSave, onClose }) {
  const existing = goal.achievements?.[quarter]?.mc || "";
  const [comment, setComment] = useState(existing);
  const sc = calcScore(goal, quarter);

  return (
    <Modal title={`Check-in Comment — ${quarter}`} onClose={onClose}>
      <div style={{ background:"#0f172a", borderRadius:12, padding:12, marginBottom:14 }}>
        <p style={{ margin:"0 0 8px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>{goal.title}</p>
        {goal.achievements?.[quarter] && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:12 }}>
            {[["Target", fmtNum(goal.target)], ["Actual", fmtNum(goal.achievements[quarter].actual)], ["Score", sc!==null?sc.toFixed(1)+"%":"—"]].map(([l,v]) => (
              <div key={l}><span style={{ color:"#64748b" }}>{l}</span><br/><strong style={{ color:"#e2e8f0" }}>{v}</strong></div>
            ))}
          </div>
        )}
      </div>
      <Field label="Manager's Check-in Comment (documented for audit)">
        <textarea style={{ ...inpStyle(false), height:100, resize:"vertical" }} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Provide structured feedback on this quarter's performance…" autoFocus />
      </Field>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onClose} style={{ flex:1, padding:10, border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Cancel</button>
        <button onClick={()=>onSave(goal.id,quarter,comment)} style={{ flex:2, padding:10, border:"none", borderRadius:12, background:"#10b981", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>Save Comment</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// UNLOCK MODAL (Admin)
// ═══════════════════════════════════════════════════════
function UnlockModal({ goal, onUnlock, onClose }) {
  const emp = USERS.find(u => u.id === goal.empId);
  return (
    <Modal title="Unlock Goal for Editing" onClose={onClose}>
      <div style={{ background:"#451a03", border:"1px solid #78350f", borderRadius:12, padding:12, marginBottom:14, fontSize:13, color:"#92400e" }}>
        ⚠️ Unlocking will change status to <strong>Returned</strong> and allow the employee to edit. This action is permanently logged in the audit trail.
      </div>
      <div style={{ background:"#0f172a", borderRadius:12, padding:12, marginBottom:14 }}>
        <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>{goal.title}</p>
        <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{emp?.name} · {emp?.dept}</p>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onClose} style={{ flex:1, padding:10, border:"1px solid #1e293b", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:13, color:"#94a3b8" }}>Cancel</button>
        <button onClick={()=>onUnlock(goal.id)} style={{ flex:2, padding:10, border:"none", borderRadius:12, background:"#fbbf24", cursor:"pointer", fontSize:13, fontWeight:700, color:"#fff" }}>🔓 Unlock Goal</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// EMPLOYEE — DASHBOARD
// ═══════════════════════════════════════════════════════
function EmpDashboard({ goals, cycle }) {
  const approved = goals.filter(g => g.status === "approved");
  const totalWt  = goals.reduce((s,g) => s + g.weightage, 0);
  const q2Score  = calcWeighted(approved, cycle.active);
  const qData    = QUARTERS.map(q => ({ q, score: calcWeighted(approved, q) })).filter(x => x.score !== null);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 24, marginBottom: 24 }}>
        <StatCard label="Total Goals"     value={goals.length}              sub={`${8-goals.length} slots left · max 8`}        accent="#10b981" />
        <StatCard label="Total Weightage" value={totalWt + "%"}             sub={totalWt===100 ? "✓ Ready to submit" : "⚠ Must equal 100%"} accent={totalWt===100?"#34d399":"#fbbf24"} />
        <StatCard label={cycle.active+" Score"} value={q2Score?q2Score+"%":"—"}   sub="Weighted progress score"                   accent="#34d399" />
        <StatCard label="Pending Action"  value={goals.filter(g=>["draft","returned"].includes(g.status)).length} sub={`${goals.filter(g=>g.status==="submitted").length} awaiting approval`} accent="#fbbf24" />
      </div>

      {qData.length > 0 && (
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", marginBottom: 24 }}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>📈 Quarterly Progress Trend</h3>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={qData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="q" tick={{fontSize:11}}/>
              <YAxis domain={[0,120]} tick={{fontSize:11}} unit="%"/>
              <Tooltip formatter={v=>[v.toFixed(1)+"%","Score"]}/>
              <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#g1)" strokeWidth={2} dot={{r:5,fill:"#10b981"}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #1e293b", background:"#0f172a" }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>My Goal Summary</h3>
        </div>
        {goals.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"#64748b", fontSize:13 }}>No goals yet. Head to "My Goals" tab to get started.</div>
        ) : goals.map(g => {
          const sc = calcScore(g, cycle.active);
          return (
            <div key={g.id} style={{ padding:"20px 24px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"#f8fafc" }}>{g.title}</span>
                  <Badge s={g.status}/>
                  {g.shared && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"#064e3b", color:"#6d28d9", fontWeight:600 }}>Shared</span>}
                </div>
                <p style={{ margin:"2px 0 0", fontSize:11, color:"#64748b" }}>{g.thrustArea}</p>
                {sc !== null && <PBar score={sc}/>}
              </div>
              <div style={{ textAlign:"right", flexShrink:0, fontSize:12 }}>
                {sc !== null && <p style={{ margin:"0 0 2px", fontWeight:700, color:"#e2e8f0" }}>{sc.toFixed(1)}%</p>}
                <span style={{ color:"#64748b" }}>{g.weightage}% wt</span>
              </div>
             </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EMPLOYEE — MY GOALS
// ═══════════════════════════════════════════════════════
function MyGoals({ goals, onOpenModal, onSubmit, onDelete }) {
  const totalWt   = goals.reduce((s,g) => s + g.weightage, 0);
  const canSubmit = goals.some(g => ["draft","returned"].includes(g.status)) && totalWt === 100;
  const pct       = Math.min(totalWt, 100);
  const barColor  = totalWt === 100 ? "#34d399" : totalWt > 100 ? "#f87171" : "#fbbf24";

  return (
    <div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", marginBottom: 24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, fontSize:13 }}>
          <span style={{ fontWeight:600, color:"#e2e8f0" }}>Total Weightage</span>
          <span style={{ fontWeight:800, color:barColor }}>{totalWt}% / 100%</span>
        </div>
        <div style={{ background:"#1e293b", borderRadius:99, height:7 }}>
          <div style={{ width:`${pct}%`, height:7, borderRadius:99, background:barColor, transition:"width .4s" }}/>
        </div>
        {totalWt !== 100 && <p style={{ fontSize:11, color:totalWt>100?"#f87171":"#fbbf24", marginTop:5 }}>
          {totalWt < 100 ? `${100-totalWt}% more needed to submit` : `Over by ${totalWt-100}% — reduce some goal weightages`}
        </p>}
      </div>

      <div style={{ display:"flex", gap: 16, marginBottom: 24, alignItems:"center" }}>
        {goals.length < 8 && (
          <button onClick={()=>onOpenModal({type:"goalForm",data:null})} style={{ padding:"9px 16px", background:"#10b981", border:"none", borderRadius:12, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Add Goal</button>
        )}
        {canSubmit && (
          <button onClick={onSubmit} style={{ padding:"9px 16px", background:"#34d399", border:"none", borderRadius:12, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>↑ Submit for Approval</button>
        )}
        <span style={{ fontSize:11, color:"#64748b", marginLeft:"auto" }}>{goals.length}/8 goals</span>
      </div>

      {goals.length === 0 ? (
        <div style={{ border:"2px dashed #1e293b", borderRadius:24, padding:48, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🎯</div>
          <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#e2e8f0" }}>No goals yet</p>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>Click "Add Goal" to create your first goal for this cycle</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
          {goals.map(g => {
            const locked = g.locked || g.status === "approved";
            return (
              <div key={g.id} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", borderLeft:`4px solid ${g.status==="approved"?"#34d399":g.status==="submitted"?"#10b981":g.status==="returned"?"#fbbf24":"#1e293b"}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:"#f8fafc" }}>{g.title}</span>
                      <Badge s={g.status}/>
                      {locked && <span style={{ fontSize:11, color:"#64748b" }}>🔒 Locked</span>}
                      {g.shared && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"#064e3b", color:"#6d28d9", fontWeight:600 }}>Shared</span>}
                    </div>
                    <p style={{ margin:"0 0 2px", fontSize:12, color:"#64748b" }}>{g.thrustArea}</p>
                    {g.desc && <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>{g.desc}</p>}
                    {g.status === "returned" && <div style={{ marginTop:6, padding:"6px 10px", background:"#451a03", borderRadius:6, fontSize:12, color:"#92400e" }}>↩ Returned for rework — please edit and resubmit</div>}
                  </div>
                  <div style={{ display:"flex", gap:16, alignItems:"center", flexShrink:0 }}>
                    <div style={{ textAlign:"right", fontSize:11 }}>
                      <p style={{ margin:0, color:"#64748b" }}>Weight</p>
                      <p style={{ margin:0, fontWeight:700, fontSize:16, color:"#e2e8f0" }}>{g.weightage}%</p>
                    </div>
                    <div style={{ textAlign:"right", fontSize:11 }}>
                      <p style={{ margin:0, color:"#64748b" }}>Target</p>
                      <p style={{ margin:0, fontWeight:700, fontSize:13, color:"#e2e8f0" }}>{g.uom==="zero"?"0":fmtNum(g.target)}</p>
                    </div>
                    {!locked && (
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>onOpenModal({type:"goalForm",data:g})} style={{ padding:"6px 8px", border:"1px solid #1e293b", borderRadius:6, background:"#0f172a", cursor:"pointer", fontSize:12, color:"#94a3b8" }}>✏</button>
                        <button onClick={()=>onDelete(g.id)} style={{ padding:"6px 8px", border:"1px solid #fee2e2", borderRadius:6, background:"#0f172a", cursor:"pointer", fontSize:12, color:"#f87171" }}>🗑</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EMPLOYEE — CHECK-INS
// ═══════════════════════════════════════════════════════
function EmpCheckin({ goals, cycle, onOpenModal }) {
  const approved = goals.filter(g => g.status === "approved");

  return (
    <div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", marginBottom: 24 }}>
        <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Check-in Schedule FY 2024-25</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 16 }}>
          {[{q:"Goal Setting",window:"May",active:false,done:true},{q:"Q1",window:"July",active:false,done:approved.some(g=>g.achievements.Q1)},{q:"Q2",window:"October",active:true,done:approved.some(g=>g.achievements.Q2)},{q:"Q3",window:"January",active:false,done:false},{q:"Q4",window:"Mar/Apr",active:false,done:false}].filter(x=>x.q!=="Goal Setting").map(item=>(
            <div key={item.q} style={{ borderRadius:12, padding:"10px 12px", textAlign:"center", border:`1.5px solid ${item.active?"#10b981":item.done?"#047857":"#1e293b"}`, background:item.active?"#f0f0ff":item.done?"#f0fdf4":"#1e293b" }}>
              <p style={{ margin:0, fontWeight:800, fontSize:14, color:item.active?"#10b981":item.done?"#34d399":"#64748b" }}>{item.q}</p>
              <p style={{ margin:"2px 0 4px", fontSize:10, color:"#64748b" }}>{item.window}</p>
              <span style={{ fontSize:11 }}>{item.active?"🟢 Active":item.done?"✅ Done":"⬜ Upcoming"}</span>
            </div>
          ))}
        </div>
      </div>

      {QUARTERS.map(q => {
        const wScore = calcWeighted(approved, q);
        const isActive = q === cycle.active && cycle.checkinOpen;
        return (
          <div key={q} style={{ background:"#0f172a", border:`1px solid ${isActive?"#064e3b":"#1e293b"}`, borderRadius:24, marginBottom:14, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", background:isActive?"#f0f0ff":"#1e293b", borderBottom:`1px solid ${isActive?"#064e3b":"#1e293b"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap: 16 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#f8fafc" }}>{q} — {Q_WINDOWS[q]}</span>
                {isActive && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, background:"#10b981", color:"#fff", fontWeight:700 }}>Active Window</span>}
              </div>
              {wScore !== null && <span style={{ fontSize:14, fontWeight:800, color:"#10b981" }}>Score: {wScore}%</span>}
            </div>
            {approved.length === 0 ? (
              <div style={{ padding:20, textAlign:"center", fontSize:12, color:"#64748b" }}>No approved goals to check in on.</div>
            ) : (
              <div>
                {approved.map(g => {
                  const a   = g.achievements[q];
                  const sc  = calcScore(g, q);
                  return (
                    <div key={g.id} style={{ padding:"20px 24px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:600, color:"#f8fafc" }}>{g.title}</p>
                        <p style={{ margin:0, fontSize:11, color:"#64748b" }}>{g.thrustArea} · Target: {fmtNum(g.target)}</p>
                        {a && sc !== null && <PBar score={sc}/>}
                        {a?.mc && <p style={{ margin:"4px 0 0", fontSize:11, color:"#10b981", background:"#064e3b", padding:"4px 8px", borderRadius:6 }}>💬 {a.mc}</p>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap: 16, flexShrink:0 }}>
                        {a ? (
                          <div style={{ textAlign:"right" }}>
                            <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>{fmtNum(a.actual)}</p>
                            {sc !== null && <p style={{ margin:0, fontSize:12, fontWeight:700, color: sc>=100?"#34d399":sc>=75?"#10b981":"#fbbf24" }}>{sc.toFixed(1)}%</p>}
                            <Badge s={a.status}/>
                          </div>
                        ) : <span style={{ fontSize:12, color:"#64748b" }}>Not submitted</span>}
                        {isActive && (
                          <button onClick={()=>onOpenModal({type:"checkin",data:{goal:g,quarter:q}})} style={{ padding:"7px 12px", background:"#10b981", border:"none", borderRadius:7, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>
                            {a ? "Update" : "Enter"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MANAGER — DASHBOARD
// ═══════════════════════════════════════════════════════
function MgrDashboard({ user, goals, cycle }) {
  const myEmps = USERS.filter(u => u.managerId === user.id);
  const pending = goals.filter(g => g.status === "submitted");
  const approved = goals.filter(g => g.status === "approved");

  const barData = myEmps.map(emp => {
    const eg = goals.filter(g => g.empId === emp.id && g.status === "approved");
    const sc = calcWeighted(eg, cycle.active);
    return { name: emp.name.split(" ")[0], score: sc, checked: eg.filter(g=>g.achievements[cycle.active]).length, total: eg.length };
  });

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 24, marginBottom: 24 }}>
        <StatCard label="Team Members"     value={myEmps.length}   sub="direct reports"         accent="#10b981"/>
        <StatCard label="Pending Approval" value={pending.length}  sub="goals awaiting review"  accent="#fbbf24"/>
        <StatCard label="Approved Goals"   value={approved.length} sub="active & locked"         accent="#34d399"/>
        <StatCard label="Check-ins Done"   value={barData.filter(d=>d.checked>0).length} sub={`of ${myEmps.length} for ${cycle.active}`} accent="#34d399"/>
      </div>

      {barData.length > 0 && (
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", marginBottom: 24 }}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Team {cycle.active} Progress Overview</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis domain={[0,120]} tick={{fontSize:11}} unit="%"/>
              <Tooltip formatter={v=>v?[v.toFixed(1)+"%","Score"]:["No data",""]}/>
              <Bar dataKey="score" fill="#10b981" radius={[5,5,0,0]} name="Score"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ background:"#451a03", border:"1px solid #78350f", borderRadius:24, padding:"20px 24px" }}>
          <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:"#92400e" }}>⏳ {pending.length} goal(s) pending approval</p>
          <p style={{ margin:0, fontSize:12, color:"#fcd34d" }}>Go to "Team Goals" → Pending to review and approve.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MANAGER — TEAM GOALS
// ═══════════════════════════════════════════════════════
function TeamGoals({ goals, onOpenModal }) {
  const [filter, setFilter] = useState("submitted");
  const filtered = filter === "all" ? goals : goals.filter(g => g.status === filter);
  const tabs = [["submitted","Pending","#fbbf24"],["approved","Approved","#34d399"],["returned","Returned","#fcd34d"],["all","All","#94a3b8"]];

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom: 24 }}>
        {tabs.map(([key,label,c]) => (
          <button key={key} onClick={()=>setFilter(key)} style={{ padding:"7px 14px", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer", border:`1.5px solid ${filter===key?c:"#1e293b"}`, background:filter===key?"#fff":"#fff", color:filter===key?c:"#64748b" }}>
            {label} {key!=="all" && `(${goals.filter(g=>g.status===key).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ border:"2px dashed #1e293b", borderRadius:24, padding:40, textAlign:"center", fontSize:13, color:"#64748b" }}>No goals with status "{filter}"</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
          {filtered.map(g => {
            const emp = USERS.find(u => u.id === g.empId);
            return (
              <div key={g.id} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", borderLeft:`4px solid ${g.status==="approved"?"#34d399":g.status==="submitted"?"#10b981":g.status==="returned"?"#fbbf24":"#1e293b"}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <Avt name={emp?.name}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontSize:11, color:"#64748b" }}>{emp?.name}</span>
                      <Badge s={g.status}/>
                    </div>
                    <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>{g.title}</p>
                    <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{g.thrustArea} · {g.weightage}% weight · Target: {fmtNum(g.target)}</p>
                    {g.desc && <p style={{ margin:"4px 0 0", fontSize:12, color:"#94a3b8" }}>{g.desc}</p>}
                  </div>
                  {g.status === "submitted" && (
                    <button onClick={()=>onOpenModal({type:"approveGoal",data:g})} style={{ padding:"8px 14px", background:"#10b981", border:"none", borderRadius:12, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, flexShrink:0 }}>Review →</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MANAGER — CHECK-IN REVIEW
// ═══════════════════════════════════════════════════════
function MgrCheckin({ user, goals, onOpenModal }) {
  const approved = goals.filter(g => g.status === "approved");
  const empIds   = [...new Set(approved.map(g => g.empId))];
  const emps     = empIds.map(id => USERS.find(u => u.id === id)).filter(Boolean);

  return (
    <div>
      {emps.length === 0 ? (
        <div style={{ border:"2px dashed #1e293b", borderRadius:24, padding:40, textAlign:"center", fontSize:13, color:"#64748b" }}>No approved goals in your team yet.</div>
      ) : emps.map(emp => {
        const eg = approved.filter(g => g.empId === emp.id);
        return (
          <div key={emp.id} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", marginBottom:14, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", background:"#0f172a", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap: 16 }}>
              <Avt name={emp.name}/>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>{emp.name}</p>
                <p style={{ margin:0, fontSize:11, color:"#64748b" }}>{emp.dept}</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {QUARTERS.map(q => { const sc=calcWeighted(eg,q); return sc!==null?<span key={q} style={{ fontSize:11, padding:"3px 8px", borderRadius:99, background:"#064e3b", color:"#10b981", fontWeight:700 }}>{q}: {sc}%</span>:null; })}
              </div>
            </div>
            {QUARTERS.map(q => {
              const hasData = eg.some(g => g.achievements[q]);
              if (!hasData) return null;
              return (
                <div key={q} style={{ padding:"10px 16px", borderBottom:"1px solid #1e293b" }}>
                  <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px" }}>{q} Check-in</p>
                  {eg.map(g => {
                    const a = g.achievements[q];
                    if (!a) return null;
                    const sc = calcScore(g, q);
                    return (
                      <div key={g.id} style={{ display:"flex", alignItems:"center", gap: 16, padding:"6px 0", borderBottom:"1px solid #1e293b" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{g.title}</p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:"#64748b" }}>Target: {fmtNum(g.target)} · Actual: {fmtNum(a.actual)}</p>
                          {a.mc && <p style={{ margin:"2px 0 0", fontSize:11, color:"#10b981", background:"#064e3b", display:"inline-block", padding:"2px 6px", borderRadius:4 }}>💬 {a.mc}</p>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                          <Badge s={a.status}/>
                          {sc !== null && <span style={{ fontSize:12, fontWeight:800, color:"#e2e8f0" }}>{sc.toFixed(1)}%</span>}
                          <button onClick={()=>onOpenModal({type:"mgrComment",data:{goal:g,quarter:q}})} style={{ fontSize:11, padding:"5px 10px", border:"1px solid #064e3b", borderRadius:6, background:"#064e3b", color:"#10b981", cursor:"pointer", fontWeight:600 }}>💬 Comment</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {!eg.some(g => QUARTERS.some(q => g.achievements[q])) && (
              <div style={{ padding:20, textAlign:"center", fontSize:12, color:"#64748b" }}>No check-in data submitted yet.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MANAGER — PUSH SHARED GOAL
// ═══════════════════════════════════════════════════════
function SharedGoalPush({ user, onPush, notify }) {
  const myEmps = USERS.filter(u => u.managerId === user.id);
  const [form, setForm]       = useState({ thrustArea:"", title:"", desc:"", uom:"min", target:"", weightage:20 });
  const [selected, setSelected] = useState([]);
  const [err, setErr]         = useState("");
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const push = () => {
    if (!form.title||!form.thrustArea||selected.length===0||(!form.target&&form.uom!=="zero")) { setErr("Fill all fields and select at least one employee."); return; }
    if (+form.weightage < 10) { setErr("Minimum weightage is 10%"); return; }
    onPush(selected, { ...form, weightage:+form.weightage, target:form.uom==="zero"?0:+form.target });
    setForm({ thrustArea:"", title:"", desc:"", uom:"min", target:"", weightage:20 });
    setSelected([]);
    setErr("");
  };

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ background:"#064e3b", border:"1px solid #c4b5fd", borderRadius:16, padding:"10px 14px", marginBottom: 24, fontSize:13, color:"#34d399" }}>
        📤 Push a <strong>shared / departmental KPI</strong> to employees. Recipients can adjust weightage only — goal title and target are read-only.
      </div>
      {err && <div style={{ background:"#450a0a", border:"1px solid #7f1d1d", borderRadius:12, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#b91c1c" }}>{err}</div>}
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:16, marginBottom:14 }}>
        <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Shared Goal Details</h3>
        <Field label="Thrust Area" required><select style={inpStyle(false)} value={form.thrustArea} onChange={e=>set("thrustArea",e.target.value)}><option value="">Select…</option>{THRUST_AREAS.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="KPI / Goal Title" required><input style={inpStyle(false)} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Q2 Departmental Revenue Target"/></Field>
        <Field label="Description"><textarea style={{...inpStyle(false),height:56,resize:"vertical"}} value={form.desc} onChange={e=>set("desc",e.target.value)}/></Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="UoM"><select style={inpStyle(false)} value={form.uom} onChange={e=>set("uom",e.target.value)}>{UOM_OPTIONS.map(o=><option key={o.v} value={o.v}>{o.l.split("—")[0]}</option>)}</select></Field>
          <Field label="Target"><input type="number" style={inpStyle(false)} value={form.uom==="zero"?"0":form.target} disabled={form.uom==="zero"} onChange={e=>set("target",e.target.value)}/></Field>
        </div>
        <Field label="Default Weightage for Recipients (%)"><input type="number" style={inpStyle(false)} value={form.weightage} onChange={e=>set("weightage",+e.target.value)} min="10" max="100"/></Field>
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:16, marginBottom:14 }}>
        <h3 style={{ margin:"0 0 10px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Select Recipients</h3>
        {myEmps.map(emp => (
          <label key={emp.id} style={{ display:"flex", alignItems:"center", gap: 16, padding:"10px 12px", border:`1.5px solid ${selected.includes(emp.id)?"#10b981":"#1e293b"}`, borderRadius:16, marginBottom:8, cursor:"pointer", background:selected.includes(emp.id)?"#f0f0ff":"#fff" }}>
            <input type="checkbox" checked={selected.includes(emp.id)} onChange={()=>toggle(emp.id)} style={{ accentColor:"#10b981" }}/>
            <Avt name={emp.name}/>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#f8fafc" }}>{emp.name}</p>
              <p style={{ margin:0, fontSize:11, color:"#64748b" }}>{emp.dept}</p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={push} style={{ width:"100%", padding:"11px", background:"#10b981", border:"none", borderRadius:16, color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700 }}>
        📤 Push to {selected.length || "Selected"} Employee(s)
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN — DASHBOARD
// ═══════════════════════════════════════════════════════
function AdminDashboard({ goals, auditLog, cycle }) {
  const employees = USERS.filter(u => u.role === "employee");
  const approved  = goals.filter(g => g.status === "approved");
  const pending   = goals.filter(g => g.status === "submitted");
  const depts     = [...new Set(employees.map(e => e.dept))];

  const statusDist = [
    { name:"Approved",  v:approved.length  },
    { name:"Submitted", v:pending.length   },
    { name:"Draft",     v:goals.filter(g=>g.status==="draft").length    },
    { name:"Returned",  v:goals.filter(g=>g.status==="returned").length },
  ].filter(x=>x.v>0);

  const deptData = depts.map(dept => {
    const eids = employees.filter(e=>e.dept===dept).map(e=>e.id);
    const dg   = goals.filter(g=>eids.includes(g.empId)&&g.status==="approved");
    return { dept, total:dg.length, done:dg.filter(g=>g.achievements[cycle.active]).length };
  });

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 24, marginBottom: 24 }}>
        <StatCard label="Total Employees"  value={employees.length}   sub="active in portal"        accent="#10b981"/>
        <StatCard label="Goals Approved"   value={approved.length}    sub="locked & tracking"        accent="#34d399"/>
        <StatCard label="Pending Approval" value={pending.length}     sub="awaiting manager review"  accent="#fbbf24"/>
        <StatCard label="Audit Events"     value={auditLog.length}    sub="logged since cycle start" accent="#34d399"/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
          <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Goal Status Distribution</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={statusDist} dataKey="v" cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} label={({name,v})=>`${name}: ${v}`} labelLine={false}>
                {statusDist.map((_,i) => <Cell key={i} fill={CH_COLS[i]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
          <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>{cycle.active} Check-in by Department</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="dept" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Bar dataKey="done"  name="Done"  fill="#34d399" radius={[4,4,0,0]}/>
              <Bar dataKey="total" name="Total" fill="#1e293b" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", background:"#0f172a", borderBottom:"1px solid #1e293b" }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>Employee Completion Dashboard — {cycle.active}</h3>
        </div>
        {employees.map(emp => {
          const eg     = goals.filter(g=>g.empId===emp.id);
          const appr   = eg.filter(g=>g.status==="approved");
          const chkDone= appr.filter(g=>g.achievements[cycle.active]).length;
          const totWt  = eg.reduce((s,g)=>s+g.weightage,0);
          const mgr    = USERS.find(u=>u.id===emp.managerId);
          const complete= appr.length>0&&chkDone===appr.length;
          return (
            <div key={emp.id} style={{ padding:"20px 24px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:12 }}>
              <Avt name={emp.name}/>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#f8fafc" }}>{emp.name}</p>
                <p style={{ margin:0, fontSize:11, color:"#64748b" }}>{emp.dept} · Mgr: {mgr?.name||"—"}</p>
              </div>
              {[["Goals",eg.length,"#e2e8f0"],["Wt%",totWt+"%",totWt===100?"#34d399":totWt>100?"#f87171":"#fbbf24"],["Pending",eg.filter(g=>g.status==="submitted").length,"#fbbf24"],[`${cycle.active} CI`,`${chkDone}/${appr.length}`,chkDone>0?"#34d399":"#64748b"]].map(([l,v,c])=>(
                <div key={l} style={{ textAlign:"center", fontSize:11, marginRight:8 }}>
                  <p style={{ margin:0, color:"#64748b" }}>{l}</p>
                  <p style={{ margin:0, fontWeight:700, color:c }}>{v}</p>
                </div>
              ))}
              <span style={{ fontSize:10, padding:"4px 10px", borderRadius:99, fontWeight:700, background:complete?"#dcfce7":appr.length===0?"#1e293b":"#fef3c7", color:complete?"#34d399":appr.length===0?"#64748b":"#fcd34d" }}>
                {appr.length===0?"No Goals":complete?"✓ Complete":"Pending"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN — ALL GOALS
// ═══════════════════════════════════════════════════════
function AllGoals({ goals, onOpenModal }) {
  const [search, setSearch]   = useState("");
  const [sf, setSf]           = useState("all");
  const [df, setDf]           = useState("all");
  const depts = [...new Set(USERS.map(u=>u.dept))];
  const filtered = goals.filter(g => {
    const emp = USERS.find(u=>u.id===g.empId);
    return (!search||(g.title+emp?.name).toLowerCase().includes(search.toLowerCase()))
      && (sf==="all"||g.status===sf)
      && (df==="all"||emp?.dept===df);
  });

  return (
    <div>
      <div style={{ display:"flex", gap: 16, marginBottom:14, flexWrap:"wrap" }}>
        <input style={{ flex:1, minWidth:180, border:"1px solid #1e293b", borderRadius:12, padding:"8px 12px", fontSize:13, outline:"none" }} placeholder="Search goals or employees…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{ border:"1px solid #1e293b", borderRadius:12, padding:"8px 10px", fontSize:12, outline:"none" }} value={sf} onChange={e=>setSf(e.target.value)}>
          <option value="all">All Statuses</option>
          {["approved","submitted","draft","returned"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={{ border:"1px solid #1e293b", borderRadius:12, padding:"8px 10px", fontSize:12, outline:"none" }} value={df} onChange={e=>setDf(e.target.value)}>
          <option value="all">All Depts</option>
          {depts.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr 1.5fr 60px 80px 70px", gap:8, padding:"10px 14px", background:"#0f172a", borderBottom:"1px solid #1e293b", fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          <span>Employee</span><span>Goal</span><span>Thrust Area</span><span>Wt</span><span>Status</span><span>Action</span>
        </div>
        {filtered.length===0 ? (
          <div style={{ padding:32, textAlign:"center", fontSize:13, color:"#64748b" }}>No goals match your filters</div>
        ) : filtered.map(g => {
          const emp = USERS.find(u=>u.id===g.empId);
          return (
            <div key={g.id} style={{ display:"grid", gridTemplateColumns:"2fr 3fr 1.5fr 60px 80px 70px", gap:8, padding:"11px 14px", borderBottom:"1px solid #1e293b", alignItems:"center", fontSize:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Avt name={emp?.name} size="sm"/>
                <div style={{ minWidth:0 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{emp?.name}</p>
                  <p style={{ margin:0, fontSize:10, color:"#64748b" }}>{emp?.dept}</p>
                </div>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#f8fafc", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.title}</p>
                <div style={{ display:"flex", gap:4, marginTop:2, flexWrap:"wrap" }}>
                  {g.shared && <span style={{ fontSize:9, padding:"1px 5px", borderRadius:99, background:"#064e3b", color:"#6d28d9", fontWeight:700 }}>Shared</span>}
                  {g.locked && <span style={{ fontSize:10, color:"#64748b" }}>🔒</span>}
                </div>
              </div>
              <span style={{ color:"#94a3b8", fontSize:11 }}>{g.thrustArea}</span>
              <span style={{ fontWeight:700, color:"#e2e8f0" }}>{g.weightage}%</span>
              <Badge s={g.status}/>
              {g.locked ? (
                <button onClick={()=>onOpenModal({type:"unlockGoal",data:g})} style={{ fontSize:11, padding:"5px 8px", border:"1px solid #78350f", borderRadius:6, background:"#451a03", color:"#fcd34d", cursor:"pointer", fontWeight:600 }}>🔓 Unlock</button>
              ) : <span/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN — CYCLE MANAGEMENT
// ═══════════════════════════════════════════════════════
function CycleMgmt({ notify }) {
  const phases = [
    { phase:"Goal Setting", window:"1st May",    action:"Goal Creation, Submission & Approval", st:"completed" },
    { phase:"Q1 Check-in",  window:"July",        action:"Progress Update — Planned vs. Actual", st:"completed" },
    { phase:"Q2 Check-in",  window:"October",     action:"Progress Update — Planned vs. Actual", st:"active"    },
    { phase:"Q3 Check-in",  window:"January",     action:"Progress Update — Planned vs. Actual", st:"upcoming"  },
    { phase:"Q4 / Annual",  window:"March/April", action:"Final Achievement Capture",            st:"upcoming"  },
  ];
  const stColor = { completed:"#34d399", active:"#10b981", upcoming:"#64748b" };
  return (
    <div style={{ maxWidth:620 }}>
      <div style={{ background:"#1e3a8a", border:"1px solid #1e3a8a", borderRadius:16, padding:"10px 14px", marginBottom: 24, fontSize:13, color:"#60a5fa" }}>
        <strong>Active Window:</strong> Q2 Check-in (October) · Employees may now log Q2 actuals
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", overflow:"hidden", marginBottom: 24 }}>
        <div style={{ padding:"20px 24px", background:"#0f172a", borderBottom:"1px solid #1e293b" }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#f8fafc" }}>FY 2024-25 Cycle Schedule</h3>
        </div>
        {phases.map((p,i) => (
          <div key={i} style={{ padding:"24px 28px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:stColor[p.st], flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#f8fafc" }}>{p.phase}</span>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, fontWeight:700, background:p.st==="completed"?"#dcfce7":p.st==="active"?"#dbeafe":"#1e293b", color:stColor[p.st] }}>
                  {p.st==="completed"?"✓ Completed":p.st==="active"?"● Active":"Upcoming"}
                </span>
              </div>
              <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{p.action}</p>
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:"#94a3b8", flexShrink:0 }}>{p.window}</span>
            {p.st==="active" && <button onClick={()=>notify("Reminder sent to all employees! 🔔")} style={{ padding:"6px 12px", background:"#10b981", border:"none", borderRadius:7, color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, flexShrink:0 }}>Send Reminder</button>}
          </div>
        ))}
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
        <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>Escalation Rules</h3>
        {[
          ["📧","Auto-remind employees 3 days before check-in window closes"],
          ["⚠️","Escalate to manager if employee hasn't submitted within 5 days of cycle open"],
          ["🔔","Escalate to Admin / HR if manager hasn't approved within 7 days of submission"],
          ["📊","Notify HR if check-in completion < 80% at window midpoint"],
        ].map(([icon,rule],i) => (
          <div key={i} style={{ display:"flex", gap: 16, padding:"9px 12px", background:"#0f172a", borderRadius:12, marginBottom:8, alignItems:"center" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
            <span style={{ fontSize:12, color:"#e2e8f0", flex:1 }}>{rule}</span>
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:"#064e3b", color:"#34d399", fontWeight:700 }}>Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN — AUDIT LOG
// ═══════════════════════════════════════════════════════
function AuditLog({ auditLog }) {
  const [search, setSearch] = useState("");
  const filtered = auditLog.filter(a => !search || [a.goalTitle,a.by,a.empName,a.type].join(" ").toLowerCase().includes(search.toLowerCase()));
  const iconMap = t => t.includes("Approved")?"✅":t.includes("Return")?"↩️":t.includes("Modified")?"✏️":t.includes("Unlock")?"🔓":t.includes("Comment")?"💬":"📝";

  return (
    <div>
      <div style={{ display:"flex", gap: 16, marginBottom:14, alignItems:"center" }}>
        <input style={{ flex:1, border:"1px solid #1e293b", borderRadius:12, padding:"8px 12px", fontSize:13, outline:"none" }} placeholder="Search audit log…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <span style={{ fontSize:11, color:"#64748b" }}>{filtered.length} records</span>
      </div>
      <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", overflow:"hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", fontSize:13, color:"#64748b" }}>No audit records found</div>
        ) : filtered.map(a => (
          <div key={a.id} style={{ padding:"20px 24px", borderBottom:"1px solid #1e293b", display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0, marginTop:2 }}>{iconMap(a.type)}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#f8fafc" }}>{a.type}</span>
                <span style={{ fontSize:11, padding:"1px 7px", borderRadius:99, background:"#1e293b", color:"#94a3b8" }}>{a.goalTitle}</span>
              </div>
              <p style={{ margin:"0 0 2px", fontSize:12, color:"#e2e8f0" }}>{a.detail}</p>
              <p style={{ margin:0, fontSize:11, color:"#64748b" }}>Employee: <strong>{a.empName}</strong> · By: <strong>{a.by}</strong></p>
            </div>
            <span style={{ fontSize:11, color:"#64748b", flexShrink:0, whiteSpace:"nowrap" }}>{a.ts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN — ANALYTICS (Bonus)
// ═══════════════════════════════════════════════════════
function Analytics({ goals }) {
  const employees = USERS.filter(u => u.role === "employee");
  const empNames  = employees.map(e => e.name.split(" ")[0]);

  const qoqData = QUARTERS.map(q => {
    const obj = { q };
    employees.forEach(emp => {
      const eg = goals.filter(g => g.empId===emp.id && g.status==="approved");
      const sc = calcWeighted(eg, q);
      if (sc !== null) obj[emp.name.split(" ")[0]] = sc;
    });
    return obj;
  }).filter(d => Object.keys(d).length > 1);

  const taData = THRUST_AREAS.map(ta => ({ name:ta.split(" ").slice(0,2).join(" "), count:goals.filter(g=>g.thrustArea===ta).length })).filter(d=>d.count>0);
  const uomData = UOM_OPTIONS.map(o => ({ name:o.l.split("—")[0].trim().split(" ").slice(0,2).join(" "), count:goals.filter(g=>g.uom===o.v).length })).filter(d=>d.count>0);
  const empScores = employees.map(emp => {
    const eg = goals.filter(g => g.empId===emp.id&&g.status==="approved");
    return { name:emp.name.split(" ")[0], Q1:calcWeighted(eg,"Q1"), Q2:calcWeighted(eg,"Q2") };
  }).filter(d=>d.Q1||d.Q2);

  return (
    <div>
      {qoqData.length > 0 && (
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px", marginBottom:14 }}>
          <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>📈 Quarter-on-Quarter (QoQ) Progress Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={qoqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="q" tick={{fontSize:11}}/>
              <YAxis domain={[0,120]} tick={{fontSize:11}} unit="%"/>
              <Tooltip formatter={v=>v?[v.toFixed(1)+"%","Score"]:["—",""]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              {empNames.map((n,i) => <Line key={n} type="monotone" dataKey={n} stroke={CH_COLS[i%CH_COLS.length]} strokeWidth={2.5} dot={{r:5}} connectNulls/>)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 24, marginBottom:14 }}>
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
          <h3 style={{ margin:"0 0 10px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>🎯 Goals by Thrust Area</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={taData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis type="number" tick={{fontSize:10}} allowDecimals={false}/>
              <YAxis dataKey="name" type="category" width={90} tick={{fontSize:9}}/>
              <Tooltip/>
              <Bar dataKey="count" name="Goals" radius={[0,5,5,0]}>
                {taData.map((_,i)=><Cell key={i} fill={CH_COLS[i%CH_COLS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
          <h3 style={{ margin:"0 0 10px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>📊 UoM Type Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={uomData} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3}>
                {uomData.map((_,i)=><Cell key={i} fill={CH_COLS[i%CH_COLS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v,n,p)=>[v,p.payload.name]}/>
              <Legend wrapperStyle={{fontSize:10}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {empScores.length > 0 && (
        <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:24, boxShadow:"0 10px 40px -10px rgba(0,0,0,0.5)", padding:"24px 28px" }}>
          <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#f8fafc" }}>👥 Employee Score Comparison — Q1 vs Q2</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={empScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis domain={[0,120]} tick={{fontSize:11}} unit="%"/>
              <Tooltip formatter={v=>v?[v.toFixed(1)+"%","Score"]:["No data",""]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Q1" fill="#10b981" radius={[5,5,0,0]} name="Q1 Score"/>
              <Bar dataKey="Q2" fill="#34d399" radius={[5,5,0,0]} name="Q2 Score"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user,   setUser]   = useState(null);
  const [goals,  setGoals]  = useState(INIT_GOALS);
  const [audit,  setAudit]  = useState(INIT_AUDIT);
  const [tab,    setTab]    = useState("dashboard");
  const [modal,  setModal]  = useState(null);
  const [toast,  setToast]  = useState(null);
  const cycle = { active:"Q2", checkinOpen:true };

  const notify = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const log = (entry) => setAudit(prev => [{ id:newAid(), ...entry, ts:new Date().toLocaleString("en-IN") }, ...prev]);

  const myGoals  = useMemo(() => user ? goals.filter(g => g.empId === user.id) : [], [goals, user]);
  const teamGoals = useMemo(() => {
    if (!user || user.role !== "manager") return [];
    const eids = USERS.filter(u => u.managerId === user.id).map(u => u.id);
    return goals.filter(g => eids.includes(g.empId));
  }, [goals, user]);

  const handleSaveGoal = (data, isEdit) => {
    if (isEdit) {
      setGoals(prev => prev.map(g => g.id===data.id ? {...g,...data} : g));
      notify("Goal updated successfully.");
    } else {
      setGoals(prev => [...prev, { ...data, id:newGid(), empId:user.id, status:"draft", locked:false, shared:false, sharedFrom:null, createdAt:new Date().toISOString().split("T")[0], achievements:{Q1:null,Q2:null,Q3:null,Q4:null} }]);
      notify("Goal added.");
    }
    setModal(null);
  };

  const handleSubmit = () => {
    const drafts = myGoals.filter(g => ["draft","returned"].includes(g.status));
    if (!drafts.length) { notify("No draft goals to submit.", "error"); return; }
    const total = myGoals.reduce((s,g) => s + g.weightage, 0);
    if (total !== 100) { notify(`Total weightage is ${total}%. Must be exactly 100%.`, "error"); return; }
    setGoals(prev => prev.map(g => g.empId===user.id && ["draft","returned"].includes(g.status) ? {...g, status:"submitted"} : g));
    notify("Goal sheet submitted for manager approval! 🎉");
  };

  const handleApprove = (gid, changes) => {
    const g = goals.find(g => g.id === gid);
    setGoals(prev => prev.map(g => g.id===gid ? {...g,...changes,status:"approved",locked:true} : g));
    log({ goalId:gid, goalTitle:g.title, empName:USERS.find(u=>u.id===g.empId)?.name, by:user.name, type:"Goal Approved", detail:`Approved by manager. Wt: ${changes.weightage}%, Target: ${changes.target}` });
    notify("Goal approved and locked ✅");
    setModal(null);
  };

  const handleReturn = (gid, reason) => {
    const g = goals.find(g => g.id === gid);
    setGoals(prev => prev.map(g => g.id===gid ? {...g,status:"returned"} : g));
    log({ goalId:gid, goalTitle:g.title, empName:USERS.find(u=>u.id===g.empId)?.name, by:user.name, type:"Returned for Rework", detail:reason||"Returned by manager." });
    notify("Goal returned for rework.");
    setModal(null);
  };

  const handleCheckin = (gid, q, data) => {
    setGoals(prev => prev.map(g => g.id===gid ? {...g, achievements:{...g.achievements,[q]:data}} : g));
    notify(`${q} check-in saved 📝`);
    setModal(null);
  };

  const handleMgrComment = (gid, q, comment) => {
    setGoals(prev => prev.map(g => g.id===gid && g.achievements[q] ? {...g, achievements:{...g.achievements,[q]:{...g.achievements[q],mc:comment}}} : g));
    const g = goals.find(g => g.id===gid);
    log({ goalId:gid, goalTitle:g?.title, empName:USERS.find(u=>u.id===g?.empId)?.name, by:user.name, type:"Check-in Comment Added", detail:`${q}: "${comment}"` });
    notify("Comment saved.");
    setModal(null);
  };

  const handleUnlock = (gid) => {
    const g = goals.find(g => g.id===gid);
    setGoals(prev => prev.map(g => g.id===gid ? {...g,locked:false,status:"returned"} : g));
    log({ goalId:gid, goalTitle:g?.title, empName:USERS.find(u=>u.id===g?.empId)?.name, by:user.name, type:"Goal Unlocked (Admin)", detail:"Admin unlocked for employee editing." });
    notify("Goal unlocked. Employee can now edit.");
    setModal(null);
  };

  const handleDelete = (gid) => {
    setGoals(prev => prev.filter(g => g.id !== gid));
    notify("Goal removed.");
  };

  const handlePushShared = (empIds, data) => {
    setGoals(prev => {
      const newGs = empIds.map(eid => ({ ...data, id:newGid(), empId:eid, status:"approved", locked:true, shared:true, sharedFrom:user.id, createdAt:new Date().toISOString().split("T")[0], achievements:{Q1:null,Q2:null,Q3:null,Q4:null} }));
      return [...prev, ...newGs];
    });
    notify(`Shared goal pushed to ${empIds.length} employee(s) 📤`);
  };

  if (!user) return <LoginScreen onLogin={u => { setUser(u); setTab("dashboard"); }}/>;

  const navMap = {
    employee: [
      { key:"dashboard", icon:"📊", label:"Dashboard"  },
      { key:"mygoals",   icon:"🎯", label:"My Goals"   },
      { key:"checkin",   icon:"✅", label:"Check-ins"  },
    ],
    manager: [
      { key:"dashboard", icon:"📊", label:"Dashboard"      },
      { key:"teamgoals", icon:"👥", label:"Team Goals"     },
      { key:"checkin",   icon:"💬", label:"Check-in Review"},
      { key:"shared",    icon:"📤", label:"Push Shared KPI"},
    ],
    admin: [
      { key:"dashboard", icon:"📊", label:"Dashboard"    },
      { key:"allgoals",  icon:"📋", label:"All Goals"    },
      { key:"cycle",     icon:"🔄", label:"Cycle Mgmt"   },
      { key:"audit",     icon:"🔍", label:"Audit Log"    },
      { key:"analytics", icon:"📈", label:"Analytics"    },
    ],
  };

  const navItems    = navMap[user.role] || [];
  const pendingBadge = user.role==="manager" ? teamGoals.filter(g=>g.status==="submitted").length : 0;
  const roleColors  = { employee:"#34d399", manager:"#10b981", admin:"#34d399" };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020617", color:"#e2e8f0", fontFamily:"'Inter', system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 240, background:"#0f172a", borderRight:"none", display:"flex", flexDirection:"column", minHeight:"100vh", position:"sticky", top:0 }}>
        <div style={{ padding:"16px 14px 14px", borderBottom:"1px solid #1e293b" }}>
          <div style={{ display:"flex", alignItems:"center", gap: 16 }}>
            <div style={{ width:34, height:34, background:"linear-gradient(135deg,#10b981,#34d399)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎯</div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.3px" }}>GoalTrack</p>
              <p style={{ margin:0, fontSize:10, color:"#64748b" }}>FY 2024-25</p>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"8px 8px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:12, marginBottom:2, border:"none", cursor:"pointer", fontSize:12, fontWeight:tab===item.key?700:500, background:tab===item.key?"#f0f0ff":"transparent", color:tab===item.key?"#10b981":"#94a3b8", textAlign:"left", position:"relative" }}>
              <span style={{ fontSize:14 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.key==="teamgoals" && pendingBadge>0 && (
                <span style={{ background:"#f87171", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:99, minWidth:16, textAlign:"center" }}>{pendingBadge}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px 10px", borderTop:"1px solid #1e293b" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", marginBottom:6 }}>
            <Avt name={user.name} size="sm"/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:11, fontWeight:700, color:"#f8fafc", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</p>
              <p style={{ margin:0, fontSize:10, color:"#64748b", textTransform:"capitalize" }}>{user.role}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} style={{ width:"100%", padding:"7px 10px", border:"1px solid #fee2e2", borderRadius:12, background:"#0f172a", cursor:"pointer", fontSize:11, color:"#f87171", fontWeight:600 }}>← Switch Role</button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header style={{ background:"#0f172a", borderBottom:"1px solid #1e293b", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div>
            <h1 style={{ margin:0, fontSize:15, fontWeight:800, color:"#f8fafc" }}>{navItems.find(n=>n.key===tab)?.label||"Dashboard"}</h1>
            <p style={{ margin:0, fontSize:11, color:"#64748b" }}>Current window: {cycle.active} Check-in {cycle.checkinOpen?"· 🟢 Open":"· 🔴 Closed"}</p>
          </div>
          <div style={{ display:"flex", gap: 16, alignItems:"center" }}>
            {user.role==="admin" && (
              <button onClick={()=>{ exportGoalsCSV(goals); notify("Report exported 📥"); }} style={{ padding:"7px 14px", background:"#064e3b", border:"1px solid #047857", borderRadius:12, cursor:"pointer", fontSize:12, fontWeight:700, color:"#34d399" }}>📥 Export CSV</button>
            )}
            <span style={{ fontSize:11, padding:"5px 12px", borderRadius:99, fontWeight:700, background:`${roleColors[user.role]}18`, color:roleColors[user.role], border:`1px solid ${roleColors[user.role]}33` }}>
              {user.dept} · {user.role}
            </span>
          </div>
        </header>

        <main style={{ flex:1, overflowY:"auto", padding:24 }}>
          {user.role==="employee" && <>
            {tab==="dashboard" && <EmpDashboard goals={myGoals} cycle={cycle}/>}
            {tab==="mygoals"   && <MyGoals goals={myGoals} onOpenModal={setModal} onSubmit={handleSubmit} onDelete={handleDelete}/>}
            {tab==="checkin"   && <EmpCheckin goals={myGoals} cycle={cycle} onOpenModal={setModal}/>}
          </>}
          {user.role==="manager" && <>
            {tab==="dashboard" && <MgrDashboard user={user} goals={teamGoals} cycle={cycle}/>}
            {tab==="teamgoals" && <TeamGoals goals={teamGoals} onOpenModal={setModal}/>}
            {tab==="checkin"   && <MgrCheckin user={user} goals={teamGoals} onOpenModal={setModal}/>}
            {tab==="shared"    && <SharedGoalPush user={user} onPush={handlePushShared} notify={notify}/>}
          </>}
          {user.role==="admin" && <>
            {tab==="dashboard" && <AdminDashboard goals={goals} auditLog={audit} cycle={cycle}/>}
            {tab==="allgoals"  && <AllGoals goals={goals} onOpenModal={setModal}/>}
            {tab==="cycle"     && <CycleMgmt notify={notify}/>}
            {tab==="audit"     && <AuditLog auditLog={audit}/>}
            {tab==="analytics" && <Analytics goals={goals}/>}
          </>}
        </main>
      </div>

      {/* MODALS */}
      {modal?.type==="goalForm"    && <GoalFormModal   goal={modal.data} myGoals={myGoals} onSave={handleSaveGoal} onClose={()=>setModal(null)}/>}
      {modal?.type==="approveGoal" && <ApproveModal    goal={modal.data} onApprove={handleApprove} onReturn={handleReturn} onClose={()=>setModal(null)}/>}
      {modal?.type==="checkin"     && <CheckinModal    goal={modal.data.goal} quarter={modal.data.quarter} onSave={handleCheckin} onClose={()=>setModal(null)}/>}
      {modal?.type==="mgrComment"  && <MgrCommentModal goal={modal.data.goal} quarter={modal.data.quarter} onSave={handleMgrComment} onClose={()=>setModal(null)}/>}
      {modal?.type==="unlockGoal"  && <UnlockModal     goal={modal.data} onUnlock={handleUnlock} onClose={()=>setModal(null)}/>}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:20, right:20, zIndex:2000, padding:"12px 18px", borderRadius:24, background:toast.type==="error"?"#f87171":toast.type==="warning"?"#fbbf24":"#34d399", color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 8px 30px rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:8, maxWidth:380 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
