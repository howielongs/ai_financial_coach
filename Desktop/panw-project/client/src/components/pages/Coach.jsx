import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Card } from "../UI.jsx";
import WhatIfPlanner from "../WhatIfPlanner.jsx";
import CoffeeCoach from "../../components/CoffeeCoach.jsx";

// Normalize uploaded rows into the shape CoffeeCoach expects
function normalizeTx(rows = []) {
  return rows
    .map((r) => {
      const DateStr = r.Date ?? r.date;
      const d = DateStr ? new Date(DateStr) : null;
      const amt = Number(r.Amount ?? r.amount);
      return {
        Date: DateStr || null,
        Merchant: String(r.Merchant ?? r.merchant ?? "Unknown"),
        Category: String(r.Category ?? r.category ?? "Uncategorized"),
        Amount: Number.isFinite(amt) ? amt : 0,
        _date: d && !isNaN(d) ? d : null,
      };
    })
    // keep valid *purchases* only; ignore refunds/payroll (<= 0)
    .filter((r) => r._date && r.Amount > 0);
}

export default function CoachPage() {
  const { privacy, income, goal, months, version } = useOutletContext();

  // Summary coach note
  const [coach, setCoach] = useState(null);
  const [err, setErr] = useState("");

  // Ask-the-coach state
  const [q, setQ] = useState("");
  const [busyAsk, setBusyAsk] = useState(false);
  const [qa, setQA] = useState([]); // [{q, a, source, ts}]

  // CSV-backed transactions for CoffeeCoach
  const [tx, setTx] = useState([]);

  // Fetch coach summary
  useEffect(() => {
    let m = true;
    setErr("");
    (async () => {
      try {
        const res = await api.coach({ income, goal, months, privacy });
        if (m) setCoach(res);
      } catch (e) {
        if (m) { setErr(String(e.message || e)); setCoach(null); }
      }
    })();
    return () => { m = false; };
  }, [privacy, income, goal, months, version]);

  // Fetch transactions whenever Uploader bumps `version`
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await api.transactions({ limit: 10000 });
        if (!alive) return;
        setTx(normalizeTx(Array.isArray(rows) ? rows : (rows?.rows || [])));
      } catch (e) {
        console.warn("[Coach] transactions fetch failed:", e);
        if (alive) setTx([]);
      }
    })();
    return () => { alive = false; };
  }, [version]);

  // Clear Q&A when dataset or privacy changes (keeps answers relevant)
  useEffect(() => {
    setQA([]);
  }, [version, privacy]);

  async function onAsk(e) {
    e.preventDefault();
    const question = q.trim();
    if (!question) return;
    setBusyAsk(true);
    try {
      const res = await api.ask({ question, privacy, income, goal, months });
      setQA((prev) => [
        ...prev,
        { q: question, a: res?.answer || "No answer.", source: res?.source, ts: Date.now() },
      ]);
      setQ("");
    } catch (e) {
      setQA((prev) => [
        ...prev,
        { q: question, a: `Error: ${String(e.message || e)}`, source: "error", ts: Date.now() },
      ]);
    } finally {
      setBusyAsk(false);
    }
  }

  const Bullets = ({ items = [] }) => (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px", display: "grid", gap: 16 }}>
      {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}

      <Card title="AI Coach (Summary)">
        {!coach ? (
          <p>Loading…</p>
        ) : coach.llm_note ? (
          <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{coach.llm_note}</p>
        ) : coach.nudges?.length ? (
          <Bullets items={coach.nudges} />
        ) : (
          <p>No guidance available yet.</p>
        )}
      </Card>

      <Card title="Ask the Coach">
        <form onSubmit={onAsk} style={{ display: "grid", gap: 10 }}>
          <input
            type="text"
            placeholder="e.g., How much did I spend on coffee? Any odd charges last month?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={busyAsk}
            style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={busyAsk || !q.trim()}>
              {busyAsk ? "Asking…" : "Ask"}
            </button>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Uses your current privacy + goal settings
            </span>
          </div>
        </form>

        {!!qa.length && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {qa.slice().reverse().map((item) => (
              <div key={item.ts} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  You asked:
                </div>
                <div style={{ marginBottom: 6 }}><strong>{item.q}</strong></div>
                <div style={{ whiteSpace: "pre-wrap" }}>{item.a}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  Source: {item.source || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Coffee-specific yes/no + suggestions */}
      <Card title="Coffee Coach">
        <CoffeeCoach transactions={tx} />
        {!tx.length && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Upload a CSV to analyze coffee spending (expects Date, Merchant, Amount — Category optional).
          </div>
        )}
      </Card>

      <WhatIfPlanner income={income} goal={goal} months={months} />
    </div>
  );
}
