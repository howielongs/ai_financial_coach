import React from "react";
import { Card } from "./UI.jsx";

export default function ForecastCard({ income, goal, months, onChange, forecast }) {
  return (
    <Card title="Forecast to Goal">
      <div style={{ display: "grid", gap: 8 }}>
        <label>Monthly Income: <input type="number" value={income} onChange={e => onChange({ income: +e.target.value })} /></label>
        <label>Goal Amount: <input type="number" value={goal} onChange={e => onChange({ goal: +e.target.value })} /></label>
        <label>Months to Goal: <input type="number" value={months} onChange={e => onChange({ months: +e.target.value })} /></label>
      </div>
      <div style={{ marginTop: 12 }}>
        {!forecast ? <p>Loading…</p> : (
          <>
            <p><strong>{forecast.message}</strong></p>
            <ul style={{ marginTop: 8 }}>
              <li>Surplus (est.): ${Number(forecast.surplus || 0).toLocaleString()}</li>
              {!forecast.on_track && <li>Needed per month: ${Number(forecast.need_per_month || 0).toLocaleString()}</li>}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
