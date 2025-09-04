import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../lib/api.js";
import { Card } from "./UI.jsx";

export default function HealthScore({ income: incomeProp }) {
  const { version, income: incomeCtx } = useOutletContext();
  const income = incomeProp ?? incomeCtx ?? 1800;

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErr("");
    (async () => {
      try {
        const d = await api.score(income);
        if (live) setData(d);
      } catch (e) {
        if (live) {
          setErr(String(e?.message || "Failed to load score"));
          setData(null);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [income, version]);

  const bar = (val) => (
    <div style={{ background: "#e5e7eb", height: 8, borderRadius: 4 }}>
      <div style={{ width: `${Math.max(0, Math.min(100, val))}%`, height: 8, borderRadius: 4, background: "#3b82f6" }} />
    </div>
  );

  return (
    <Card title="Financial Health">
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {!loading && !err && data && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
            {data.score ?? "—"}<span style={{ fontSize: 16, color: "#6b7280", marginLeft: 6 }}>/100</span>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Period: {data.period || "—"}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {(data.signals || []).map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <span style={{ color: "#6b7280" }}>{s.value}%</span>
                </div>
                {bar(s.value)}
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.hint}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
