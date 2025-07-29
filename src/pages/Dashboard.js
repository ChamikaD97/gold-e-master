import React, {  useState } from "react";
import { Card, Col, Row, Typography, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { SearchRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { showLoader } from "../redux/loaderSlice";
import Clock from "../components/dashboardCards/Clock";

const { Text, Title } = Typography;

const cardStyle = {
  background: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  borderRadius: 12,
  marginBottom: 16,
};


const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

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
