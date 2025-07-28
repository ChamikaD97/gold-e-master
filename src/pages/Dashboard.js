import React, {  useState } from "react";
import { Card, Col, Row, Typography, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { SearchRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { showLoader, hideLoader } from "../redux/loaderSlice";
import dayjs from "dayjs";
import { API_KEY } from "../api/api";
import { toast } from "react-toastify";
import Clock from "../components/dashboardCards/Clock";

const { Text, Title } = Typography;

const cardStyle = {
  background: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  borderRadius: 12,
  marginBottom: 16,
};
const ajithLines = ['60,154,129', '65', '146', '152', '33', '8', '98', '145', '81,97'];
const udaraLines = ['23', '72', '96', '149', '21', '9', '162'];
const udayangaLines = ['6', '7', '25', '61', '150', '155', '36', '102,161', '48,64,62', '129'];
const gaminiLines = ['70', '31,157', '34', '12,109,127'];
const chamodLines = ['91', '67,68,69', '138,124'];

const officerLines = [
  { name: "Ajith", routes: ajithLines.join(",") },
  { name: "Udara", routes: udaraLines.join(",") },
  { name: "Udayanga", routes: udayangaLines.join(",") },
  { name: "Gamini", routes: gaminiLines.join(",") },
  { name: "Chamod", routes: chamodLines.join(",") }
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState({ searchById: "", year: currentYear, month: currentMonth });
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ super: 0, normal: 0 });
  const [officerSummaries, setOfficerSummaries] = useState([]);


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
