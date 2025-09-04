import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  padding: "8px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 15,
  color: isActive ? "#1e3a8a" : "#374151", // active: indigo-900, default: gray-700
  background: isActive ? "#eef2ff" : "transparent",
  transition: "all 0.2s ease",
});

export default function Navbar() {
  const nav = useNavigate();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Brand */}
        <div
          onClick={() => nav("/dashboard")}
          style={{
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 20,
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          💸 DoughDash
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 4 }}>
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/charts" style={linkStyle}>
            Charts
          </NavLink>
          <NavLink to="/coach" style={linkStyle}>
            AI Coach
          </NavLink>
          <NavLink to="/insights" style={linkStyle}>
            Insights
          </NavLink>
        </nav>

        {/* Actions */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            onClick={() => nav("/welcome")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              background: "#f9fafb",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#f9fafb";
            }}
          >
            Welcome
          </button>
        </div>
      </div>
    </header>
  );
}
