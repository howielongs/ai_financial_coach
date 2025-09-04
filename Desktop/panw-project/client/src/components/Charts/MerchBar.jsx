import React from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";
import { Card } from "../UI.jsx";

export default function MerchBar({ topMerchants = {} }) {
  ensureChartSetup();

  const sorted = Object.entries(topMerchants)
    .map(([k, v]) => [k, Number(v) || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = sorted.map(([k]) => k);
  const values = sorted.map(([, v]) => v);

  const data = {
    labels,
    datasets: [{ label: "This Month ($)", data: values }],
  };

  const options = {
    indexAxis: "y",
    plugins: { legend: { display: false }, tooltip: { callbacks: {
      label: (ctx) => `$${Number(ctx.raw).toLocaleString()}`
    }}},
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } },
    },
  };

  return (
    <Card title="Top 10 Merchants (This Month)">
      {labels.length ? (
        <div style={{ height: Math.max(260, labels.length * 26) }}>
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p>No merchant data yet.</p>
      )}
    </Card>
  );
}
