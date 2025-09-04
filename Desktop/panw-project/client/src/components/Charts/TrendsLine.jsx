import React from "react";
import { Line } from "react-chartjs-2";
import { ensureChartSetup } from "../../lib/chartSetup.js";

export default function TrendsLine({ labels = [], values = [] }) {
  ensureChartSetup();

  const data = {
    labels,
    datasets: [
      {
        label: "Total Spend ($)",
        data: values.map(Number),
        tension: 0.3,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${Number(ctx.raw).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 300 }}>
      <Line data={data} options={options} />
    </div>
  );
}
