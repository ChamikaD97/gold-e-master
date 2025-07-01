import React from "react";
import Lottie from "lottie-react";
import teaTimeAnimation from "../animations/tea-time.json"; // adjust if needed
import { Typography } from "antd";

const { Text } = Typography;

const TeaLoader = () => {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      borderRadius: 20,
      
      backgroundColor:"rgba(0, 21, 41, 0.6)",
    }}>
      <div style={{ width: 250, height: 250 }}>
        <Lottie animationData={teaTimeAnimation} loop autoplay />
      </div>
      <Text style={{ color: "#fff", fontSize: 18, marginTop: 12 }}>
        Brewing insights from the leaf data...
      </Text>
      <Text type="secondary" style={{ color: "#ccc", fontSize: 14 }}>
        Please wait while we prepare your dashboard 🍃
      </Text>
    </div>
  );
};

export default TeaLoader;


