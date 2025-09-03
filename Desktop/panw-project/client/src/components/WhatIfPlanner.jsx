import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./UI.jsx";
import { api } from "../lib/api.js";

function Badge({ on }) {
  const text = on ? "On Track" : "Not Yet";
  const bg = on ? "#e5f7ee" : "#fdecea";
  const fg = on ? "#0f7a47" : "#b42318";
  return <span style={{ background: bg, color: fg, padding: "4px 10px", borderRadius: 999, fontWeight: 700 }}>{text}</span>;
}

export default function WhatIfPlanner({ categories, income, goal, months }) {
  const [cuts, setCuts] = useState({});
  const [whatIf, setWhatIf] = useState(null);
  const deb = useRef();

  const onSlider = (name, v) => {
    const next = { ...cuts, [name]: Math.max(0, Number(v) || 0) };
    setCuts(next);
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(async () => {
      const data = await api.whatIf(next, { income, goal, months });
      setWhatIf(data);
    }, 200);
  };

  const reset = () => { setCuts({}); setWhatIf(null); };

  const list = useMemo(() =>
    (categories || []).map(({ name, spend }) => ({
      name, spend: Number(spend || 0), val: Math.min(Math.round(spend || 0), Math.round(cuts[name] || 0))
    })), [categories, cuts]);

  return (
    <Card title="🔧 What-If Planner (Cut by Category)">
      {list.length === 0 ? <p>No categories to adjust.</p> : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {list.map(({ name, spend, val }) => (
              <div key={name} style={{ display: "grid", gridTemplateColumns: "140px 1fr 100px", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 14 }}>{name}</div>
                <input type="range" min={0} max={Math.round(spend)} step={1} value={val} onChange={(e) => onSlider(name, e.target.value)} />
                <div style={{ fontSize: 13, textAlign: "right" }}>-${val.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={reset}>Reset Cuts</button>
            <span>{whatIf?.forecast ? <Badge on={!!whatIf.forecast.on_track} /> : "Adjust sliders to simulate"}</span>
          </div>
          {whatIf && (
            <div style={{ marginTop: 8, color: "#555", fontSize: 14 }}>
              New expense: <strong>${Number(whatIf.new_expense || 0).toLocaleString()}</strong>{" "}
              (from ${Number(whatIf.current_expense || 0).toLocaleString()})
            </div>
          )}
        </>
      )}
    </Card>
  );
}
