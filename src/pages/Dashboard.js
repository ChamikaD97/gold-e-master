import React, {  useState } from "react";
import { Card, Col, Row, Typography, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { SearchRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { showLoader } from "../redux/loaderSlice";
import Clock from "../components/dashboardCards/Clock";

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
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState({ searchById: "", year: currentYear, month: currentMonth });


  const handleSearchSupplier = (supplierId) => {
    dispatch(showLoader());

    const id = supplierId?.toString().padStart(5, "0").trim();
    dispatch(setSelectedSupplier(id));
    if (id) navigate(`/supplier/info`);
  };

  


  const handleTodaySupply = () => navigate("/leaf/todaySupply/officer");

  const handelTargets = () => navigate("/factory-targets/officer");
  const handleSummery = () => navigate("/summery");

  return (
    <div style={{ padding: 10 }}>
      {/* Logo Header */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }} className="fade-in">
          <img
            src={icon}
            alt="SLMS"
            style={{
              width: 120, height: 120, borderRadius: "50%", border: "1px solid white", border: "2px solid white",
              boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            }}
          />

          <div>
            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
              SUPER LEAF MONITORING SYSTEM
            </div>
            <div style={{ fontSize: 16, color: "#ccc" }}>GREENHOUSE PLANTATION (PVT) LTD</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Clock />
          </div>
        </div>

      </Card>

      {/* Chart 1 | Chart 2 | Search Supplier by ID */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
     
        <Col span={10} className="fade-in">
          <Card bordered={false} style={cardStyle}>
            <Row gutter={[8, 8]} align="middle">
              <Col span={10}>
                <Text style={{ color: "#fff" }}>Enter Supplier Id To Search</Text>
              </Col>
              <Col span={12}>
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
              <Col span={2}>
                <Button
                  icon={<SearchRounded />}
                  type="primary"
                  onClick={() => handleSearchSupplier(filters.searchById)}
                />
              </Col>
            </Row>
          </Card>
        </Col>


        <Col span={4}  className="fade-in">
          <Card bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleTodaySupply} block>
              Today Suppliers
            </Button>
          </Card>
        </Col>
        <Col span={6}  className="fade-in">
          <Card bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handelTargets} block>
              Targets And Achievements
            </Button>
          </Card>
        </Col>
        <Col span={4} className="fade-in">
          <Card bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleSummery} block>
              Summery Reports
            </Button>
          </Card>
        </Col>
      </Row>







    </div>
  );
};

export default Dashboard;
