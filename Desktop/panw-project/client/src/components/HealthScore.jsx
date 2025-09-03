import React, { useMemo } from "react";
import { Card } from "./UI.jsx";

export default function HealthScore({ score }) {
  const badge = useMemo(() => {
    const s = score?.score ?? null;
    if (s == null) return "-";
    let bg = "#e5f7ee", fg = "#0f7a47";
    if (s < 40) { bg = "#fdecea"; fg = "#b42318"; }
    else if (s < 70) { bg = "#fff4e5"; fg = "#b76e00"; }
    return <span style={{ background: bg, color: fg, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>{s}/100</span>;
  }, [score]);

  return (
    <Card title="Financial Health Breakdown" style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 8 }}>Overall: {badge}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {(score?.signals || []).map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{s.name}</div>
            <div style={{ height: 8, background: "#eee", borderRadius: 8 }}>
              <div style={{ height: 8, width: `${Math.max(0, Math.min(100, s.value))}%`, background: "#3b82f6", borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>{s.hint}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
