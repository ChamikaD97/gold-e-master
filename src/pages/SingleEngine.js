// SingleEngine.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Button, Typography, Divider } from "antd";
import axios from "axios";
import "./SingleEngine.css"; // Assuming you will create a separate CSS file

const { Title, Text } = Typography;

const SingleEngine = () => {
  const { subClass } = useParams();
  const navigate = useNavigate();
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL =  "http://13.61.26.58:5000";

  useEffect(() => {
    const fetchEngine = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/engines/engineBySubClass?subClass=${subClass}`,
          {
            headers: { Authorization: "token" },
          }
        );
        setEngine(response.data);
      } catch (error) {
        console.error("Error fetching engine:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEngine();
  }, [subClass]);

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  }

  if (!engine) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        No engine found!
      </div>
    );
  }

  return (
    <div className="engine-details-container">
      <Card
        title={<Title level={3}>Engine Details</Title>}
        style={{
          maxWidth: "800px",
          margin: "20px auto",
          padding: "20px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
          borderRadius: "15px",
        }}
      >
        <div className="engine-details">
          <p>
            <strong>Class:</strong> <Text>{engine.class || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Sub Class:</strong> <Text>{engine.subClass || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Power (Hp):</strong> <Text>{engine.powerHp || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Axle Structure:</strong> <Text>{engine.axleStructure || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Power Engine:</strong> <Text>{engine.powerEngine || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Year:</strong> <Text>{engine.year || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Country:</strong> <Text>{engine.country || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Company:</strong> <Text>{engine.company || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Shed:</strong> <Text>{engine.shed || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Condition:</strong> <Text>{engine.condition || "N/A"}</Text>
          </p>
          <Divider />
          <p>
            <strong>Specifications:</strong> <Text>{engine.specifications || "N/A"}</Text>
          </p>
        </div>
        <Button
          type="primary"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Card>
    </div>
  );
};

export default SingleEngine;
