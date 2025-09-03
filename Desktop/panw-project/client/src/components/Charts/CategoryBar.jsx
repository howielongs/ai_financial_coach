import React from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";
import { Card } from "../UI.jsx";

export default function CategoryBar({ byCategory }) {
  ensureChartSetup();
  const labels = Object.keys(byCategory || {});
  const dataVals = Object.values(byCategory || {});
  const data = { labels, datasets: [{ label: "This Month ($)", data: dataVals }] };

  return (
    <Card title="Spending by Category (This Month)">
      {labels.length ? <Bar data={data} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                      : <p>Loading…</p>}
    </Card>
  );
}
