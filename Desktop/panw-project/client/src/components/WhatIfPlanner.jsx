import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../lib/api.js";
import { Card } from "./UI.jsx";

export default function WhatIfPlanner({ income: incomeProp, goal: goalProp, months: monthsProp }) {
  const { version, income: incomeCtx, goal: goalCtx, months: monthsCtx, privacy } = useOutletContext();
  const income = incomeProp ?? incomeCtx ?? 1800;
  const goal   = goalProp   ?? goalCtx   ?? 3000;
  const months = monthsProp ?? monthsCtx ?? 10;

  const [cats, setCats] = useState([]);        // [{name, current}]
  const [cuts, setCuts] = useState({});        // { category: number }
  const [res, setRes] = useState(null);        // what-if result
  const [err, setErr] = useState("");

  const debounce = useRef(0);

  // Load current categories (from summary) whenever data changes
  useEffect(() => {
    let live = true;
    setErr("");
    (async () => {
      try {
        const s = await api.summary(privacy);
        const entries = Object.entries(s?.by_category || {}).map(([name, amt]) => ({ name, current: Number(amt) || 0 }));
        if (live) {
          setCats(entries);
          // reset cuts when dataset changes
          const zeroCuts = Object.fromEntries(entries.map(e => [e.name, 0]));
          setCuts(zeroCuts);
        }
      } catch (e) {
        if (live) { setErr(String(e?.message || "Failed to load categories")); setCats([]); }
      }
    })();
    return () => { live = false; };
  }, [version, privacy]);

  // Fire /api/whatif whenever cuts or inputs change (debounced)
  useEffect(() => {
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      try {
        const payload = Object.fromEntries(Object.entries(cuts).filter(([, v]) => Number(v) > 0));
        const w = await api.whatIf(payload, { income, goal, months });
        setRes(w);
      } catch (e) {
        setErr(String(e?.message || "What-if failed"));
      }
    }, 250);
    return () => window.clearTimeout(debounce.current);
  }, [cuts, income, goal, months]);

  const totalCut = useMemo(() => Object.values(cuts).reduce((a, b) => a + Number(b || 0), 0), [cuts]);

  const onSlide = (name, value) => {
    setCuts((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <Card title="What-If Planner">
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      {!cats.length ? (
        <p>No categories found yet. Upload a CSV or use sample data.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Drag sliders to “trim” categories. We’ll recompute your goal forecast instantly.
          </div>

          {cats.map(({ name, current }) => (
            <div key={name} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <strong>{name}</strong>
                <span style={{ color: "#6b7280" }}>
                  Current: ${current.toFixed(2)} &nbsp;|&nbsp; Cut: ${Number(cuts[name] || 0).toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(20, Math.round(current))}
                step={5}
                value={Number(cuts[name] || 0)}
                onChange={(e) => onSlide(name, e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <Badge label="Estimated $ Saved" value={`$${Math.round(totalCut).toLocaleString()}/mo`} />
            <Badge label="On Track" value={res?.forecast?.on_track ? "Yes" : "No"} ok={!!res?.forecast?.on_track} />
          </div>

          {res && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
              <Stat label="Current Expense" value={`$${Number(res.current_expense || 0).toLocaleString()}`} />
              <Stat label="New Expense" value={`$${Number(res.new_expense || 0).toLocaleString()}`} />
              <Stat label="Need / mo" value={`$${Number(res.forecast?.need_per_month || 0).toLocaleString()}`} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Badge({ label, value, ok }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 999,
      background: ok === undefined ? "#eff6ff" : ok ? "#dcfce7" : "#fee2e2",
      color: ok === undefined ? "#1e40af" : ok ? "#166534" : "#991b1b",
      fontSize: 12, fontWeight: 600
    }}>
      <span>{label}:</span><span>{value}</span>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
