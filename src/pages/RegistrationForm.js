import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Typography,
  Form,
  Select
} from "antd";
import FullPageLayout from "../components/FullPageLayout";
import icon from "../images/logo.ico";

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleRegister = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = users.some((u) => u.userName === userName);

    if (userExists) {
      setError("User Name already registered");
    } else {
      users.push({ name, userName, password, role });
      localStorage.setItem("users", JSON.stringify(users));
      navigate("/login");
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
          <Form.Item label={<span style={{ color: "white" }}>Name</span>} required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "white" }}>User Name</span>} required>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "white" }}>Password</span>} required>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "white" }}>Role</span>} required>
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: "100%" }}
            >
              <Option value="Super Admin">Super Admin</Option>
              <Option value="Admin">Admin</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Text type="danger">{error}</Text>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 14, span: 10 }}>
            <Button type="primary" block onClick={handleRegister}>
              Register
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: "center", marginBottom: 0 }}>
            <Text style={{ color: "#ccc" }}>
              Already have an account? <Link to="/login">Login</Link>
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </FullPageLayout>
  );
};

export default RegisterPage;
