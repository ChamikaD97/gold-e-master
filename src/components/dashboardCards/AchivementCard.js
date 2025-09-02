import React from "react";
import CountUp from "react-countup";
// import { a } from "react-spring"; // not used

const cardStyles = {
  base: {
    borderRadius: 10,
    padding: "14px 24px",
    textAlign: "center",
    fontWeight: 600,
    color: "#000",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  super: { backgroundColor: "#ffa347" },
  normal: { backgroundColor: "#47a3ff" },
  total: {
    backgroundColor: "#28a745",
    textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)",
    boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
  },
};

const barStyles = {
  outer: {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  inner: {
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    transition: "width 600ms ease",
  },
};

const AchivementCard = ({ label, target = 0, achived = 0, type }) => {
  const safeTarget = Number(target) || 0;
  const safeAchieved = Number(achived) || 0;

  const pctRaw = safeTarget > 0 ? (safeAchieved / safeTarget) * 100 : 0;
  const pct = Math.max(0, Math.min(pctRaw, 999));     // cap display at 999%
  const barPct = Math.max(0, Math.min(pctRaw, 100));  // 0..100 for the bar

  return (
    <div style={{ ...cardStyles.base, ...cardStyles[type] }}>
      {label}


      <div style={barStyles.outer}>
        <div style={{ ...barStyles.inner, width: `${barPct}%` }} />
      </div>

      <div style={{ marginTop: 6 }}>
        <CountUp end={pct} decimals={1} duration={0.6} />%
      </div>
    </div>
  );
};

export default AchivementCard;
