// File: src/layouts/MainLayout.js
import React, { useState, useEffect } from "react";
import { Layout, Typography } from "antd";
import { useLocation, Outlet } from "react-router-dom";
import background1 from "../images/background1.png";
import background2 from "../images/background2.png";
import background3 from "../images/background3.png";
import background4 from "../images/background4.png";
import background5 from "../images/background5.png";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = () => {
  const location = useLocation();
  const isNotFound = location.pathname === "/404";

  const backgrounds = [background1, background2, background3, background4, background5];
  const [currentBg, setCurrentBg] = useState(backgrounds[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setCurrentBg(backgrounds[randomIndex]);

    // Optional: change background every 15 seconds
    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * backgrounds.length);
      setCurrentBg(backgrounds[index]);
    }, 25000); // 15000ms = 15 seconds

    return () => clearInterval(interval);
  }, []);

  const NotFoundTextOnly = () => (
    <div
      style={{
        textAlign: "center",
        color: "#fff",
        width: "100%",
        animation: "fadeIn 1s ease-in-out"
      }}
    >
      <Title style={{ fontSize: "120px", marginBottom: 0, color: "#fff" }}>404</Title>
      <Text style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)" }}>
        Sorry, the page you visited does not exist.
      </Text>
    </div>
  );

  return (
    <Layout
      style={{
        height: "100vh",
        backgroundImage: `url(${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "background-image 1s ease-in-out"
      }}
    >
      <Header style={{ background: "rgba(0,0,0,0.6)", padding: "0 24px", height: 64 }}>
        <Title level={4} style={{ color: "#fff", margin: 0, lineHeight: "64px" }}>
          🌿 Company Portal
        </Title>
      </Header>

      <Content
        style={{
          flex: 1,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            overflowY: "auto",
            padding: 24
          }}
        >
          {isNotFound ? <NotFoundTextOnly /> : <Outlet />}
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
