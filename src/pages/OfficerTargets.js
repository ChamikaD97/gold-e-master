import React, { useState } from "react";
import {
  Card, Col, Row, Button, Table
} from "antd";
import { ReloadOutlined, UserOutlined } from "@ant-design/icons";
import '../App.css';

import Ajith from "../data/Ajith.json";
import Udara from "../data/Udara.json";
import Udayanga from "../data/Udayanga.json";
import Gamini from "../data/Gamini.json";
import Chamod from "../data/Chamod.json";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";

import { API_KEY } from "../api/api";
import dayjs from "dayjs";
import LineAnalyticsModal from "../components/LineAnalyticsModal";
import { AllInbox, ReportOffRounded } from "@mui/icons-material";
import FactoryAnalyticsModal from "../components/FactoryAnalyticsModal";
const OfficerTargets = () => {
  const [officerDataMap] = useState({
    Ajith: Ajith.lines,
    Udara: Udara.lines,
    Udayanga: Udayanga.lines,
    Gamini: Gamini.lines,
    Chamod: Chamod.lines
  });

  const [filters, setFilters] = useState({ officer: "All", line: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [isFactory, setIsFactory] = useState(false);
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


      <LineAnalyticsModal
        visible={modalOpen}
        onClose={() => {


          setModalOpen(false)
        }}
        lineCode={filters.line}
        filteredLines={filteredLines.find(line => line.lineCode === filters.line)}
      />
      <FactoryAnalyticsModal
        visible={isFactory}
        onClose={() => {

          setIsFactory(false);
        }}
        lineCode={filters.line}
        filteredLines={filteredLines.find(line => line.lineCode === filters.line)}
      />

      <Card bordered={false} style={cardStyle} className="fade-in">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={3}>
            <Button
              type="primary"
              block
              danger
              onClick={() => {
                setIsFactory(true);

              }}
            >
              All
            </Button>
          </Col>
          {Object.keys(officerDataMap).map((officer) => (
            <Col key={officer} xs={12} sm={8} md={4}>
              <Button
                icon={<UserOutlined />}
                type="primary"
                block
                onClick={() => {
                  setFilters({ officer: "All", line: "" });
                  setTimeout(() => {
                    setFilters({ officer, line: "" });
                  }, 100);
                }}
              >
                Mr. {officer}
              </Button>
            </Col>
          ))}
          <Col xs={12} sm={8} md={1}>
            <Button
              icon={<ReloadOutlined />}
              type="primary"
              block
              danger
              onClick={() => setFilters({ officer: "All", line: "" })}
            >

            </Button>
          </Col>
        </Row>
      </Card>

      {filters.officer !== "All" && (
        <>
          {/* Line Buttons */}
          <Card bordered={false} style={cardStyle} className="fade-in">
            <Row gutter={[12, 12]}>

              {filteredLines.map(({ lineCode }) => (
                <Col xs={8} sm={4} md={4} key={lineCode}>
                  <Button
                    type={filters.line === lineCode ? "primary" : "default"}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, line: lineCode }));
                      setModalOpen(true);
                    }}

                    style={{ width: "100%", background: filters.line === lineCode ? "#1890ff" : "#000", color: "#fff" }}
                  >
                    {lineCode || "N/A"}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>


        </>
      )}
    </div>
  );
};

export default OfficerTargets;
