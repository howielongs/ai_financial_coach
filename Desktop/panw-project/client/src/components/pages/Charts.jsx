import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Card } from "../UI.jsx";
import TrendsLine from "../Charts/TrendsLine.jsx";
import CategoryBar from "../Charts/CategoryBar.jsx";
import MerchBar from "../Charts/MerchBar.jsx";

export default function ChartsPage() {
  const { privacy, version } = useOutletContext(); // <-- include version
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    setErr("");
    (async () => {
      try {
        const [s, t] = await Promise.all([
          api.summary(privacy),
          api.trends(6),
        ]);
        if (!live) return;
        setSummary(s || {});
        setTrends(t || { months: [], totals: [], by_category: {} });
      } catch (e) {
        if (live) {
          setErr(String(e?.message || e));
          setSummary({});
          setTrends({ months: [], totals: [], by_category: {} });
        }
      }
    })();
    return () => { live = false; };
  }, [privacy, version]); // <-- refetch on data change

  const months = trends?.months || [];
  const totals = (trends?.totals || []).map(Number);
  const byCategoryMonth = summary?.by_category || {};
  const topMerchants = summary?.top_merchants || {};

  return (
    <div style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px", display: "grid", gap: 16 }}>
      {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}

      <Card title="Total Spend — Last 6 Months">
        {months.length ? (
          <TrendsLine labels={months} values={totals} />
        ) : (
          <p>No trend data yet. Upload a multi-month CSV or click “Use Sample Data”.</p>
        )}
      </Card>


      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* NOTE: CategoryBar and MerchBar already render inside a Card, so we just render them directly */}
        <CategoryBar byCategory={byCategoryMonth} />
        <MerchBar topMerchants={topMerchants} />
      </div>
    </div>
  );
}
