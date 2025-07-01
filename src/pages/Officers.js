import React, { useState } from "react";
import {
  Card, Col, Row, Button
} from "antd";
import { ReloadOutlined, UserOutlined } from "@ant-design/icons";
import '../App.css';

import lineIdCodeMap from "../data/lineIdCodeMap.json";
import Ajith from "../data/Ajith.json";
import Udara from "../data/Udara.json";
import Udayanga from "../data/Udayanga.json";
import Gamini from "../data/Gamini.json";
import Chamod from "../data/Chamod.json";

const Officers = () => {
  const [officerDataMap] = useState({
    Ajith: Ajith.lines,
    Udara: Udara.lines,
    Udayanga: Udayanga.lines,
    Gamini: Gamini.lines,
    Chamod: Chamod.lines
  });

  const [filters, setFilters] = useState({ officer: "All", line: "" });

  const filteredLines = filters.officer === "All" ? [] : officerDataMap[filters.officer] || [];

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.82)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
    padding: 20,
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Officer selection row */}
      <Card bordered={false} style={cardStyle}>
        <Row gutter={[16, 16]}>
          {Object.keys(officerDataMap).map((officer) => (
            <Col key={officer} xs={12} sm={8} md={4}>
              <Button
                icon={<UserOutlined />}
                type="primary"
                block
                onClick={() => setFilters({ officer, line: "" })}
              >
                Mr. {officer}
              </Button>
            </Col>
            
          ))}
          <Col  xs={12} sm={8} md={4}>
              <Button
                icon={<ReloadOutlined />}
                type="primary"
                block
               danger
                onClick={() => setFilters({ officer: "All", line: "" })}
              >
                Reset
              </Button>
            </Col>
        </Row>
      </Card>

      {/* Line selection row */}
      {filters.officer !== "All" && (
        <Card bordered={false} style={cardStyle} >
          <Row gutter={[12, 12]}>
            {filteredLines.map(({ lineCode }) => (
              <Col xs={8} sm={4} md={4} key={lineCode}>
                <Button
                  type={filters.line === lineCode ? "primary" : "default"}
                  onClick={() => setFilters(prev => ({ ...prev, line: lineCode }))}
                  style={{ width: "100%", background: filters.line === lineCode ? "#1890ff" : "#000", color: "#fff" }}
                >
                  {lineCode || "N/A"}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Officers;
