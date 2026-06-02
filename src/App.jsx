import { useState, useEffect, useRef } from "react";
const CATEGORIES = ["🛍️ Shopping", "🍕 Food", "🎮 Entertainment", "✈️ Travel", "🏠 Home", "👗 Clothing", "💄 Beauty", "🔧 Tools", "📚 Education", "❓ Other"];
function formatHours(hours) { if (hours < 1 / 60) return ${Math.round(hours * 3600)}s of work; if (hours < 1) { const mins = Math.round(hours * 60); return ${mins} min${mins !== 1 ? "s" : ""} of work; } const h = Math.floor(hours); const m = Math.round((hours - h) * 60); if (m === 0) return ${h} hr${h !== 1 ? "s" : ""} of work; return ${h}h ${m}m of work; }
function formatMoney(n) {
return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
function PulseRing({ color }) {
return (
<div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.2, animation: "pulse 2s ease-in-out infinite" }} />
);
}
export default function App() {
const [screen, setScreen] = useState("setup");
const [salary, setSalary] = useState("");
const [salaryType, setSalaryType] = useState("hourly");
const [taxRate, setTaxRate] = useState(25);
const [price, setPrice] = useState("");
const [category, setCategory] = useState("🛍️ Shopping");
const [itemName, setItemName] = useState("");
const [result, setResult] = useState(null);
const [log, setLog] = useState([]);
const [animating, setAnimating] = useState(false);
const [decision, setDecision] = useState(null);
const inputRef = useRef(null);
useEffect(() => {
const stored = localStorage.getItem("wh_log");
if (stored) setLog(JSON.parse(stored));
const storedSalary = localStorage.getItem("wh_salary");
const storedType = localStorage.getItem("wh_type");
const storedTax = localStorage.getItem("wh_tax");
if (storedSalary) { setSalary(storedSalary); setSalaryType(storedType || "hourly"); setTaxRate(Number(storedTax) || 25); setScreen("check"); }
}, []);
const hourlyRate = () => {
const raw = parseFloat(salary);
if (!raw) return 0;
const gross = salaryType === "annual" ? raw / 52 / 40 : raw;
return gross * (1 - taxRate / 100);
};
const calculate = () => {
const p = parseFloat(price);
if (!p || !hourlyRate()) return;
setAnimating(true);
setDecision(null);
setTimeout(() => {
setResult({ hours: p / hourlyRate(), price: p, name: itemName || "This item", category });
setAnimating(false);
}, 800);
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
const newLog = [entry, ...log].slice(0, 50);
setLog(newLog);
localStorage.setItem("wh_log", JSON.stringify(newLog));
setDecision(bought ? "bought" : "skipped");
};
const totalHoursSaved = log.filter(e => !e.bought).reduce((a, e) => a + e.hours, 0);
const totalSpent = log.filter(e => e.bought).reduce((a, e) => a + e.price, 0);
const hoursColor = (hours) => {
if (hours < 1) return "
#4ade80";
if (hours < 4) return "
#facc15";
if (hours < 8) return "
#fb923c";
return "
#f87171";
};
const ring = result ? hoursColor(result.hours) : "
#6366f1";
return ( <div style={{ minHeight: "100vh", background: "
#0a0a0f", color: "
#f0f0f5", fontFamily: "'DM Mono', 'Courier New', monospace", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 40px", }}> <style>{        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');         * { box-sizing: border-box; margin: 0; padding: 0; }         @keyframes pulse { 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(1.4);opacity:.3} }         @keyframes spin-ring { from{stroke-dashoffset:283} to{stroke-dashoffset:0} }         @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }         @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }         @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,.6)} }         input:focus { outline: none; }         select:focus { outline: none; }         button:active { transform: scale(0.97); }         ::-webkit-scrollbar { width: 4px; }         ::-webkit-scrollbar-track { background: transparent; }         ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }         .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 18px; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .05em; transition: all .2s; border-bottom: 2px solid transparent; }         .tab-btn.active { border-bottom-color: #6366f1; color: #a5b4fc; }         .tab-btn:not(.active) { color: #555; }         .tab-btn:hover:not(.active) { color: #888; }         .primary-btn { background: #6366f1; border: none; color: white; padding: 14px 32px; border-radius: 12px; font-family: 'DM Mono', monospace; font-size: 14px; cursor: pointer; letter-spacing: .08em; transition: all .2s; font-weight: 500; }         .primary-btn:hover { background: #7c7ffa; }         .ghost-btn { background: transparent; border: 1px solid #333; color: #888; padding: 12px 24px; border-radius: 10px; font-family: 'DM Mono', monospace; font-size: 13px; cursor: pointer; transition: all .2s; }         .ghost-btn:hover { border-color: #555; color: #ccc; }         .field { display: flex; flex-direction: column; gap: 8px; }         .label { font-size: 11px; letter-spacing: .12em; color: #555; text-transform: uppercase; }         .input-base { background: #13131a; border: 1px solid #222; border-radius: 10px; color: #f0f0f5; font-family: 'DM Mono', monospace; font-size: 15px; padding: 13px 16px; transition: border .2s; width: 100%; }         .input-base:focus { border-color: #6366f1; }         select.input-base { appearance: none; cursor: pointer; }         .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 16px; padding: 20px; }         .decision-btn { flex: 1; padding: 16px; border-radius: 12px; font-family: 'DM Mono', monospace; font-size: 14px; cursor: pointer; border: none; font-weight: 500; letter-spacing: .05em; transition: all .2s; }      }</style>
  <div style={{ width: "100%", maxWidth: 480, paddingTop: 40, marginBottom: 8 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>WORTH IT?</span>
      <span style={{ fontSize: 11, color: "#444", letterSpacing: ".15em" }}>TIME COST CALCULATOR</span>
    </div>
  </div>

  <div style={{ width: "100%", maxWidth: 480, display: "flex", borderBottom: "1px solid #1a1a2e", marginBottom: 28 }}>
    <button className={`tab-btn ${screen === "setup" ? "active" : ""}`} onClick={() => setScreen("setup")}>SETUP</button>
    <button className={`tab-btn ${screen === "check" ? "active" : ""}`} onClick={() => setScreen("check")}>CHECK</button>
    <button className={`tab-btn ${screen === "log" ? "active" : ""}`} onClick={() => setScreen("log")}>LOG ({log.length})</button>
  </div>

  <div style={{ width: "100%", maxWidth: 480 }}>

    {screen === "setup" && (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease" }}>
        <p style={{ color: "#555", fontSize: 13, lineHeight: 1.7 }}>
          Enter your pay so we can convert any price into real hours of your life.
        </p>

        <div className="field">
          <span className="label">Pay Type</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["hourly", "annual"].map(t => (
              <button key={t} onClick={() => setSalaryType(t)} style={{
                flex: 1, padding: "12px", border: `1px solid ${salaryType === t ? "#6366f1" : "#222"}`,
                background: salaryType === t ? "#1a1a35" : "#13131a", color: salaryType === t ? "#a5b4fc" : "#555",
                borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 13, cursor: "pointer", letterSpacing: ".05em", transition: "all .2s"
              }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">{salaryType === "hourly" ? "Hourly Rate ($)" : "Annual Salary ($)"}</span>
          <input className="input-base" type="number" placeholder={salaryType === "hourly" ? "e.g. 25.00" : "e.g. 65000"} value={salary} onChange={e => setSalary(e.target.value)} />
        </div>

        <div className="field">
          <span className="label">Tax Rate ({taxRate}%)</span>
          <input type="range" min={0} max={50} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
            style={{ accentColor: "#6366f1", width: "100%", cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444" }}>
            <span>0%</span><span>Take-home: {formatMoney(hourlyRate())}/hr</span><span>50%</span>
          </div>
        </div>

        <button className="primary-btn" style={{ width: "100%", marginTop: 8 }} onClick={saveSetup} disabled={!salary}>
          SAVE &amp; START CHECKING →
        </button>
      </div>
    )}

    {screen === "check" && (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease" }}>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PulseRing color={ring} />
            <svg width="160" height="160" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="#1a1a2e" strokeWidth="6" />
              {result && (
                <circle cx="80" cy="80" r="70" fill="none" stroke={ring} strokeWidth="6"
                  strokeDasharray="440" strokeLinecap="round"
                  style={{ animation: "none", strokeDashoffset: Math.max(0, 440 - Math.min(440, (result.hours / 40) * 440)) }}
                />
              )}
            </svg>
            <div style={{ textAlign: "center", zIndex: 1 }}>
              {animating ? (
                <div style={{ fontSize: 28, animation: "pulse 1s infinite" }}>⏳</div>
              ) : result ? (
                <>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: ring, lineHeight: 1 }}>
                    {result.hours < 1 ? Math.round(result.hours * 60) : result.hours.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: ".1em", marginTop: 2 }}>
                    {result.hours < 1 ? "MINUTES" : "HOURS"}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "#333", letterSpacing: ".08em" }}>ENTER PRICE</div>
              )}
            </div>
          </div>
        </div>

        {result && !animating && (
          <div className="card" style={{ textAlign: "center", animation: "fadeUp .4s ease", borderColor: ring + "44" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{result.category} · {result.name}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
              {formatMoney(result.price)}
            </div>
            <div style={{ fontSize: 24, color: ring, fontWeight: 500, marginBottom: 8 }}>
              = {formatHours(result.hours)}
            </div>
            <div style={{ fontSize: 12, color: "#444" }}>
              at {formatMoney(hourlyRate())}/hr take-home
            </div>

            {!decision && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="decision-btn" onClick={() => logDecision(false)}
                  style={{ background: "#1a2e1a", color: "#4ade80", border: "1px solid #2a4a2a" }}>
                  ✕ SKIP IT
                </button>
                <button className="decision-btn" onClick={() => logDecision(true)}
                  style={{ background: "#2e1a1a", color: "#f87171", border: "1px solid #4a2a2a" }}>
                  ✓ BUYING IT
                </button>
              </div>
            )}
            {decision && (
              <div style={{ marginTop: 12, padding: "10px", background: decision === "skipped" ? "#1a2e1a" : "#2e1a1a",
                borderRadius: 8, fontSize: 13, color: decision === "skipped" ? "#4ade80" : "#f87171" }}>
                {decision === "skipped" ? "✕ Skipped — logged to your record" : "✓ Purchased — logged to your record"}
              </div>
            )}
          </div>
        )}

        <div className="field">
          <span className="label">Item Name (optional)</span>
          <input className="input-base" placeholder="e.g. Nike Air Max..." value={itemName} onChange={e => setItemName(e.target.value)} />
        </div>

        <div className="field">
          <span className="label">Price ($)</span>
          <input ref={inputRef} className="input-base" type="number" placeholder="0.00" value={price}
            onChange={e => { setPrice(e.target.value); setResult(null); setDecision(null); }}
            style={{ fontSize: 24, padding: "16px", textAlign: "center" }} />
        </div>

        <div className="field">
          <span className="label">Category</span>
          <select className="input-base" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <button className="primary-btn" style={{ width: "100%" }} onClick={calculate} disabled={!price || !salary}>
          CALCULATE COST IN TIME
        </button>

        <button className="ghost-btn" style={{ width: "100%", fontSize: 12 }} onClick={() => setScreen("setup")}>
          ⚙ Change Pay Rate ({formatMoney(hourlyRate())}/hr)
        </button>
      </div>
    )}

    {screen === "log" && (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .4s ease" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ borderColor: "#1a2e1a" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: ".1em", marginBottom: 6 }}>HOURS SAVED</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#4ade80" }}>
              {totalHoursSaved.toFixed(1)}h
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>by skipping purchases</div>
          </div>
          <div className="card" style={{ borderColor: "#2e1a1a" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: ".1em", marginBottom: 6 }}>TOTAL SPENT</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#f87171" }}>
              {formatMoney(totalSpent)}
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>on logged purchases</div>
          </div>
        </div>

        {log.length === 0 ? (
          <div style={{ textAlign: "center", color: "#333", padding: "40px 0", fontSize: 13 }}>
            No purchases logged yet.<br />
            <span style={{ fontSize: 11 }}>Check an item and log your decision.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {log.map((entry, i) => (
              <div key={i} className="card" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderLeft: `3px solid ${entry.bought ? "#f87171" : "#4ade80"}`,
                padding: "14px 16px"
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "#ccc", marginBottom: 2 }}>{entry.name}</div>
                  <div style={{ fontSize: 11, color: "#444" }}>{entry.category} · {entry.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, color: entry.bought ? "#f87171" : "#4ade80", fontWeight: 500 }}>
                    {formatMoney(entry.price)}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>{formatHours(entry.hours)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {log.length > 0 && (
          <button className="ghost-btn" style={{ width: "100%", fontSize: 11, color: "#3a3a4a" }}
            onClick={() => { if (confirm("Clear all log entries?")) { setLog([]); localStorage.removeItem("wh_log"); } }}>
            CLEAR LOG
          </button>
        )}
      </div>
    )}
  </div>
</div>
);
}


