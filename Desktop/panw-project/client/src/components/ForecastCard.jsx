import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../lib/api.js";
import { Card } from "./UI.jsx";

export default function ForecastCard({ income: incomeProp, goal: goalProp, months: monthsProp }) {
  const { version, income: incomeCtx, goal: goalCtx, months: monthsCtx } = useOutletContext();
  const income = incomeProp ?? incomeCtx ?? 1800;
  const goal   = goalProp   ?? goalCtx   ?? 3000;
  const months = monthsProp ?? monthsCtx ?? 10;

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true); setErr("");
    (async () => {
      try {
        const d = await api.forecast({ income, goal, months });
        if (live) setData(d);
      } catch (e) {
        if (live) { setErr(String(e?.message || "Failed to load forecast")); setData(null); }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [income, goal, months, version]);

  const Pill = ({ ok }) => (
    <span style={{
      padding: "2px 8px", borderRadius: 999,
      background: ok ? "#dcfce7" : "#fee2e2",
      color: ok ? "#166534" : "#991b1b", fontSize: 12, fontWeight: 600
    }}>
      {ok ? "On track" : "Off track"}
    </span>
  );

  return (
    <Card title="Forecast to Goal">
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {!loading && !err && data && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <Pill ok={!!data.on_track} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Target: ${goal.toLocaleString()} in {months} mo
            </span>
          </div>
          <div style={{ fontSize: 14 }}>{data.message}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 6 }}>
            <Stat label="Monthly Surplus" value={`$${Number(data.surplus || 0).toLocaleString()}`} />
            <Stat label="Gap" value={`$${Number(data.gap || 0).toLocaleString()}`} />
            <Stat label="Need / mo" value={`$${Number(data.need_per_month || 0).toLocaleString()}`} />
          </div>
        </div>
      )}
    </Card>
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
