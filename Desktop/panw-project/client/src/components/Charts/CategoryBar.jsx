import React from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";
import { Card } from "../UI.jsx";

export default function CategoryBar({ byCategory = {} }) {
  ensureChartSetup();

  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory).map((n) => Number(n) || 0);

  const data = { labels, datasets: [{ label: "This Month ($)", data: values }] };

  const options = {
    plugins: { legend: { display: false }, tooltip: { callbacks: {
      label: (ctx) => `$${Number(ctx.raw).toLocaleString()}`
    }}},
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } },
    },
  };

  return (
    <Card title="Spending by Category (This Month)">
      {labels.length ? (
        <div style={{ height: 320 }}>
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p>No category data yet.</p>
      )}
    </Card>
  );
}
