import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Card } from "../UI.jsx";
import SubscriptionsTable from "../Tables/SubscriptionsTable.jsx";
import AnomaliesTable from "../Tables/AnomaliesTable.jsx";

export default function InsightsPage() {
  const { privacy, version } = useOutletContext();

  const [subs, setSubs] = useState(null);
  const [anoms, setAnoms] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    setErr("");
    setSubs(null);
    setAnoms(null);
    (async () => {
      try {
        const [s, a] = await Promise.all([
          api.subscriptions(privacy),
          api.anomalies(privacy),
        ]);
        if (!live) return;
        setSubs(Array.isArray(s) ? s : []);
        setAnoms(Array.isArray(a) ? a : []);
      } catch (e) {
        if (!live) return;
        setErr(String(e?.message || e));
        setSubs([]);
        setAnoms([]);
      }
    })();
    return () => { live = false; };
  }, [privacy, version]);

  return (
    <div style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px", display: "grid", gap: 16 }}>
      {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}

      <Card title={`Subscriptions & Gray Charges${subs?.length >= 0 ? ` (${subs.length})` : ""}`}>
        {subs === null ? <p>Loading…</p> : (
          subs.length ? <SubscriptionsTable rows={subs} /> : <p>No recurring charges detected.</p>
        )}
      </Card>

      <Card title={`Anomalies${anoms?.length >= 0 ? ` (${anoms.length})` : ""}`}>
        {anoms === null ? <p>Loading…</p> : (
          anoms.length ? <AnomaliesTable rows={anoms} /> : <p>No anomalies flagged.</p>
        )}
      </Card>
    </div>
  );
}
