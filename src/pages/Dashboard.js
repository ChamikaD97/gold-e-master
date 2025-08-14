import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import Clock from "../components/dashboardCards/Clock";
import { fetchLines, login } from "../api/api";
import { setAllLines } from "../redux/officerLineSlice";

const { Text, Title } = Typography;

const cardStyle = {
  background: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  borderRadius: 12,
  marginBottom: 16,
};


const Dashboard = () => {
  const dispatch = useDispatch();
  const lines = useSelector((state) => state.officerLine.allLines);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Fetch lines from backend
  const getLines = async () => {
    try {
      const data = await fetchLines();
      dispatch(setAllLines(data));
    } catch (err) {
      message.error("Failed to fetch lines");
      console.error(err);
    }
  };

  useEffect(() => {
    getLines();
  }, []);

  useEffect(() => {
    if (lines.length === 0) {
      message.warning("No lines available. Please add lines to continue.");
    } else {
      console.log("Lines fetched successfully:", lines);

      message.success("Lines fetched successfully.");
    }
  }, [lines]);

  return (
    <div style={{ padding: 10 }}>
      {/* Logo Header */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }} className="fade-in">
          <img
            src={icon}
            alt="SLMS"
            style={{
              width: 120, height: 120, borderRadius: "50%", border: "1px solid white", border: "2px solid white",
              boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            }}
          />

          <div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
              SUPER LEAF MONITORING SYSTEM
            </div>
            <div style={{ fontSize: 16, color: "#ccc" }}>GREENHOUSE PLANTATION (PVT) LTD</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Clock />
          </div>
        </div>

      </Card>

      {/* Chart 1 | Chart 2 | Search Supplier by ID */}







    </div>
  );
};

export default Dashboard;
