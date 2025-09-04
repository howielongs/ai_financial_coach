import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Card, KPI } from "../UI.jsx";
import Uploader from "../Uploader.jsx";
import PrivacyToggle from "../PrivacyToggle.jsx";
import HealthScore from "../HealthScore.jsx";
import ForecastCard from "../ForecastCard.jsx";
import WhatIfPlanner from "../WhatIfPlanner.jsx";

export default function Dashboard() {
  const { privacy, setPrivacy, income, setIncome, goal, setGoal, months, setMonths, version } = useOutletContext(); // NEW version
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const s = await api.summary(privacy);
        if (m) { setSummary(s); setErr(""); }
      } catch (e) {
        if (m) { setErr(String(e.message || e)); setSummary({}); }
      }
    })();
    return () => { m = false; };
  }, [privacy, version]); // <-- refetch whenever data changes

  const byCatTop = summary ? Object.entries(summary.by_category || {}).slice(0, 3) : [];
  const topMerchTop = summary ? Object.entries(summary.top_merchants || {}).slice(0, 3) : [];

  return (
    <div style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px", display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <PrivacyToggle privacy={privacy} onChange={setPrivacy} />
        <Uploader />
        {err && <span style={{ color: "crimson", fontSize: 12 }}>{err}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <KPI title="Current Period" value={summary?.period || "—"} />
        <KPI title="Total Spend (mo)" value={summary ? `$${summary.total_expense_month.toLocaleString()}` : "—"} />
        <KPI title="Coffee" value={summary ? `$${(summary.coffee?.coffee_spend || 0).toFixed(2)}` : "—"} sub="This month" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <HealthScore income={income} />
        <ForecastCard income={income} goal={goal} months={months} />
      </div>

      <Card title="Quick Glance: Top Categories">
        {!byCatTop.length ? <p>No data yet.</p> : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {byCatTop.map(([k,v]) => <li key={k}>{k}: ${v.toFixed ? v.toFixed(2) : v}</li>)}
          </ul>
        )}
      </Card>

      <Card title="Top Merchants">
        {!topMerchTop.length ? <p>No data yet.</p> : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {topMerchTop.map(([k,v]) => <li key={k}>{k}: ${v.toFixed ? v.toFixed(2) : v}</li>)}
          </ul>
        )}
      </Card>

      <WhatIfPlanner income={income} goal={goal} months={months} />
    </div>
  );
}
