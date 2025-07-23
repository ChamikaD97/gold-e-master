import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Typography,
  Form
} from "antd";
import FullPageLayout from "../components/FullPageLayout";
import icon from "../images/logo.ico";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleLogin = () => {
    import("../data/users/users.json")
      .then((module) => {
        const users = module.default || [];

        localStorage.setItem("users", JSON.stringify(users));

        const user = users.find(
          (u) => u.userName === userName && u.password === password
        );

        if (user) {
          const sessionData = {
            ...user,
            expiry: Date.now() + 1000 * 60 * 60,  // 1 hour in milliseconds
          };
          localStorage.setItem("loggedInUser", JSON.stringify(sessionData));
          navigate("/dashboard");
        } else {
          setError("Invalid User Name or password");
        }
      })
      .catch((err) => {
        console.error("Failed to load users.json", err);
        setError("Could not load initial user data.");
      });
  };


  return (
    <FullPageLayout>
      <Card
        bordered={false}
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          borderRadius: 12,
          padding: 14,
          width: 460,
          color: "white",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.6s ease, transform 0.6s ease"
        }}
      >
        {/* Branding */}
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <img
            src={icon}
            alt="SLMS"
            style={{
              width: 100,
              height: 100,
              marginBottom: 8,
              borderRadius: 50,
              border: "1px solid white"
            }}
          />
          <div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 22 }}>
              SLMS
            </div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
              SUPER LEAF MONITORING SYSTEM
            </div>
            <div style={{ fontSize: 14, color: "#ccc" }}>
              GREENHOUSE PLANTATION (PVT) LTD
            </div>
          </div>
        </div>

        <Form
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          colon={false}
        >
          <Form.Item
            label={<span style={{ color: "white" }}>User Name</span>}
            required
          >
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "white" }}>Password</span>}
            required
          >
            <Input.Password
              value={password}
              onPressEnter={handleLogin}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Text type="danger">{error}</Text>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 14, span: 10 }}>
            <Button type="primary" block onClick={handleLogin}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </FullPageLayout>
  );
};

export default LoginPage;
