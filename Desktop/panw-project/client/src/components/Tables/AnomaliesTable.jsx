import React from "react";
import { Card, Th, Td } from "../UI.jsx";

export default function AnomaliesTable({ anoms }) {
  return (
    <Card title="🚨 Anomalies (Outlier Transactions)">
      {!anoms?.length ? <p>No obvious outliers.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Date</Th><Th>Merchant</Th><Th>Amount</Th><Th>z-score</Th></tr></thead>
          <tbody>
            {anoms.map((a, i) => (
              <tr key={i}>
                <Td>{a.date}</Td><Td>{a.merchant}</Td><Td>${a.amount}</Td><Td>{Number(a.z_score).toFixed(2)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
