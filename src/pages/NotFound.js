import React from "react";
import { Layout, Result, Button, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import background from "../images/background.jpg";

const { Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isNotFound = location.pathname === "/404";

  const NotFoundPage = () => (
    <Result
      status="404"
      title={<Title style={{ fontSize: "120px", marginBottom: 0 }}>404</Title>}
      subTitle={
        <Text type="secondary" style={{ fontSize: "18px" }}>
          Sorry, the page you visited does not exist
        </Text>
      }
      extra={
        <Button type="primary" size="large">
          <Link to="/">Back Home</Link>
        </Button>
      }
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    />
  );

  return (
    <Layout style={{ 
      minHeight: "100vh",
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <Content style={{ 
        padding: "0 50px",
        paddingTop: "64px", // Space for fixed header
        minHeight: "100vh"
      }}>
        <div style={{ 
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          justifyContent: "center",
          alignItems: isNotFound ? "center" : "flex-start"
        }}>
          {isNotFound ? <NotFoundPage /> : children}
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;