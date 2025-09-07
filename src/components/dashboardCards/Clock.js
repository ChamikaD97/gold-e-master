import React, { useState, useEffect } from "react";
import { Typography, Space, Card } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Clock = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      bordered={false}
      style={{ 
        width: "fit-content",
        padding: "8px 16px",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        backgroundColor: "transparent"
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
        {formattedDate}            </div>
      
      



    </Card>
  );
};

export default Clock;
