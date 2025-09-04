import React from "react";

export default function AnomaliesTable({ rows = [] }) {
  const data = rows
    .map(r => ({
      date: String(r.date ?? ""),
      merchant: String(r.merchant ?? ""),
      amount: Number(r.amount ?? 0),
      z_score: Number(r.z_score ?? 0),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1) || (b.z_score - a.z_score));

  if (!data.length) return null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Merchant</Th>
            <Th>Amount</Th>
            <Th>z-Score</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={`${r.date}-${r.merchant}-${i}`} style={{ borderTop: "1px solid #e5e7eb" }}>
              <Td>{r.date}</Td>
              <Td>{r.merchant}</Td>
              <Td>${r.amount.toFixed(2)}</Td>
              <Td>{r.z_score.toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 600, padding: "8px 6px" }}>
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td style={{ padding: "8px 6px", fontSize: 14 }}>
      {children}
    </td>
  );
}
