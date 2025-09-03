import React, { useState } from "react";
import { Card } from "./UI.jsx";
import { api } from "../lib/api.js";

export default function Uploader({ onAnyChange }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(""); setErr(""); setBusy(true);
    try {
      const res = await api.uploadCSV(file);
      setMsg(`Uploaded ${Number(res.rows || 0).toLocaleString()} rows ✅`);
      onAnyChange?.();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const reset = async () => {
    setMsg(""); setErr(""); setBusy(true);
    try { await api.resetSample(); setMsg("Reset to sample data ✅"); onAnyChange?.(); }
    catch (e) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  };

  const clear = async () => {
    if (!window.confirm("This removes all data from memory for this demo. Continue?")) return;
    setMsg(""); setErr(""); setBusy(true);
    try { await api.clearData(); setMsg("Cleared data ✅"); onAnyChange?.(); }
    catch (e) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  };

  const downloadSample = () => {
    const csv = [
      "date,merchant,amount",
      "2025-09-01,STARBUCKS,4.95",
      "2025-09-01,SAFEWAY,62.13",
      "2025-09-02,UBER,15.80",
      "2025-09-02,AMAZON,23.50",
      "2025-09-03,TRADER JOE'S,41.27",
      "2025-09-03,SPOTIFY,9.99",
      "2025-09-04,NETFLIX,15.49",
      "2025-09-06,T-MOBILE,70.00",
      "2025-09-08,Local Pizza,18.25",
      "2025-09-15,PAYROLL,-1800.00",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sample-transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="Data Controls">
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept=".csv" onChange={onChange} disabled={busy} />
        <button onClick={reset} disabled={busy}>Use Sample Data</button>
        <button onClick={clear} disabled={busy}>Clear Data</button>
        <button onClick={downloadSample} disabled={busy}>Download Sample CSV</button>
        {busy && <span>Working…</span>}
      </div>
      {msg && <div style={{ color: "#08660b", marginTop: 8 }}>{msg}</div>}
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
    </Card>
  );
}
