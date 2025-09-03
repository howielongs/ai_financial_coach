import React from "react";

export function Card({ title, children, style }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e6e8eb", borderRadius: 12, padding: 16, ...style }}>
      {title && <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>}
      {children}
    </div>
  );
}

export function KPI({ title, value, sub }) {
  return (
    <div style={{ background: "#f6f7f9", borderRadius: 12, padding: 16 }}>
      <div style={{ color: "#667085", fontSize: 12 }}>{title}</div>
      <div style={{ fontWeight: 700, fontSize: 22 }}>{value}</div>
      {sub && <div style={{ color: "#777", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export const Th = ({ children }) => (
  <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: "10px 6px" }}>{children}</th>
);
export const Td = ({ children }) => (
  <td style={{ borderBottom: "1px solid #f3f4f6", padding: "10px 6px" }}>{children}</td>
);
