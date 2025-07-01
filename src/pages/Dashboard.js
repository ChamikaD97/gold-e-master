import React, { useState } from "react";
import { Card, Col, Row, Typography, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { SearchRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { showLoader } from "../redux/loaderSlice";

const { Text, Title } = Typography;

const cardStyle = {
  background: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  borderRadius: 12,
  marginBottom: 16,
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ searchById: "" });

  const handleSearchSupplier = (supplierId) => {
      dispatch(showLoader());
    
    const id = supplierId?.toString().padStart(5, "0").trim();
    dispatch(setSelectedSupplier(id));
    if (id) navigate(`/supplier/info`);
  };

  const handleSearchRoute = () => navigate("/suppliers/routes");

  const handleTodaySupply = () => navigate("/leaf/supply");

  const handleYesterdayLeaf = () => navigate("/leaf/count");

  return (
    <div style={{ padding: 10 }}>
      {/* Logo Header */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
          <img
            src={icon}
            alt="SLMS"
            style={{ width: 120, height: 120, borderRadius: "50%", border: "1px solid white" }}
          />
          <div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
              SUPER LEAF MONITORING SYSTEM
            </div>
            <div style={{ fontSize: 16, color: "#ccc" }}>GREENHOUSE PLANTATION (PVT) LTD</div>
          </div>
        </div>
      </Card>

      {/* Chart 1 | Chart 2 | Search Supplier by ID */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card  bordered={false} style={cardStyle}>
         
            [Chart 1 Placeholder]
          </Card>
        </Col>
        <Col span={8}>
          <Card  bordered={false} style={cardStyle}>
          
            [Chart 2 Placeholder]
          </Card>



















        </Col>
        <Col span={8}>
          <Card  bordered={false} style={cardStyle}>
            <Row gutter={[8, 8]} align="middle">
              <Col flex="60px">
                <Text style={{ color: "#fff" }}>Search</Text>
              </Col>
              <Col flex="auto">
                <Input
                  value={filters.searchById}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchById: e.target.value }))
                  }
                  onPressEnter={() => handleSearchSupplier(filters.searchById)}
                  placeholder="Search by ID or Name"
                  style={{
                    width: "100%",
                    backgroundColor: "rgb(0, 0, 0)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                  }}
                  allowClear
                />
              </Col>
              <Col flex="60px">
                <Button
                  icon={<SearchRounded />}
                  type="primary"
                  onClick={() => handleSearchSupplier(filters.searchById)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Search by Route | Set Today’s Route Supply */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card  bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleSearchRoute} block>
              View Route Suppliers
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card  bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleTodaySupply} block>
              Go to Leaf Supply
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Yesterday’s Leaf Count */}
      <Row gutter={16}>
        <Col span={24}>
          <Card  bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleYesterdayLeaf} block>
              View Leaf Count
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
