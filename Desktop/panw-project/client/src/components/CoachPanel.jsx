import React, { useEffect, useState } from "react";
import { Card } from "./UI.jsx";
import { api } from "../lib/api.js";

export default function CoachPanel({ income, goal, months, privacy }) {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.coach({ income, goal, months, privacy });
      if (mounted) setData(res);
    })();
    return () => { mounted = false; };
  }, [income, goal, months, privacy]);

  const ask = async (e) => {
    e.preventDefault();
    setAnswer("Thinking…");
    try {
      const res = await api.ask({ question: q, privacy, income, goal, months });
      setAnswer(res.answer);
    } catch (e2) {
      setAnswer(String(e2.message || e2));
    }
  };

  return (
    <Card title="🤖 AI Coach">
      {!data ? <p>Loading…</p> : (
        <>
          {data.llm_note ? (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{data.llm_note}</div>
          ) : (
            <ul style={{ margin: "0 0 8px 18px" }}>
              {data.nudges.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
          <form onSubmit={ask} style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about your spend (e.g., coffee, total, goal)…"
              style={{ flex: 1, padding: 8, border: "1px solid #e6e8eb", borderRadius: 8 }}
            />
            <button type="submit">Ask</button>
          </form>
          {!!answer && <div style={{ marginTop: 8, color: "#333" }}>{answer}</div>}
        </>
      )}
    </Card>
  );
}
