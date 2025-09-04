import React from "react";

export default function SubscriptionsTable({ rows = [] }) {
  const data = rows
    .map(r => ({
      merchant: String(r.merchant ?? ""),
      charge: Number(r.charge ?? 0),
      count: Number(r.count ?? 0),
      months: String(r.months ?? ""),
    }))
    .sort((a, b) => (b.count - a.count) || (b.charge - a.charge) || a.merchant.localeCompare(b.merchant));

  if (!data.length) return null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>Merchant</Th>
            <Th>Charge</Th>
            <Th>Months</Th>
            <Th>Count</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={`${r.merchant}-${i}`} style={{ borderTop: "1px solid #e5e7eb" }}>
              <Td>{r.merchant}</Td>
              <Td>${r.charge.toFixed(2)}</Td>
              <Td>{r.months}</Td>
              <Td>{r.count}</Td>
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
