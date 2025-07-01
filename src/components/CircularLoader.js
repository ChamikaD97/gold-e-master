// src/components/CircularLoader.js
import React from 'react';
import './CircularLoader.css';
import icon from "../images/logo.ico";

const CircularLoader = () => {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0)",
    }}>
      <div className="circular-loader">
        <svg className="progress-ring spinning-ring" width="120" height="120">
          <circle

            style={{
              strokeDasharray: `${2 * Math.PI * 50}`,
              strokeDashoffset: `${2 * Math.PI * 50 * (1 - 0.75)}`, // 75%
              transition: 'stroke-dashoffset 0.5s ease-out'
            }}
            className="progress-ring__circle"
            stroke="white"
            strokeWidth="4"
            fill="transparent"
            r="50"
            cx="60"
            cy="60"
          />
        </svg>
        <img src={icon} alt="logo" className="center-image" />
      </div>

    </div>
  );
};

export default CircularLoader;
