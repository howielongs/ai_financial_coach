import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const nav = useNavigate();
  const [skip, setSkip] = useState(Boolean(localStorage.getItem("sfc_seenWelcome")));

  useEffect(() => {
    document.title = "DoughDash — Welcome";
  }, []);

  const start = () => {
    if (skip) localStorage.setItem("sfc_seenWelcome", "1");
    nav("/dashboard");
  };

  const onToggleSkip = (e) => {
    const checked = e.target.checked;
    setSkip(checked);
    if (checked) localStorage.setItem("sfc_seenWelcome", "1");
    else localStorage.removeItem("sfc_seenWelcome");
  };

  return (
    <>
      <style>{`
        .welcome-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(1200px 600px at 50% -10%, #eef2ff 0%, rgba(238,242,255,0) 60%),
            linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
          z-index: -1;
        }
        .welcome-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(760px, 92%);
          background: #ffffff;
          border: 1px solid #eef2f7;
          border-radius: 16px;
          padding: clamp(22px, 3vw, 32px) clamp(18px, 3vw, 28px);
          box-shadow: 0 10px 30px rgba(16, 24, 40, 0.06);
          text-align: center;
        }
        .welcome-eyebrow {
          display: inline-block;
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: .04em;
          padding: 6px 10px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        .welcome-title {
          font-size: clamp(28px, 6vw, 48px);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 10px;
        }
        .welcome-sub {
          color: #4b5563;
          font-size: clamp(16px, 2.8vw, 18px);
          margin: 0 0 22px;
        }
        .welcome-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 12px 18px;
          border-radius: 12px;
          transition: transform .12s ease, box-shadow .12s ease, background .2s ease, color .2s ease, border-color .2s ease;
          cursor: pointer;
          font-weight: 600;
        }
        .btn:focus-visible {
          outline: 3px solid #a5b4fc;
          outline-offset: 2px;
        }
        /* DoughDash brand: friendly green primary */
        .btn-primary {
          background: #22c55e; /* green-500 */
          color: #ffffff;
          border: 1px solid #22c55e;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(16, 185, 129, 0.25);
          background: #16a34a; /* green-600 */
          border-color: #16a34a;
        }
        .btn-outline {
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
        }
        .btn-outline:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(17, 24, 39, 0.08);
          border-color: #d1d5db;
        }
        .welcome-foot {
          margin-top: 14px;
          color: #6b7280;
          font-size: 14px;
        }
        .welcome-foot input {
          margin-right: 6px;
        }
      `}</style>

      <div className="welcome-bg" />
      <div className="welcome-card" role="dialog" aria-labelledby="welcome-title" aria-describedby="welcome-sub">
        <div className="welcome-eyebrow">DoughDash — Demo</div>
        <h1 id="welcome-title" className="welcome-title">Dash through your dough 🥖💸</h1>
        <p id="welcome-sub" className="welcome-sub">
          DoughDash turns transactions into friendly, actionable nudges.
          Upload a CSV or use sample data, flip Privacy Mode on, and instantly see where your money goes.
        </p>

        <div className="welcome-actions" role="group" aria-label="Welcome actions">
          <button className="btn btn-primary" onClick={start}>
            Get started
          </button>
          <button className="btn btn-outline" onClick={() => nav("/dashboard")}>
            Explore dashboard
          </button>
        </div>

        <div className="welcome-foot">
          <label>
            <input
              type="checkbox"
              checked={skip}
              onChange={onToggleSkip}
              aria-label="Skip this welcome next time"
            />
            Skip this welcome next time
          </label>
        </div>
      </div>
    </>
  );
}
