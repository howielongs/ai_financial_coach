import React, { useMemo } from "react";
import { assessCoffeeSpending } from "../lib/coffeeCoach";

export default function CoffeeCoach({ transactions = [] }) {
  const result = useMemo(() => assessCoffeeSpending(transactions), [transactions]);
  const ok = result?.ok;

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Coffee Coach</h2>
        <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 999, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
          Beta
        </span>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <strong>Am I spending too much on coffee?</strong>
        </div>

        {!ok ? (
          <div style={{ color: "#6b7280" }}>{result?.answer || "No data yet."}</div>
        ) : (
          <>
            <div style={{ fontWeight: 800, color: result.reason === "over" ? "#b91c1c" : "#166534" }}>
              {result.answer}
            </div>

            {/* why */}
            {result.details?.flags?.length > 0 && (
              <ul style={{ marginTop: 10, marginBottom: 12, paddingLeft: 18 }}>
                {result.details.flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}

            {/* quick metrics */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4, marginBottom: 12 }}>
              <Badge label={`Last month: $${result.details.monthlyTotal}`} />
              <Badge label={`${result.details.monthlyCount} coffees`} />
              <Badge label={`~${result.details.visitsPerWeek}/wk`} />
              <Badge label={`Avg ticket: $${result.details.avgTicket}`} />
            </div>

            {/* suggestions */}
            {result.suggestions?.length > 0 && (
              <>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Try these:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {result.suggestions.map((s, idx) => (
                    <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                      <div style={{ fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>Save about ${s.estMonthlySave}/mo</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Badge({ label }) {
  return (
    <span style={{
      fontSize: 12,
      padding: "4px 8px",
      borderRadius: 999,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#0f172a"
    }}>
      {label}
    </span>
  );
}
