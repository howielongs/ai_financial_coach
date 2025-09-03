import React from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";
import { Card } from "../UI.jsx";

export default function MerchBar({ topMerchants }) {
  ensureChartSetup();
  const labels = Object.keys(topMerchants || {});
  const dataVals = Object.values(topMerchants || {});
  const data = { labels, datasets: [{ label: "This Month ($)", data: dataVals }] };

  return (
    <Card title="Top 10 Merchants (This Month)">
      {labels.length ? <Bar data={data} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                      : <p>Loading…</p>}
    </Card>
  );
}
