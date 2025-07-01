import React, { useEffect } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../images/favicona.ico"; // Optional logo

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard"); // uncomment when needed
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
     marginTop:'150px',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        animation: "fadeIn 1.5s ease-in-out",
      }}
    >
      <img
        src={logo}
        alt="GoldE-Tea Logo"
        style={{ width: 130, height: 130,  }}
      />
      <h1 style={{ fontSize: "4rem", color: "black", marginBottom: 5 }}>
        GoldE-Tea
      </h1>
      <p style={{ fontSize: "3rem", color: "black", marginBottom: 20 }}>
        Green House Plantation
      </p>
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default Splash;
