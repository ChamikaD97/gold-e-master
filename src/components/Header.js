import React, { useEffect, useState } from "react";
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
  AimOutlined,
} from "@ant-design/icons";
import SettingsModal from "../components/SettingsModal";

import icon from "../images/logo.ico";
import { Table } from "@mui/material";
import { CardTravelSharp, SummarizeRounded, TableBar, TurnSharpRightTwoTone } from "@mui/icons-material";

const { Header } = Layout;
const { SubMenu } = Menu;

const HeaderComponent = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [role, setRole] = useState('');
  const [username, setUserName] = useState('');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    if (loggedInUser) {
      const role = loggedInUser.role || ''
      setRole(role)
      setUserName(loggedInUser.username)
    }

  }, [])


  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload(); // ✅ Force page reload after redirect
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
            style={{ width: 24, height: 24, marginRight: 2 }}
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
            {
              role !== 'User' && (


                <Menu.Item key="missing">
                  <Link to="/missing">Missing/Rejoing Suppliers</Link>
                </Menu.Item>
              )}

          </SubMenu>






          <SubMenu key="factory-targets" icon={<FileOutlined />} title="Targets & Achievements">
            {
              role === 'Super Admin' && (

                <Menu.Item key="targets" >
                  <Link to="/targets">Manage Targets</Link>
                </Menu.Item>

              )}
            {
              role !== 'User' && (
                <Menu.Item key="target-prediction">
                  <Link to="/factory-targets/prediction">Target Prediction</Link>
                </Menu.Item>


              )}

            <Menu.Item key="officer-targets">
              <Link to="/factory-targets/officer">Analysis</Link>
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


          {
            role !== 'User' && (
              <Menu.Item key="summery" icon={<SummarizeRounded />}>
                <Link to="/summery">Summery</Link>
              </Menu.Item>

            )}





          {
            role === 'Super Admin' && (
              <Menu.Item key="users" icon={<CardTravelSharp />}>
                <Link to="/users">Users</Link>
              </Menu.Item>

            )}

        </Menu>
        <Avatar style={{ backgroundColor: '#206b00ff' }} icon={<UserOutlined />} />
        <Tooltip title="Logged in user">
          <div style={{ color: "white", fontWeight: "normal", marginLeft: 16 }}>
            {username ? 'Hi , ' + username : ''}
          </div>
        </Tooltip>

        {/* Action Buttons */}
        <div style={{ padding: "0 25px", display: "flex", gap: 15 }}>

          {
            role === 'Super Admin' && (
              <Tooltip title="Settings">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettings(true)}
                />
              </Tooltip>
            )
          }


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
