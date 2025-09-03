import React from "react";
import { Card, Th, Td } from "../UI.jsx";

export default function SubscriptionsTable({ subs }) {
  return (
    <Card title="Subscriptions / Gray Charges">
      {!subs?.length ? <p>No recurring charges detected.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Merchant</Th><Th>Charge</Th><Th>Months</Th><Th>Count</Th></tr></thead>
          <tbody>
            {subs.map((s, i) => (
              <tr key={i}>
                <Td>{s.merchant}</Td><Td>${s.charge}</Td><Td>{s.months}</Td><Td>{s.count}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
