// Centralized, tiny API client
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function j(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || res.statusText);
  return data;
}

export const api = {
  // reads
  summary: (privacy=false) => fetch(`${API}/summary?privacy=${privacy ? "1":"0"}`).then(j),
  subscriptions: (privacy=false) => fetch(`${API}/subscriptions?privacy=${privacy ? "1":"0"}`).then(j),
  anomalies: (privacy=false) => fetch(`${API}/anomalies?privacy=${privacy ? "1":"0"}`).then(j),
  trends: (months=6) => fetch(`${API}/trends?months=${months}`).then(j),
  compare: ({income, goal, months}) =>
    fetch(`${API}/compare?income_monthly=${income}&goal_amount=${goal}&months_to_goal=${months}`).then(j),
  forecast: ({income, goal, months}) =>
    fetch(`${API}/forecast?income_monthly=${income}&goal_amount=${goal}&months_to_goal=${months}`).then(j),
  score: (income) => fetch(`${API}/score?income_monthly=${income}`).then(j),

  // writes
  uploadCSV: async (file) => {
    const fd = new FormData(); fd.append("file", file);
    return j(await fetch(`${API}/upload`, { method: "POST", body: fd }));
  },
  resetSample: () => fetch(`${API}/reset`, { method: "POST" }).then(j),
  clearData:  () => fetch(`${API}/clear`, { method: "POST" }).then(j),
  whatIf: (cuts, {income, goal, months}) =>
    fetch(`${API}/whatif?income_monthly=${income}&goal_amount=${goal}&months_to_goal=${months}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuts)
    }).then(j),
    coach: ({income, goal, months, privacy}) =>
  fetch(`${API}/coach?income_monthly=${income}&goal_amount=${goal}&months_to_goal=${months}&privacy=${privacy ? "1":"0"}`).then(j),
ask: ({question, privacy, income, goal, months}) =>
  fetch(`${API}/ask?privacy=${privacy ? "1":"0"}&income_monthly=${income}&goal_amount=${goal}&months_to_goal=${months}`, {
    method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ question })
  }).then(j),

};

export { API };


