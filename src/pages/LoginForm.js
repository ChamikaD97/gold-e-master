import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Input, Typography, Form } from "antd";
import FullPageLayout from "../components/FullPageLayout";
import icon from "../images/logo.ico";
import { login } from "../api/api";
import { toast } from "react-toastify";

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

  const handleLogin = async () => {
    if (!userName || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const data = await login(userName, password);
      if (data.user.status) {
        toast.error(data.user.status);
        return;
      }
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(errMsg);


    }
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
        <div style={{ marginBottom: 12, textAlign: "center" }}>
          <img
            src={icon}
            alt="SLMS"
            style={{ width: 100, height: 100, marginBottom: 8, borderRadius: 50, border: "1px solid white" }}
          />
          <div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 22 }}>SLMS</div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>SUPER LEAF MONITORING SYSTEM</div>
            <div style={{ fontSize: 14, color: "#ccc" }}>GREENHOUSE PLANTATION (PVT) LTD</div>
          </div>
          newServer
        </div>

        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} colon={false}>
          <Form.Item label={<span style={{ color: "white" }}>User Name</span>} required>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
          </Form.Item>

          <Form.Item label={<span style={{ color: "white" }}>Password</span>} required>
            <Input.Password value={password} onPressEnter={handleLogin} onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Text type="danger">{error}</Text>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button type="primary" onClick={handleLogin}>Login</Button>
              <Button type="primary" danger onClick={() => {
                setUserName("");
                setPassword("");
                setError("");
              }}>Clear</Button>
            </div>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: "center", marginBottom: 0 }}>
            <Text style={{ color: "#ccc" }}>
              Don’t have an account? <Link to="/register">Register</Link>
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </FullPageLayout>
  );
};

export default LoginPage;
