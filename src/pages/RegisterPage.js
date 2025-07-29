import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Typography,
  Form,
  message,
} from "antd";
import FullPageLayout from "../components/FullPageLayout";
import icon from "../images/logo.ico";
import { register } from "../api/api";

const { Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    import("../data/users/users.json")
      .then((module) => {
        const users = module.default || [];
        localStorage.setItem("users", JSON.stringify(users));
      })
      .catch((err) => {
        console.error("Failed to load users.json", err);
        setError("Could not load initial user data.");
      });
  }, []);
  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      const { userName, password, role } = values;

      const response = await register(userName, password, role);

      message.success("Registration successful!");
      console.log(response);

      navigate("/login");
    } catch (error) {
      if (error?.errorFields) {
        // Form validation errors
        return;
      }
      console.log(error);

      const errMsg =
        error?.response?.data?.message || "Registration failed. Please try again.";
      message.error(errMsg);
    }
  };


  const selectedRole = Form.useWatch("role", form);

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
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
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
              border: "1px solid white",
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
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          colon={false}
          initialValues={{ role: "User" }}
        >
          <Form.Item
            label={<span style={{ color: "white" }}>User Name</span>}
            name="userName"
            rules={[{ required: true, message: "Please enter your user name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "white" }}>Password</span>}
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "white" }}>Role</span>}
            name="role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              {["Super Admin", "Admin", "User"].map((r) => (
                <Button
                  key={r}
                  type={selectedRole === r ? "primary" : "default"}
                  onClick={() => form.setFieldsValue({ role: r })}
                  style={{ flex: 1 }}
                >
                  {r}
                </Button>
              ))}
            </div>
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <Text type="danger">{error}</Text>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 14, span: 10 }}>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button type="primary" block onClick={handleRegister}>
                Register
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => {
                  form.resetFields();
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            wrapperCol={{ span: 24 }}
            style={{ textAlign: "center", marginBottom: 0 }}
          >
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
