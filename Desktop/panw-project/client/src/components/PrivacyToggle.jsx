import React from "react";

export default function PrivacyToggle({ value, onChange }) {
  return (
    <label style={{ fontSize: 14 }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ marginRight: 6 }} />
      Privacy mode
    </label>
  );
}
