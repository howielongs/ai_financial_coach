import React from "react";
import { Line } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";
import { Card } from "../UI.jsx";

export default function TrendsLine({ trends }) {
  ensureChartSetup();
  const data = trends ? {
    labels: trends.months || [],
    datasets: [{ label: "Total Spend ($)", data: trends.totals || [], borderWidth: 2, tension: 0.25 }],
  } : null;

  return (
    <Card title="Spending Trend (Last 6 Months)" style={{ marginTop: 20 }}>
      {data ? <Line data={data} options={{ plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }} />
            : <p>Loading…</p>}
    </Card>
  );
}
