import React, { useCallback, useEffect, useMemo, useState } from "react";
import Uploader from "./components/Uploader.jsx";
import PrivacyToggle from "./components/PrivacyToggle.jsx";
import HealthScore from "./components/HealthScore.jsx";
import ForecastCard from "./components/ForecastCard.jsx";
import WhatIfPlanner from "./components/WhatIfPlanner.jsx";
import TrendsLine from "./components/Charts/TrendsLine.jsx";
import CategoryBar from "./components/Charts/CategoryBar.jsx";
import MerchBar from "./components/Charts/MerchBar.jsx";
import SubscriptionsTable from "./components/Tables/SubscriptionsTable.jsx";
import AnomaliesTable from "./components/Tables/AnomaliesTable.jsx";
import { KPI } from "./components/UI.jsx";
import { api } from "./lib/api.js";
import CoachPanel from "./components/CoachPanel.jsx";

export default function App() {
  // Core data
  const [summary, setSummary] = useState(null);
  const [subs, setSubs] = useState([]);
  const [anoms, setAnoms] = useState([]);
  const [trends, setTrends] = useState(null);
  const [compare, setCompare] = useState(null);
  const [score, setScore] = useState(null);
  const [forecast, setForecast] = useState(null);

  // Inputs
  const [income, setIncome] = useState(1800);
  const [goal, setGoal] = useState(3000);
  const [months, setMonths] = useState(10);
  const [privacy, setPrivacy] = useState(false);
  // load once
useEffect(() => {
  const s = JSON.parse(localStorage.getItem("sfc_prefs") || "{}");
  if (s.privacy !== undefined) setPrivacy(!!s.privacy);
  if (s.income) setIncome(s.income);
  if (s.goal) setGoal(s.goal);
  if (s.months) setMonths(s.months);
}, []);

// save on change
useEffect(() => {
  localStorage.setItem("sfc_prefs", JSON.stringify({ privacy, income, goal, months }));
}, [privacy, income, goal, months]);

  const reloadReads = useCallback(async () => {
    const [s, sub, a, t, c, f, sc] = await Promise.all([
      api.summary(privacy), api.subscriptions(privacy), api.anomalies(privacy),
      api.trends(6), api.compare({ income, goal, months }), api.forecast({ income, goal, months }), api.score(income),
    ]);
    setSummary(s); setSubs(sub); setAnoms(a); setTrends(t); setCompare(c); setForecast(f); setScore(sc);
  }, [privacy, income, goal, months]);

  useEffect(() => { reloadReads(); }, [reloadReads]);
  useEffect(() => { (async () => {
    setCompare(await api.compare({ income, goal, months }));
    setForecast(await api.forecast({ income, goal, months }));
    setScore(await api.score(income));
  })(); }, [income, goal, months]);

  useEffect(() => { (async () => {
    setSummary(await api.summary(privacy));
    setSubs(await api.subscriptions(privacy));
    setAnoms(await api.anomalies(privacy));
  })(); }, [privacy]);

  const isEmpty = !summary || !summary.period;

  // KPIs & helper values
  const deltaOverall = compare ? (compare.delta_overall || 0) : 0;
  const deltaSign = deltaOverall > 0 ? "▲" : deltaOverall < 0 ? "▼" : "—";
  const deltaColor = deltaOverall > 0 ? "crimson" : deltaOverall < 0 ? "seagreen" : "#555";

  const categories = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.by_category || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ name: k, spend: Number(v) }));
  }, [summary]);

  const handleForecastChange = (patch) => {
    if (patch.income !== undefined) setIncome(patch.income);
    if (patch.goal !== undefined) setGoal(patch.goal);
    if (patch.months !== undefined) setMonths(patch.months);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Arial", padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>💰 Smart Financial Coach — Demo</h1>
          <p style={{ color: "#555", margin: 0 }}>Upload CSV or use sample data. Live insights, privacy mode, health score, what-if planning.</p>
        </div>
        <PrivacyToggle value={privacy} onChange={setPrivacy} />
      </div>

      <Uploader onAnyChange={reloadReads} />

      {isEmpty && (
        <div style={{marginTop:12, padding:12, border:"1px solid #f0c36d", background:"#fff8e1", borderRadius:10}}>
          <strong>No data loaded.</strong> Upload a CSV or click <em>Use Sample Data</em> to repopulate.
        </div>
      )}
      

      {/* KPIs */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
          <KPI title="This Month's Expenses" value={`$${Math.round(summary.total_expense_month || 0).toLocaleString()}`} />
          <KPI title="Period" value={summary.period || "-"} />
          <KPI title="MoM Change" value={<span style={{ color: deltaColor }}>{deltaSign} ${Math.abs(deltaOverall).toLocaleString()}</span>} sub="vs previous month" />
          <KPI title="Financial Health" value={
            score?.score != null
              ? <span style={{ background: "#e5f7ee", color: "#0f7a47", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                  {score.score}/100
                </span> : "-"
          } sub="Composite score" />
        </div>
      )}

      {score && <HealthScore score={score} />}
      {summary && <CoachPanel income={income} goal={goal} months={months} privacy={privacy} />}
      
      <button onClick={() => {
  const payload = { summary, subs, anoms, trends, compare, score, forecast, ts: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "financial_snapshot.json"; a.click();
  URL.revokeObjectURL(url);
}}>Export Snapshot</button>


      {/* Coffee insight */}
      {summary && (
        <div style={{ marginTop: 16, padding: 12, background: "#f6f7f9", borderRadius: 12 }}>
          <strong>☕ {summary.coffee?.message}</strong>
        </div>
      )}

      <TrendsLine trends={trends} />

      {/* Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <CategoryBar byCategory={summary?.by_category} />
        <MerchBar topMerchants={summary?.top_merchants} />
      </div>

      {/* Forecast + What-If */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ForecastCard
          income={income} goal={goal} months={months}
          onChange={handleForecastChange}
          forecast={forecast}
        />
        <WhatIfPlanner categories={categories} income={income} goal={goal} months={months} />
      </div>

      {/* Tables */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <SubscriptionsTable subs={subs} />
        <AnomaliesTable anoms={anoms} />
      </div>

      <p style={{ color: "#777", marginTop: 24 }}>
        Demo only — data stays in memory. Privacy mode masks merchant names. In production: OAuth + bank aggregator, TLS,
        encryption at rest, RBAC, masked logs, and model guardrails.
      </p>
    </div>
  );
}
