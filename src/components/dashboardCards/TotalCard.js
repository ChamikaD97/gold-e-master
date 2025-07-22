import React from "react";
import CountUp from "react-countup";

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

const TotalCard = ({ label, value, type }) => {
  return (
    <div style={{ ...cardStyles.base, ...cardStyles[type] }}>
      {label}
      <br />
      <CountUp style={{ fontSize: 30 }} end={Math.round(value)} duration={0.5} separator="," /> kg
    </div>
  );
};

export default TotalCard;
