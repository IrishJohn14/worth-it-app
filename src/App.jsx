import { useState, useEffect, useRef } from "react";
 
const CATEGORIES = [
  { icon: "🛍️", label: "Shopping" },
  { icon: "🍕", label: "Food" },
  { icon: "🎮", label: "Entertainment" },
  { icon: "✈️", label: "Travel" },
  { icon: "🏠", label: "Home" },
  { icon: "👗", label: "Clothing" },
  { icon: "💄", label: "Beauty" },
  { icon: "🔧", label: "Tools" },
  { icon: "📚", label: "Education" },
  { icon: "❓", label: "Other" },
];
 
const INVEST_RATE = 0.07; // 7% S&P 500 historical average
 
function compoundReturn(principal, years) {
  return principal * Math.pow(1 + INVEST_RATE, years);
}
 
function formatMoney(n, compact = false) {
  if (compact && n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
 
function formatMoneyExact(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
 
function formatHours(hours) {
  if (hours < 1 / 60) return `${Math.round(hours * 3600)}s`;
  if (hours < 1) { const m = Math.round(hours * 60); return `${m} min${m !== 1 ? "s" : ""}`; }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
 
function getColor(hours) {
  if (hours < 1) return { main: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Easy earn" };
  if (hours < 4) return { main: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Think twice" };
  if (hours < 8) return { main: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Big spend" };
  return { main: "#f43f5e", bg: "rgba(244,63,94,0.12)", label: "Major cost" };
}
 
function WeekChart({ log }) {
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const dayName = d.toLocaleDateString();
    const label = ["S","M","T","W","T","F","S"][d.getDay()];
    const spent = log.filter(e => e.bought && e.date === dayName).reduce((a, e) => a + e.price, 0);
    return { label, spent };
  });
  const max = Math.max(...weekData.map(d => d.spent), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
      {weekData.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: 4,
            height: d.spent > 0 ? `${Math.max(8, (d.spent / max) * 44)}px` : "4px",
            background: d.spent > 0 ? "linear-gradient(180deg,#a78bfa,#7c3aed)" : "#1e1e2e",
            transition: "height 0.6s cubic-bezier(.34,1.56,.64,1)"
          }} />
          <span style={{ fontSize: 9, color: "#444", fontFamily: "inherit" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
 
// ── Investment projection card ──
function InvestCard({ amount, onClose }) {
  const [activeYear, setActiveYear] = useState(10);
  const horizons = [3, 10, 20, 30];
  const returns = horizons.map(y => ({ years: y, value: compoundReturn(amount, y) }));
  const maxVal = returns[returns.length - 1].value;
  const activeReturn = compoundReturn(amount, activeYear);
  const gain = activeReturn - amount;
 
  return (
    <div style={{
      background: "linear-gradient(135deg, #060612, #0a0a18)",
      border: "1px solid rgba(52,211,153,0.3)",
      borderRadius: 20, padding: 20, marginTop: 4,
      animation: "investSlide 0.5s cubic-bezier(.34,1.26,.64,1) both",
      position: "relative", overflow: "hidden",
    }}>
      {/* Green ambient */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(52,211,153,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
 
      <div style={{ position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📈</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>Invest it instead</div>
              <div style={{ fontSize: 11, color: "#2a4a3a" }}>S&P 500 avg · 7% annual return</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#2a4a3a", fontSize: 18, padding: 4, cursor: "pointer" }}>✕</button>
        </div>
 
        {/* Big number */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2a4a3a", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>
            {formatMoneyExact(amount)} grows to
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#34d399", lineHeight: 1, letterSpacing: "-.03em", animation: "numberPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
            {formatMoney(activeReturn, true)}
          </div>
          <div style={{ fontSize: 14, color: "#2a7a5a", marginTop: 6, fontWeight: 500 }}>
            in {activeYear} year{activeYear !== 1 ? "s" : ""} · +{formatMoney(gain, true)} gain
          </div>
        </div>
 
        {/* Bar chart */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 72, marginBottom: 12 }}>
          {returns.map(r => {
            const heightPct = (r.value / maxVal) * 100;
            const isActive = r.years === activeYear;
            return (
              <button key={r.years} onClick={() => setActiveYear(r.years)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#34d399" : "#1e3a2e", marginBottom: 2 }}>
                  {formatMoney(r.value, true)}
                </div>
                <div style={{
                  width: "100%", borderRadius: "6px 6px 4px 4px",
                  height: `${Math.max(10, heightPct * 0.52)}px`,
                  background: isActive
                    ? "linear-gradient(180deg, #34d399, #059669)"
                    : "linear-gradient(180deg, #1e3a2e, #0e2a1e)",
                  border: isActive ? "1px solid rgba(52,211,153,0.5)" : "1px solid #1a2a1a",
                  transition: "all 0.3s ease",
                }} />
                <div style={{ fontSize: 10, color: isActive ? "#34d399" : "#2a4a3a", fontWeight: isActive ? 700 : 500 }}>
                  {r.years}yr
                </div>
              </button>
            );
          })}
        </div>
 
        {/* Multiplier pill */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "6px 16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 50, fontSize: 12, color: "#34d399", fontWeight: 700 }}>
            {(activeReturn / amount).toFixed(1)}x your money · {activeYear} years
          </div>
        </div>
 
        {/* Disclaimer */}
        <div style={{ marginTop: 12, fontSize: 10, color: "#1e3a2e", textAlign: "center", lineHeight: 1.5 }}>
          Illustrative only · Past performance doesn't guarantee future results
        </div>
      </div>
    </div>
  );
}
 
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [salary, setSalary] = useState("");
  const [salaryType, setSalaryType] = useState("hourly");
  const [taxRate, setTaxRate] = useState(25);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [itemName, setItemName] = useState("");
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [decision, setDecision] = useState(null);
  const [showInvest, setShowInvest] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const priceRef = useRef(null);
 
  useEffect(() => {
    const stored = localStorage.getItem("wh_log");
    if (stored) setLog(JSON.parse(stored));
    const s = localStorage.getItem("wh_salary");
    const t = localStorage.getItem("wh_type");
    const tx = localStorage.getItem("wh_tax");
    if (s) { setSalary(s); setSalaryType(t || "hourly"); setTaxRate(Number(tx) || 25); setScreen("check"); }
  }, []);
 
  useEffect(() => {
    if (screen === "check" && priceRef.current) setTimeout(() => priceRef.current?.focus(), 300);
  }, [screen]);
 
  const hourlyRate = () => {
    const raw = parseFloat(salary);
    if (!raw) return 0;
    const gross = salaryType === "annual" ? raw / 52 / 40 : raw;
    return gross * (1 - taxRate / 100);
  };
 
  const spawnConfetti = () => {
    const pieces = Array.from({ length: 28 }, (_, i) => ({
      id: i, x: 38 + Math.random() * 24,
      color: ["#a78bfa","#34d399","#fbbf24","#f43f5e","#60a5fa","#34d399"][i % 6],
      rotation: Math.random() * 360, scale: 0.5 + Math.random() * 0.8,
      tx: (Math.random() - 0.5) * 220, ty: -(60 + Math.random() * 140),
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1400);
  };
 
  const calculate = () => {
    const p = parseFloat(price);
    if (!p || !hourlyRate()) return;
    setAnimating(true); setDecision(null); setResult(null); setShowInvest(false);
    setTimeout(() => {
      const res = { hours: p / hourlyRate(), price: p, name: itemName.trim() || "This item", category: category.icon + " " + category.label };
      setResult(res); setAnimating(false); setCelebrating(true); spawnConfetti();
      setTimeout(() => setCelebrating(false), 800);
    }, 600);
  };
 
  const saveSetup = () => {
    localStorage.setItem("wh_salary", salary);
    localStorage.setItem("wh_type", salaryType);
    localStorage.setItem("wh_tax", taxRate);
    setScreen("check");
  };
 
  const logDecision = (bought, invest = false) => {
    if (!result) return;
    const entry = { ...result, bought, invested: invest, date: new Date().toLocaleDateString() };
    const newLog = [entry, ...log].slice(0, 100);
    setLog(newLog); localStorage.setItem("wh_log", JSON.stringify(newLog));
    setDecision(bought ? "bought" : invest ? "invested" : "skipped");
    if (invest) setShowInvest(true);
    if (!invest) setShowInvest(false);
  };
 
  const handleShare = () => {
    if (!result) return;
    const text = `${result.name} costs ${formatMoneyExact(result.price)} — that's ${formatHours(result.hours)} of my working life 😬\n\nWorth It? app`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
  };
 
  const totalHoursSaved = log.filter(e => !e.bought).reduce((a, e) => a + e.hours, 0);
  const totalSpent = log.filter(e => e.bought).reduce((a, e) => a + e.price, 0);
  const totalInvested = log.filter(e => e.invested).reduce((a, e) => a + e.price, 0);
  const investedCount = log.filter(e => e.invested).length;
  const skippedCount = log.filter(e => !e.bought).length;
  const colors = result ? getColor(result.hours) : { main: "#7c3aed", bg: "rgba(124,58,237,0.1)", label: "" };
  const progress = result ? Math.min(1, result.hours / 40) : 0;
 
  return (
    <div style={{
      minHeight: "100vh", background: "#080810", color: "#f0f0f5",
      fontFamily: "'Outfit', sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "0 20px 80px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .blob1 { position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.15) 0%,transparent 70%);top:-200px;right:-200px;pointer-events:none;animation:blobFloat 8s ease-in-out infinite; }
        .blob2 { position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(52,211,153,.07) 0%,transparent 70%);bottom:-100px;left:-100px;pointer-events:none;animation:blobFloat 10s ease-in-out infinite reverse; }
        @keyframes blobFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes celebrate { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 70%{transform:scale(0.97)} 100%{transform:scale(1)} }
        @keyframes confettiFly { 0%{opacity:1;transform:translate(0,0) rotate(0deg) scale(var(--s))} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(var(--r)) scale(var(--s))} }
        @keyframes numberPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes investSlide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ringPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input:focus,select:focus,button:focus { outline:none; }
        button { cursor:pointer;transition:all .18s ease; }
        button:active { transform:scale(0.96) !important; }
        input[type=range] { -webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#1e1e2e;outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#7c3aed;cursor:pointer;box-shadow:0 0 0 4px rgba(124,58,237,.2); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        ::-webkit-scrollbar { width:0; }
        .screen { animation:fadeUp 0.4s cubic-bezier(.34,1.26,.64,1) both; }
        .tab { background:none;border:none;padding:10px 0;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#333;transition:all .2s;position:relative;flex:1; }
        .tab.active { color:#a78bfa; }
        .tab.active::after { content:'';position:absolute;bottom:-1px;left:20%;right:20%;height:2px;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:2px; }
        .tab:hover:not(.active) { color:#555; }
        .pill-btn { border:1px solid #222;border-radius:50px;padding:8px 18px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;background:transparent;color:#555;transition:all .2s; }
        .pill-btn.active { border-color:#7c3aed;background:rgba(124,58,237,.15);color:#a78bfa; }
        .pill-btn:hover:not(.active) { border-color:#333;color:#888; }
        .primary { background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;padding:16px;border-radius:16px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;letter-spacing:.04em;width:100%;box-shadow:0 8px 32px rgba(124,58,237,.3); }
        .primary:hover { box-shadow:0 12px 40px rgba(124,58,237,.45);transform:translateY(-1px); }
        .primary:disabled { opacity:.25;transform:none;box-shadow:none; }
        .ghost { background:transparent;border:1px solid #1e1e2e;color:#333;padding:13px;border-radius:14px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;width:100%; }
        .ghost:hover { border-color:#333;color:#666; }
        .field-label { font-size:11px;font-weight:600;letter-spacing:.12em;color:#3a3a5a;text-transform:uppercase;margin-bottom:8px; }
        .input { background:#0e0e18;border:1.5px solid #1a1a28;border-radius:14px;color:#f0f0f5;font-family:'Outfit',sans-serif;font-size:16px;font-weight:500;padding:14px 18px;width:100%;transition:border-color .2s,box-shadow .2s; }
        .input:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15); }
        .input::placeholder { color:#1e1e2e; }
        .card { background:linear-gradient(135deg,#0e0e18,#0a0a14);border:1px solid #1a1a28;border-radius:20px;padding:20px; }
        .result-card { animation:scaleIn 0.5s cubic-bezier(.34,1.26,.64,1) both; }
        .celebrate { animation:celebrate 0.6s cubic-bezier(.34,1.26,.64,1); }
        .log-item { background:#0e0e18;border:1px solid #1a1a28;border-radius:16px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;animation:fadeIn .3s ease both; }
        .cat-picker { position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;padding:0 20px 20px;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);animation:fadeIn .2s ease; }
        .cat-sheet { background:#0e0e18;border:1px solid #1e1e2e;border-radius:24px;padding:20px;width:100%;max-width:440px;animation:slideDown .3s cubic-bezier(.34,1.26,.64,1); }
        .invest-btn { flex:1;padding:14px 8px;border-radius:14px;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;border:none;transition:all .2s; }
        .invest-btn:hover { transform:translateY(-2px); }
      `}</style>
 
      <div className="blob1" /><div className="blob2" />
 
      {confetti.map(p => (
        <div key={p.id} style={{
          position:"fixed", left:`${p.x}%`, top:"45%", width:8, height:8,
          borderRadius: p.id % 3 === 0 ? "50%" : "2px", background:p.color,
          zIndex:999, pointerEvents:"none",
          "--tx":`${p.tx}px`, "--ty":`${p.ty}px`, "--r":`${p.rotation}deg`, "--s":p.scale,
          animation:"confettiFly 1.2s ease-out forwards"
        }} />
      ))}
 
      {showCatPicker && (
        <div className="cat-picker" onClick={() => setShowCatPicker(false)}>
          <div className="cat-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:13, fontWeight:700, color:"#555", letterSpacing:".1em", textTransform:"uppercase", marginBottom:16 }}>Category</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
              {CATEGORIES.map(c => (
                <button key={c.label} onClick={() => { setCategory(c); setShowCatPicker(false); }} style={{
                  background: category.label === c.label ? "rgba(124,58,237,.2)" : "#13131e",
                  border:`1.5px solid ${category.label === c.label ? "#7c3aed" : "#1e1e2e"}`,
                  borderRadius:12, padding:"12px 4px", display:"flex", flexDirection:"column",
                  alignItems:"center", gap:4, fontFamily:"'Outfit',sans-serif",
                }}>
                  <span style={{ fontSize:22 }}>{c.icon}</span>
                  <span style={{ fontSize:10, color:"#555", fontWeight:500 }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* ── WELCOME ── */}
      {screen === "welcome" && (
        <div className="screen" style={{ width:"100%", maxWidth:440, paddingTop:80, display:"flex", flexDirection:"column" }}>
          <div style={{ marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:".2em", color:"#3a3a5a", textTransform:"uppercase" }}>Introducing</span>
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(48px,12vw,72px)", lineHeight:1, color:"#fff" }}>Worth<br/>It?</div>
          <div style={{ marginTop:24, marginBottom:48, fontSize:17, color:"#555", lineHeight:1.7 }}>
            See any price as <span style={{ color:"#a78bfa", fontWeight:600 }}>hours of your life</span> — then decide whether to spend, skip, or <span style={{ color:"#34d399", fontWeight:600 }}>invest</span>.
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48 }}>
            {[
              { icon:"⏱", text:"See any price in real working hours" },
              { icon:"📈", text:"See what that money becomes if invested" },
              { icon:"📊", text:"Track every decision you make" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"#0e0e18", borderRadius:14, border:"1px solid #1a1a28", animation:`fadeUp 0.5s ${0.1+i*0.1}s both` }}>
                <span style={{ fontSize:22, minWidth:28 }}>{item.icon}</span>
                <span style={{ fontSize:15, color:"#888" }}>{item.text}</span>
              </div>
            ))}
          </div>
          <button className="primary" onClick={() => setScreen("setup")} style={{ fontSize:16, padding:"18px" }}>Get Started →</button>
          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:"#2a2a3a" }}>Free · No account needed · Works offline</div>
        </div>
      )}
 
      {/* ── MAIN APP ── */}
      {screen !== "welcome" && (
        <>
          <div style={{ width:"100%", maxWidth:440, paddingTop:52, paddingBottom:4, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:26, fontWeight:700, color:"#fff", lineHeight:1 }}>Worth It?</div>
              <div style={{ fontSize:10, color:"#2a2a3a", letterSpacing:".15em", fontWeight:600, textTransform:"uppercase", marginTop:2 }}>Time Cost Calculator</div>
            </div>
            {salary && (
              <div style={{ fontSize:12, color:"#3a3a5a", background:"#0e0e18", border:"1px solid #1a1a28", borderRadius:10, padding:"6px 12px", fontWeight:600 }}>
                {formatMoneyExact(hourlyRate())}<span style={{ fontWeight:400, color:"#2a2a3a" }}>/hr</span>
              </div>
            )}
          </div>
 
          <div style={{ width:"100%", maxWidth:440, display:"flex", borderBottom:"1px solid #111", marginBottom:28, marginTop:8 }}>
            {["setup","check","log"].map(s => (
              <button key={s} className={`tab ${screen===s?"active":""}`} onClick={() => setScreen(s)}>
                {s==="log" ? `Log (${log.length})` : s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
 
          <div style={{ width:"100%", maxWidth:440 }}>
 
            {/* ── SETUP ── */}
            {screen === "setup" && (
              <div className="screen" style={{ display:"flex", flexDirection:"column", gap:22 }}>
                <div style={{ padding:"16px 20px", background:"linear-gradient(135deg,rgba(124,58,237,.1),rgba(168,85,247,.05))", border:"1px solid rgba(124,58,237,.2)", borderRadius:16 }}>
                  <div style={{ fontSize:13, color:"#7c6aad", lineHeight:1.7 }}>Your pay rate converts prices into working hours. Stays on your device — never shared.</div>
                </div>
                <div>
                  <div className="field-label">Pay Type</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {["hourly","annual"].map(t => (
                      <button key={t} className={`pill-btn ${salaryType===t?"active":""}`} style={{ flex:1, padding:"12px" }} onClick={() => setSalaryType(t)}>
                        {t==="hourly" ? "Hourly Rate" : "Annual Salary"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="field-label">{salaryType==="hourly" ? "Your Hourly Rate" : "Your Annual Salary"}</div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", color:"#3a3a5a", fontSize:18, fontWeight:600 }}>$</span>
                    <input className="input" type="number" style={{ paddingLeft:36 }} placeholder={salaryType==="hourly"?"25.00":"65000"} value={salary} onChange={e => setSalary(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div className="field-label" style={{ margin:0 }}>Income Tax Rate</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>{taxRate}%</div>
                  </div>
                  <input type="range" min={0} max={50} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} style={{ width:"100%", accentColor:"#7c3aed" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                    <span style={{ fontSize:12, color:"#2a2a3a" }}>0%</span>
                    {hourlyRate()>0 && <span style={{ fontSize:13, color:"#7c6aad", fontWeight:600 }}>Take-home: {formatMoneyExact(hourlyRate())}/hr</span>}
                    <span style={{ fontSize:12, color:"#2a2a3a" }}>50%</span>
                  </div>
                </div>
                <button className="primary" onClick={saveSetup} disabled={!salary} style={{ marginTop:4 }}>Start Checking Prices →</button>
              </div>
            )}
 
            {/* ── CHECK ── */}
            {screen === "check" && (
              <div className="screen" style={{ display:"flex", flexDirection:"column", gap:16 }}>
 
                {/* Price hero */}
                <div style={{ background:"#0e0e18", border:"1.5px solid #1a1a28", borderRadius:20, padding:"20px 20px 16px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 0%,${colors.bg} 0%,transparent 70%)`, pointerEvents:"none", transition:"background 0.5s ease" }} />
                  <div className="field-label" style={{ marginBottom:12 }}>Price to Check</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:32, fontWeight:800, color:"#1e1e2e" }}>$</span>
                    <input ref={priceRef} type="number" value={price}
                      onChange={e => { setPrice(e.target.value); setResult(null); setDecision(null); setShowInvest(false); }}
                      onKeyDown={e => e.key==="Enter" && calculate()}
                      placeholder="0.00"
                      style={{ background:"transparent", border:"none", fontSize:42, fontWeight:800, color:"#fff", width:"100%", fontFamily:"'Outfit',sans-serif", letterSpacing:"-.02em" }} />
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:12 }}>
                    {[10,25,50,100,250].map(v => (
                      <button key={v} onClick={() => { setPrice(String(v)); setResult(null); setDecision(null); setShowInvest(false); }} style={{
                        flex:1, padding:"7px 2px", background:price==v?"rgba(124,58,237,.2)":"#13131e",
                        border:`1px solid ${price==v?"#7c3aed":"#1e1e2e"}`,
                        borderRadius:8, fontSize:12, fontWeight:600,
                        color:price==v?"#a78bfa":"#333", fontFamily:"'Outfit',sans-serif",
                      }}>${v}</button>
                    ))}
                  </div>
                </div>
 
                {/* Name + category */}
                <div style={{ display:"flex", gap:10 }}>
                  <input className="input" style={{ flex:1, fontSize:14 }} placeholder="Item name (optional)" value={itemName} onChange={e => setItemName(e.target.value)} />
                  <button onClick={() => setShowCatPicker(true)} style={{
                    background:"#0e0e18", border:"1.5px solid #1a1a28", borderRadius:14,
                    padding:"0 16px", fontSize:22, display:"flex", alignItems:"center", minWidth:64,
                  }}>{category.icon}</button>
                </div>
 
                <button className="primary" onClick={calculate} disabled={!price||!salary}>Calculate ⏱</button>
 
                {/* Result card */}
                {(animating || result) && (
                  <div className={`card result-card ${celebrating?"celebrate":""}`} style={{ borderColor:result?colors.main+"44":"#1a1a28", transition:"border-color 0.4s ease", overflow:"hidden", position:"relative" }}>
                    {result && <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 0%,${colors.bg},transparent 70%)`, pointerEvents:"none" }} />}
 
                    {animating ? (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", gap:12 }}>
                        <svg width="100" height="100" style={{ transform:"rotate(-90deg)" }}>
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a28" strokeWidth="6" />
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#7c3aed" strokeWidth="6"
                            strokeDasharray={2*Math.PI*44} strokeLinecap="round"
                            style={{ animation:"ringPulse 0.8s ease infinite", strokeDashoffset:2*Math.PI*44*0.3 }} />
                        </svg>
                        <span style={{ fontSize:13, color:"#444" }}>Calculating...</span>
                      </div>
                    ) : result && (
                      <div style={{ position:"relative" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
                          <div style={{ position:"relative", flexShrink:0 }}>
                            <svg width="100" height="100" style={{ transform:"rotate(-90deg)" }}>
                              <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a2e" strokeWidth="7" />
                              <circle cx="50" cy="50" r="44" fill="none" stroke={colors.main} strokeWidth="7"
                                strokeDasharray={2*Math.PI*44}
                                strokeDashoffset={2*Math.PI*44*(1-progress)}
                                strokeLinecap="round"
                                style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(.34,1.26,.64,1),stroke 0.4s ease" }} />
                            </svg>
                            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                              <div style={{ fontSize:20, fontWeight:800, color:colors.main, lineHeight:1, animation:"numberPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
                                {result.hours<1 ? Math.round(result.hours*60) : result.hours.toFixed(1)}
                              </div>
                              <div style={{ fontSize:9, color:"#444", letterSpacing:".08em", fontWeight:700, textTransform:"uppercase" }}>
                                {result.hours<1?"mins":"hours"}
                              </div>
                            </div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, color:"#444", marginBottom:4 }}>{result.category} · {result.name}</div>
                            <div style={{ fontSize:28, fontWeight:800, color:"#fff", lineHeight:1, marginBottom:6, letterSpacing:"-.02em" }}>
                              {formatMoneyExact(result.price)}
                            </div>
                            <div style={{ fontSize:15, color:colors.main, fontWeight:600 }}>= {formatHours(result.hours)} of work</div>
                            <div style={{ marginTop:6, display:"inline-block", padding:"3px 10px", background:colors.bg, border:`1px solid ${colors.main}44`, borderRadius:50, fontSize:11, color:colors.main, fontWeight:700 }}>
                              {colors.label}
                            </div>
                          </div>
                        </div>
 
                        {/* Action buttons */}
                        {!decision ? (
                          <div style={{ display:"flex", gap:8 }}>
                            <button className="invest-btn" onClick={() => logDecision(false, false)} style={{
                              background:"linear-gradient(135deg,#0a1f0a,#0e2a0e)",
                              border:"1px solid #1a3a1a", color:"#34d399",
                            }}>✕ Skip</button>
                            <button className="invest-btn" onClick={() => logDecision(false, true)} style={{
                              background:"linear-gradient(135deg,#061a0f,#0a2418)",
                              border:"1px solid rgba(52,211,153,0.35)", color:"#34d399",
                              flex:1.4, fontSize:12,
                            }}>📈 Invest It</button>
                            <button className="invest-btn" onClick={() => { handleShare(); }} style={{
                              background:"#0e0e18", border:"1px solid #1e1e2e", color:"#555", padding:"14px 10px",
                            }}>↗</button>
                            <button className="invest-btn" onClick={() => logDecision(true)} style={{
                              background:"linear-gradient(135deg,#1f0a0a,#2a0e0e)",
                              border:"1px solid #3a1a1a", color:"#f87171",
                            }}>✓ Buy</button>
                          </div>
                        ) : (
                          <div style={{
                            padding:"14px", borderRadius:14, textAlign:"center", fontSize:14, fontWeight:600,
                            background: decision==="bought"?"rgba(248,113,113,0.08)":"rgba(52,211,153,0.08)",
                            border:`1px solid ${decision==="bought"?"rgba(248,113,113,0.2)":"rgba(52,211,153,0.2)"}`,
                            color: decision==="bought"?"#f87171":"#34d399",
                          }}>
                            {decision==="bought" ? "✓ Logged — enjoy it!" : decision==="invested" ? "📈 Smart move — see projection below" : "✕ Skipped — nice save!"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
 
                {/* Investment projection panel */}
                {showInvest && result && (
                  <InvestCard amount={result.price} onClose={() => setShowInvest(false)} />
                )}
 
                {!salary && (
                  <button className="ghost" onClick={() => setScreen("setup")}>⚙ Set up your pay rate first</button>
                )}
              </div>
            )}
 
            {/* ── LOG ── */}
            {screen === "log" && (
              <div className="screen" style={{ display:"flex", flexDirection:"column", gap:14 }}>
 
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:16, padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#f87171", letterSpacing:"-.02em" }}>{formatMoney(totalSpent,true)}</div>
                    <div style={{ fontSize:10, color:"#444", marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>Total Spent</div>
                  </div>
                  <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:16, padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#34d399", letterSpacing:"-.02em" }}>{formatHours(totalHoursSaved)}</div>
                    <div style={{ fontSize:10, color:"#444", marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>Hours Saved</div>
                  </div>
                </div>
 
                {/* Investment summary card */}
                {investedCount > 0 && (
                  <div style={{ background:"linear-gradient(135deg,rgba(52,211,153,0.06),rgba(5,150,105,0.03))", border:"1px solid rgba(52,211,153,0.2)", borderRadius:16, padding:"16px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#2a7a5a", letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>📈 Investment Pot</div>
                        <div style={{ fontSize:24, fontWeight:800, color:"#34d399" }}>{formatMoney(totalInvested, true)}</div>
                        <div style={{ fontSize:12, color:"#2a6a4a", marginTop:2 }}>{investedCount} decision{investedCount!==1?"s":""} redirected</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, color:"#2a4a3a", marginBottom:4 }}>In 10 years @ 7%</div>
                        <div style={{ fontSize:20, fontWeight:800, color:"#34d399" }}>{formatMoney(compoundReturn(totalInvested,10),true)}</div>
                        <div style={{ fontSize:11, color:"#1e3a2e" }}>+{formatMoney(compoundReturn(totalInvested,10)-totalInvested,true)} gain</div>
                      </div>
                    </div>
                  </div>
                )}
 
                {/* Weekly chart */}
                {log.length > 0 && (
                  <div className="card">
                    <div style={{ fontSize:11, fontWeight:700, color:"#333", letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>This Week's Spend</div>
                    <WeekChart log={log} />
                  </div>
                )}
 
                {/* Log list */}
                {log.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"60px 0" }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
                    <div style={{ fontSize:15, color:"#333", fontWeight:500 }}>No items logged yet</div>
                    <div style={{ fontSize:13, color:"#222", marginTop:6 }}>Check a price and log your decision</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:11, fontWeight:700, color:"#2a2a3a", letterSpacing:".1em", textTransform:"uppercase" }}>Recent Decisions</div>
                    {log.map((entry, i) => (
                      <div key={i} className="log-item" style={{
                        borderLeft:`3px solid ${entry.invested?"#34d399":entry.bought?"#f87171":"#34d399"}`,
                        animationDelay:`${i*0.04}s`
                      }}>
                        <div style={{ minWidth:32, fontSize:20 }}>
                          {entry.invested ? "📈" : entry.bought ? "🛍️" : "✕"}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, color:"#ccc", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{entry.name}</div>
                          <div style={{ fontSize:11, color:"#333", marginTop:2 }}>
                            {entry.category} · {entry.date}
                            {entry.invested && <span style={{ color:"#34d399", marginLeft:6 }}>· Investing</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:entry.bought&&!entry.invested?"#f87171":"#34d399" }}>{formatMoney(entry.price)}</div>
                          <div style={{ fontSize:11, color:"#333", marginTop:1 }}>{formatHours(entry.hours)} work</div>
                        </div>
                      </div>
                    ))}
                    <button className="ghost" style={{ fontSize:12, color:"#2a2a3a", borderColor:"#111", marginTop:4 }}
                      onClick={() => { if(confirm("Clear all entries?")) { setLog([]); localStorage.removeItem("wh_log"); } }}>
                      Clear Log
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
 
