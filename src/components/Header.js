import React, { useState } from "react";
import { Layout, Menu, Button, Tooltip, Avatar } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  SolutionOutlined,
  FundOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileOutlined,
  UserOutlined,
  InfoCircleFilled,
} from "@ant-design/icons";
import SettingsModal from "../components/SettingsModal";

import icon from "../images/logo.ico";
import { Table } from "@mui/material";
import { SummarizeRounded, TableBar } from "@mui/icons-material";

const { Header } = Layout;
const { SubMenu } = Menu;

const HeaderComponent = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");


  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("users");
    navigate("/login");
  };
  return (
    <>
      <Header
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1,
          width: "100%",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Logo and Name */}
        <div
          style={{
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <img
            src={icon}
            alt="SLMS"
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          <span style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
            SLMS
          </span>
        </div>

        {/* Menu */}
        <Menu theme="dark" mode="horizontal" style={{ flex: 1 }}>
          <Menu.Item key="dashboard" icon={<AppstoreOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>

          <SubMenu key="suppliers" icon={<SolutionOutlined />} title="Suppliers">
            <Menu.Item key="supplier-info">
              <Link to="/supplier/info">Supplier Info</Link>
            </Menu.Item>
            <Menu.Item key="route-suppliers">
              <Link to="/suppliers/routes">Route Suppliers</Link>
            </Menu.Item>
          </SubMenu>






          <SubMenu key="factory-targets" icon={<FileOutlined />} title="Targets & Achievements">
            <Menu.Item key="target-prediction">
              <Link to="/factory-targets/prediction">Target Prediction</Link>
            </Menu.Item>
            <Menu.Item key="officer-targets">
              <Link to="/factory-targets/officer">Officer Targets</Link>
            </Menu.Item>

          </SubMenu>

          <SubMenu key="leaf" icon={<FundOutlined />} title="Leaf">
            <Menu.Item key="leaf-supply">
              <Link to="/leaf/supply">Leaf Supply</Link>
            </Menu.Item>
            <Menu.Item key="todaySupply">
              <Link to="/leaf/todaySupply/officer">Today Suppliers</Link>
            </Menu.Item>


            <Menu.Item key="leaf-counts">
              <Link to="/leaf/count">Leaf Counts</Link>
            </Menu.Item>
            <Menu.Item key="missing-cards">
              <Link to="/leaf/lastSupply">Last Supply</Link>
            </Menu.Item>
            <Menu.Item key="daily-leaf-supply">
              <Link to="/leaf/dailyLeafSupply">Daily Leaf Supply</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="summery" icon={<SummarizeRounded />}>
            <Link to="/summery">Summery</Link>
          </Menu.Item>

          {/* <Menu.Item key="meal" icon={<CoffeeOutlined />}>
            <Link to="/meal">Meal Management</Link>
          </Menu.Item> */}
        </Menu>
        <Avatar style={{ backgroundColor: '#206b00ff' }} icon={<UserOutlined />} />
        {loggedInUser && (
          <Tooltip title="Logged in user">
            <div style={{ color: "white", fontWeight: "bold", marginLeft: 16 }}>
              {loggedInUser.name}
            </div>
          </Tooltip>
        )}

        {/* Action Buttons */}
        <div style={{ padding: "0 25px", display: "flex", gap: 15 }}>


          <Tooltip title="Settings">
            <Button
              type="primary"
              shape="circle"
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(true)}
            />
          </Tooltip>

          <Tooltip title="Logout">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            />
          </Tooltip>


        </div>

      </Header>

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default HeaderComponent;
