import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Welcome from "../src/components/pages/Welcome.jsx";
import Dashboard from "../src/components/pages/Dashboard.jsx";
import Charts from "../src/components/pages/Charts.jsx";
import Coach from "../src/components/pages/Coach.jsx";
import Insights from "../src/components/pages/Insights.jsx";

function Layout({ contextValue }) {
  return (
    <>
      <Navbar />
      <Outlet context={contextValue} />
    </>
  );
}

export default function App() {
  const [privacy, setPrivacy] = useState(false);
  const [income, setIncome] = useState(1800);
  const [goal, setGoal] = useState(3000);
  const [months, setMonths] = useState(10);

  // NEW: dataset version signaled by server
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("sfc_prefs") || "{}");
    if (s.privacy !== undefined) setPrivacy(!!s.privacy);
    if (s.income) setIncome(s.income);
    if (s.goal) setGoal(s.goal);
    if (s.months) setMonths(s.months);
  }, []);
  useEffect(() => {
    localStorage.setItem("sfc_prefs", JSON.stringify({ privacy, income, goal, months }));
  }, [privacy, income, goal, months]);

  // NEW: poll health to pick up DATA_VERSION bumps after upload/reset/clear
  useEffect(() => {
    let alive = true, t;
    const poll = async () => {
      try {
        const h = await api.health();
        if (alive) setVersion(h.version || 0);
      } catch {/* ignore */}
      t = setTimeout(poll, 2000);
    };
    poll();
    return () => { alive = false; clearTimeout(t); };
  }, []);

  const ctx = { privacy, setPrivacy, income, setIncome, goal, setGoal, months, setMonths, version, setVersion };

  const seenWelcome = Boolean(localStorage.getItem("sfc_seenWelcome"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<Layout contextValue={ctx} />}>
          <Route index element={<Navigate to={seenWelcome ? "/dashboard" : "/welcome"} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
