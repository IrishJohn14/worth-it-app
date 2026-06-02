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
 
function formatHours(hours) {
  if (hours < 1 / 60) return `${Math.round(hours * 3600)}s`;
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
 
function formatMoney(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
 
function getColor(hours) {
  if (hours < 1) return { main: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Easy earn" };
  if (hours < 4) return { main: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Think twice" };
  if (hours < 8) return { main: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Big spend" };
  return { main: "#f43f5e", bg: "rgba(244,63,94,0.12)", label: "Major cost" };
}
 
// Mini bar chart for log screen
function WeekChart({ log }) {
  const days = ["S","M","T","W","T","F","S"];
  const today = new Date().getDay();
  const weekData = days.map((d, i) => {
    const dayIndex = (today - 6 + i + 7) % 7;
    const dayName = new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString();
    const spent = log.filter(e => e.bought && e.date === dayName).reduce((a, e) => a + e.price, 0);
    return { d, spent };
  });
  const max = Math.max(...weekData.map(d => d.spent), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56, padding: "0 4px" }}>
      {weekData.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: 4,
            height: d.spent > 0 ? `${Math.max(8, (d.spent / max) * 44)}px` : "4px",
            background: d.spent > 0 ? "linear-gradient(180deg, #a78bfa, #7c3aed)" : "#1e1e2e",
            transition: "height 0.6s cubic-bezier(.34,1.56,.64,1)"
          }} />
          <span style={{ fontSize: 9, color: "#444", fontFamily: "inherit" }}>{d.d}</span>
        </div>
      ))}
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
    if (s) {
      setSalary(s);
      setSalaryType(t || "hourly");
      setTaxRate(Number(tx) || 25);
      setScreen("check");
    }
  }, []);
 
  useEffect(() => {
    if (screen === "check" && priceRef.current) {
      setTimeout(() => priceRef.current?.focus(), 300);
    }
  }, [screen]);
 
  const hourlyRate = () => {
    const raw = parseFloat(salary);
    if (!raw) return 0;
    const gross = salaryType === "annual" ? raw / 52 / 40 : raw;
    return gross * (1 - taxRate / 100);
  };
 
  const spawnConfetti = () => {
    const pieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      color: ["#a78bfa","#34d399","#fbbf24","#f43f5e","#60a5fa"][i % 5],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      tx: (Math.random() - 0.5) * 200,
      ty: -(60 + Math.random() * 120),
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1200);
  };
 
  const calculate = () => {
    const p = parseFloat(price);
    if (!p || !hourlyRate()) return;
    setAnimating(true);
    setDecision(null);
    setResult(null);
    setTimeout(() => {
      const res = { hours: p / hourlyRate(), price: p, name: itemName.trim() || "This item", category: category.icon + " " + category.label };
      setResult(res);
      setAnimating(false);
      setCelebrating(true);
      spawnConfetti();
      setTimeout(() => setCelebrating(false), 800);
    }, 600);
  };
 
  const saveSetup = () => {
    localStorage.setItem("wh_salary", salary);
    localStorage.setItem("wh_type", salaryType);
    localStorage.setItem("wh_tax", taxRate);
    setScreen("check");
  };
 
  const logDecision = (bought) => {
    if (!result) return;
    const entry = { ...result, bought, date: new Date().toLocaleDateString() };
    const newLog = [entry, ...log].slice(0, 100);
    setLog(newLog);
    localStorage.setItem("wh_log", JSON.stringify(newLog));
    setDecision(bought ? "bought" : "skipped");
  };
 
  const handleShare = () => {
    if (!result) return;
    const colors = getColor(result.hours);
    const text = `${result.name} costs ${formatMoney(result.price)} — that's ${formatHours(result.hours)} of my working life. Worth it? 🤔\n\nCheck yours at worthitapp.com`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };
 
  const totalHoursSaved = log.filter(e => !e.bought).reduce((a, e) => a + e.hours, 0);
  const totalSpent = log.filter(e => e.bought).reduce((a, e) => a + e.price, 0);
  const skippedCount = log.filter(e => !e.bought).length;
  const colors = result ? getColor(result.hours) : { main: "#7c3aed", bg: "rgba(124,58,237,0.1)", label: "" };
 
  const circumference = 2 * Math.PI * 54;
  const progress = result ? Math.min(1, result.hours / 40) : 0;
 
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#f0f0f5",
      fontFamily: "'Outfit', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20px 60px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        /* Ambient background blobs */
        .blob1 { position: fixed; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); top: -200px; right: -200px; pointer-events: none; animation: blobFloat 8s ease-in-out infinite; }
        .blob2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%); bottom: -100px; left: -100px; pointer-events: none; animation: blobFloat 10s ease-in-out infinite reverse; }
 
        @keyframes blobFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes celebrate { 0%{transform:scale(1)} 40%{transform:scale(1.12)} 70%{transform:scale(0.96)} 100%{transform:scale(1)} }
        @keyframes confettiFly { 0%{opacity:1;transform:translate(0,0) rotate(0deg) scale(var(--s))} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(var(--r)) scale(var(--s))} }
        @keyframes ringPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinLoad { from{stroke-dashoffset:339} to{stroke-dashoffset:0} }
        @keyframes numberPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
 
        input:focus, select:focus, button:focus { outline: none; }
        button { cursor: pointer; transition: all 0.18s ease; }
        button:active { transform: scale(0.96) !important; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: #1e1e2e; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #7c3aed; cursor: pointer; box-shadow: 0 0 0 4px rgba(124,58,237,0.2); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 0px; }
 
        .screen { animation: fadeUp 0.4s cubic-bezier(.34,1.26,.64,1) both; }
        .tab { background: none; border: none; padding: 10px 0; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #333; transition: all .2s; position: relative; flex: 1; }
        .tab.active { color: #a78bfa; }
        .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 2px; }
        .tab:hover:not(.active) { color: #666; }
 
        .pill-btn { border: 1px solid #222; border-radius: 50px; padding: 8px 18px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; background: transparent; color: #555; transition: all .2s; }
        .pill-btn.active { border-color: #7c3aed; background: rgba(124,58,237,0.15); color: #a78bfa; }
        .pill-btn:hover:not(.active) { border-color: #333; color: #888; }
 
        .primary { background: linear-gradient(135deg, #7c3aed, #a855f7); border: none; color: white; padding: 16px; border-radius: 16px; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: .04em; width: 100%; box-shadow: 0 8px 32px rgba(124,58,237,0.3); }
        .primary:hover { box-shadow: 0 12px 40px rgba(124,58,237,0.45); transform: translateY(-1px); }
        .primary:disabled { opacity: 0.3; transform: none; box-shadow: none; }
 
        .ghost { background: transparent; border: 1px solid #1e1e2e; color: #444; padding: 13px; border-radius: 14px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; width: 100%; }
        .ghost:hover { border-color: #333; color: #777; }
 
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: .12em; color: #3a3a5a; text-transform: uppercase; margin-bottom: 8px; }
        .input { background: #0e0e18; border: 1.5px solid #1a1a28; border-radius: 14px; color: #f0f0f5; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 500; padding: 14px 18px; width: 100%; transition: border-color .2s, box-shadow .2s; }
        .input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .input::placeholder { color: #2a2a3a; }
 
        .card { background: linear-gradient(135deg, #0e0e18, #0a0a14); border: 1px solid #1a1a28; border-radius: 20px; padding: 20px; }
 
        .result-card { animation: scaleIn 0.5s cubic-bezier(.34,1.26,.64,1) both; }
        .celebrate { animation: celebrate 0.6s cubic-bezier(.34,1.26,.64,1); }
 
        .log-item { background: #0e0e18; border: 1px solid #1a1a28; border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; animation: fadeIn 0.3s ease both; }
 
        .cat-picker { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; justify-content: center; padding: 0 20px 20px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        .cat-sheet { background: #0e0e18; border: 1px solid #1e1e2e; border-radius: 24px; padding: 20px; width: 100%; max-width: 440px; animation: slideDown 0.3s cubic-bezier(.34,1.26,.64,1); }
 
        .welcome-hero { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(42px, 12vw, 72px); line-height: 1; color: #fff; }
      `}</style>
 
      <div className="blob1" />
      <div className="blob2" />
 
      {/* Confetti */}
      {confetti.map(p => (
        <div key={p.id} style={{
          position: "fixed", left: `${p.x}%`, top: "45%", width: 8, height: 8,
          borderRadius: p.id % 3 === 0 ? "50%" : "2px",
          background: p.color, zIndex: 999, pointerEvents: "none",
          "--tx": `${p.tx}px`, "--ty": `${p.ty}px`,
          "--r": `${p.rotation}deg`, "--s": p.scale,
          animation: "confettiFly 1s ease-out forwards"
        }} />
      ))}
 
      {/* Category Picker Sheet */}
      {showCatPicker && (
        <div className="cat-picker" onClick={() => setShowCatPicker(false)}>
          <div className="cat-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>Category</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.label} onClick={() => { setCategory(c); setShowCatPicker(false); }} style={{
                  background: category.label === c.label ? "rgba(124,58,237,0.2)" : "#13131e",
                  border: `1.5px solid ${category.label === c.label ? "#7c3aed" : "#1e1e2e"}`,
                  borderRadius: 12, padding: "12px 4px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, fontFamily: "'Outfit', sans-serif",
                }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <span style={{ fontSize: 10, color: "#555", fontWeight: 500 }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* ── WELCOME SCREEN ── */}
      {screen === "welcome" && (
        <div className="screen" style={{ width: "100%", maxWidth: 440, paddingTop: 80, display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".2em", color: "#3a3a5a", textTransform: "uppercase" }}>Introducing</span>
          </div>
          <div className="welcome-hero">Worth<br />It?</div>
          <div style={{ marginTop: 24, marginBottom: 48, fontSize: 18, color: "#555", lineHeight: 1.6, fontWeight: 400 }}>
            See any price as <span style={{ color: "#a78bfa", fontWeight: 600 }}>hours of your life</span> — before you spend.
          </div>
 
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
            {[
              { icon: "⏱", text: "Enter a price, see it in real working hours" },
              { icon: "🎯", text: "Log what you buy and what you skip" },
              { icon: "📊", text: "Track how much time you've saved" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#0e0e18", borderRadius: 14, border: "1px solid #1a1a28", animation: `fadeUp 0.5s ${0.1 + i * 0.1}s both` }}>
                <span style={{ fontSize: 22, minWidth: 28 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "#888", fontWeight: 400 }}>{item.text}</span>
              </div>
            ))}
          </div>
 
          <button className="primary" onClick={() => setScreen("setup")} style={{ fontSize: 16, padding: "18px" }}>
            Get Started →
          </button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#2a2a3a" }}>Free · No account needed · Works offline</div>
        </div>
      )}
 
      {/* ── MAIN APP (setup / check / log) ── */}
      {screen !== "welcome" && (
        <>
          {/* Header */}
          <div style={{ width: "100%", maxWidth: 440, paddingTop: 52, paddingBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Worth It?</div>
              <div style={{ fontSize: 10, color: "#2a2a3a", letterSpacing: ".15em", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>Time Cost Calculator</div>
            </div>
            {salary && (
              <div style={{ fontSize: 12, color: "#3a3a5a", background: "#0e0e18", border: "1px solid #1a1a28", borderRadius: 10, padding: "6px 12px", fontWeight: 600 }}>
                {formatMoney(hourlyRate())}<span style={{ fontWeight: 400, color: "#2a2a3a" }}>/hr</span>
              </div>
            )}
          </div>
 
          {/* Tabs */}
          <div style={{ width: "100%", maxWidth: 440, display: "flex", borderBottom: "1px solid #111", marginBottom: 28, marginTop: 8 }}>
            {["setup", "check", "log"].map(s => (
              <button key={s} className={`tab ${screen === s ? "active" : ""}`} onClick={() => setScreen(s)}>
                {s === "log" ? `Log (${log.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
 
          <div style={{ width: "100%", maxWidth: 440 }}>
 
            {/* ── SETUP ── */}
            {screen === "setup" && (
              <div className="screen" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16 }}>
                  <div style={{ fontSize: 13, color: "#7c6aad", lineHeight: 1.7 }}>
                    We use your take-home pay to convert prices into real hours. This data stays on your device — never shared.
                  </div>
                </div>
 
                <div>
                  <div className="field-label">Pay Type</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["hourly", "annual"].map(t => (
                      <button key={t} className={`pill-btn ${salaryType === t ? "active" : ""}`} style={{ flex: 1, padding: "12px" }} onClick={() => setSalaryType(t)}>
                        {t === "hourly" ? "Hourly Rate" : "Annual Salary"}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div>
                  <div className="field-label">{salaryType === "hourly" ? "Your Hourly Rate" : "Your Annual Salary"}</div>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#3a3a5a", fontSize: 18, fontWeight: 600 }}>$</span>
                    <input className="input" type="number" style={{ paddingLeft: 36 }}
                      placeholder={salaryType === "hourly" ? "25.00" : "65,000"}
                      value={salary} onChange={e => setSalary(e.target.value)} />
                  </div>
                </div>
 
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="field-label" style={{ margin: 0 }}>Income Tax Rate</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{taxRate}%</div>
                  </div>
                  <input type="range" min={0} max={50} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} style={{ width: "100%", accentColor: "#7c3aed" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ fontSize: 12, color: "#2a2a3a" }}>0%</span>
                    {hourlyRate() > 0 && (
                      <span style={{ fontSize: 13, color: "#7c6aad", fontWeight: 600 }}>
                        Take-home: {formatMoney(hourlyRate())}/hr
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "#2a2a3a" }}>50%</span>
                  </div>
                </div>
 
                <button className="primary" onClick={saveSetup} disabled={!salary} style={{ marginTop: 4 }}>
                  Start Checking Prices →
                </button>
              </div>
            )}
 
            {/* ── CHECK ── */}
            {screen === "check" && (
              <div className="screen" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
 
                {/* Price Input — hero element */}
                <div style={{ background: "#0e0e18", border: "1.5px solid #1a1a28", borderRadius: 20, padding: "20px 20px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${colors.bg} 0%, transparent 70%)`, pointerEvents: "none", transition: "background 0.5s ease" }} />
                  <div className="field-label" style={{ marginBottom: 12 }}>Price to Check</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: "#1e1e2e" }}>$</span>
                    <input ref={priceRef} type="number" value={price}
                      onChange={e => { setPrice(e.target.value); setResult(null); setDecision(null); }}
                      onKeyDown={e => e.key === "Enter" && calculate()}
                      placeholder="0.00"
                      style={{ background: "transparent", border: "none", fontSize: 42, fontWeight: 800, color: "#fff", width: "100%", fontFamily: "'Outfit', sans-serif", letterSpacing: "-.02em" }} />
                  </div>
 
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {[10, 25, 50, 100, 250].map(v => (
                      <button key={v} onClick={() => { setPrice(String(v)); setResult(null); setDecision(null); }} style={{
                        flex: 1, padding: "7px 2px", background: price == v ? "rgba(124,58,237,0.2)" : "#13131e",
                        border: `1px solid ${price == v ? "#7c3aed" : "#1e1e2e"}`,
                        borderRadius: 8, fontSize: 12, fontWeight: 600,
                        color: price == v ? "#a78bfa" : "#333", fontFamily: "'Outfit', sans-serif",
                      }}>
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Item name + category row */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <input className="input" placeholder="Item name (optional)" value={itemName} onChange={e => setItemName(e.target.value)} style={{ fontSize: 14 }} />
                  </div>
                  <button onClick={() => setShowCatPicker(true)} style={{
                    background: "#0e0e18", border: "1.5px solid #1a1a28", borderRadius: 14, padding: "0 16px",
                    fontSize: 22, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", minWidth: 64,
                  }}>
                    {category.icon}
                  </button>
                </div>
 
                {/* Calculate button */}
                <button className="primary" onClick={calculate} disabled={!price || !salary}>
                  Calculate ⏱
                </button>
 
                {/* Result */}
                {(animating || result) && (
                  <div className={`card result-card ${celebrating ? "celebrate" : ""}`} style={{ borderColor: result ? colors.main + "44" : "#1a1a28", transition: "border-color 0.4s ease", overflow: "hidden", position: "relative" }}>
                    {result && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${colors.bg}, transparent 70%)`, pointerEvents: "none" }} />}
 
                    {animating ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 12 }}>
                        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a28" strokeWidth="6" />
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#7c3aed" strokeWidth="6"
                            strokeDasharray={circumference} strokeLinecap="round"
                            style={{ animation: "ringPulse 0.8s ease infinite", strokeDashoffset: circumference * 0.3 }} />
                        </svg>
                        <span style={{ fontSize: 13, color: "#444" }}>Calculating...</span>
                      </div>
                    ) : result && (
                      <div style={{ position: "relative" }}>
                        {/* Ring + number */}
                        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="55" cy="55" r="46" fill="none" stroke="#1a1a2e" strokeWidth="7" />
                              <circle cx="55" cy="55" r="46" fill="none" stroke={colors.main} strokeWidth="7"
                                strokeDasharray={2 * Math.PI * 46}
                                strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.34,1.26,.64,1), stroke 0.4s ease" }} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ fontSize: 22, fontWeight: 800, color: colors.main, lineHeight: 1, animation: "numberPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
                                {result.hours < 1 ? Math.round(result.hours * 60) : result.hours.toFixed(1)}
                              </div>
                              <div style={{ fontSize: 9, color: "#444", letterSpacing: ".08em", fontWeight: 700, textTransform: "uppercase" }}>
                                {result.hours < 1 ? "mins" : "hours"}
                              </div>
                            </div>
                          </div>
 
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: "#444", marginBottom: 4 }}>{result.category} · {result.name}</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 6, letterSpacing: "-.02em" }}>
                              {formatMoney(result.price)}
                            </div>
                            <div style={{ fontSize: 16, color: colors.main, fontWeight: 600 }}>
                              = {formatHours(result.hours)} of work
                            </div>
                            <div style={{ marginTop: 6, display: "inline-block", padding: "3px 10px", background: colors.bg, border: `1px solid ${colors.main}44`, borderRadius: 50, fontSize: 11, color: colors.main, fontWeight: 700 }}>
                              {colors.label}
                            </div>
                          </div>
                        </div>
 
                        {/* Verdict buttons */}
                        {!decision ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => logDecision(false)} style={{
                              flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #1a3a1a",
                              background: "linear-gradient(135deg, #0a1f0a, #0e2a0e)", color: "#34d399",
                              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14,
                            }}>✕ Skip It</button>
                            <button onClick={handleShare} style={{
                              padding: "14px 16px", borderRadius: 14, border: "1px solid #1e1e2e",
                              background: "#0e0e18", color: "#555",
                              fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14,
                            }}>↗ Share</button>
                            <button onClick={() => logDecision(true)} style={{
                              flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #3a1a1a",
                              background: "linear-gradient(135deg, #1f0a0a, #2a0e0e)", color: "#f87171",
                              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14,
                            }}>✓ Buy It</button>
                          </div>
                        ) : (
                          <div style={{
                            padding: "14px", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 600,
                            background: decision === "skipped" ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                            border: `1px solid ${decision === "skipped" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                            color: decision === "skipped" ? "#34d399" : "#f87171",
                          }}>
                            {decision === "skipped" ? "✕ Skipped — nice save!" : "✓ Logged — enjoy it!"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
 
                {!salary && (
                  <button className="ghost" onClick={() => setScreen("setup")}>⚙ Set up your pay rate first</button>
                )}
              </div>
            )}
 
            {/* ── LOG ── */}
            {screen === "log" && (
              <div className="screen" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
 
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Hours Saved", value: formatHours(totalHoursSaved), color: "#34d399", bg: "rgba(52,211,153,0.08)" },
                    { label: "Total Spent", value: formatMoney(totalSpent), color: "#f87171", bg: "rgba(248,113,113,0.08)" },
                    { label: "Skipped", value: skippedCount, color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: "-.02em" }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "#444", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
 
                {/* Weekly chart */}
                {log.length > 0 && (
                  <div className="card">
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>This Week's Spend</div>
                    <WeekChart log={log} />
                  </div>
                )}
 
                {/* Log list */}
                {log.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                    <div style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>No items logged yet</div>
                    <div style={{ fontSize: 13, color: "#222", marginTop: 6 }}>Check a price and log your decision</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#2a2a3a", letterSpacing: ".1em", textTransform: "uppercase" }}>Recent Decisions</div>
                    {log.map((entry, i) => {
                      const c = getColor(entry.hours);
                      return (
                        <div key={i} className="log-item" style={{ borderLeft: `3px solid ${entry.bought ? "#f87171" : "#34d399"}`, animationDelay: `${i * 0.04}s` }}>
                          <div style={{ minWidth: 36, fontSize: 22 }}>
                            {entry.bought ? "🛍️" : "✕"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: "#ccc", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
                            <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{entry.category} · {entry.date}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: entry.bought ? "#f87171" : "#34d399" }}>{formatMoney(entry.price)}</div>
                            <div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>{formatHours(entry.hours)} work</div>
                          </div>
                        </div>
                      );
                    })}
                    <button className="ghost" style={{ fontSize: 12, color: "#2a2a3a", borderColor: "#111", marginTop: 4 }}
                      onClick={() => { if (confirm("Clear all entries?")) { setLog([]); localStorage.removeItem("wh_log"); } }}>
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
 
