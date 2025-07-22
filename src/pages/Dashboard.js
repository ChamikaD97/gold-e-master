import React, { useEffect, useState } from "react";
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
import LeafPieChart from "../components/dashboardCards/LeafPieChart";
import LeafLineChart from "../components/dashboardCards/LeafLineChart";
import TotalCard from "../components/dashboardCards/TotalCard";
import OfficerSummaryList from "../components/dashboardCards/OfficerSummaryList";
import { toast } from "react-toastify";

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

  const getOfficerSummaries = async () => {
    const { year, month } = filters;
    const start = dayjs(`${year}-${month}-01`);
    const end = start.endOf("month");
    const dd = `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`;

    dispatch(showLoader());

    try {
      const results = await Promise.all(
        officerLines.map(async (officer) => {
          const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${officer.routes}&d=${dd}`;
          const res = await fetch(url);
          const json = await res.json();

          const transformed = json.map(item => ({
            leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
            net_kg: parseFloat(item["Net"]),
          }));

          const total = transformed.reduce(
            (acc, item) => {
              if (item.leaf_type === "Super") acc.super += item.net_kg;
              else acc.normal += item.net_kg;
              return acc;
            },
            { super: 0, normal: 0 }
          );

          return {
            name: officer.name,
            total: Math.round(total.super + total.normal),
          };
        })
      );

      setOfficerSummaries(results);
    } catch (err) {
                        toast.error("Error While Loading Data,Please Try Again");

      setOfficerSummaries([]);
    } finally {
      dispatch(hideLoader());
    }
  };



  const handleSearchSupplier = (supplierId) => {
    dispatch(showLoader());

    const id = supplierId?.toString().padStart(5, "0").trim();
    dispatch(setSelectedSupplier(id));
    if (id) navigate(`/supplier/info`);
  };
  const getLeafRecordsByDates = async () => {
    const { year, month } = filters;
    const start = dayjs(`${year}-${month}-01`);
    const end = start.endOf("month");
    const dd = `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`;

        const id = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162';


    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${id}&d=${dd}`;

    setData([]);
    dispatch(showLoader());

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaf records");

      const result = await response.json();

      const transformed = result.map(item => ({
        supplier_id: item["Supplier Id"],
        date: item["Leaf Date"],
        leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
        lineCode: parseInt(item["Route"]),
        net_kg: parseFloat(item["Net"]),
      }));

      const calculatedTotals = transformed.reduce(
        (acc, item) => {
          if (item.leaf_type === "Super") acc.super += item.net_kg;
          else acc.normal += item.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );

      setTotals(calculatedTotals);
      setData(transformed);
    } catch (err) {
                  toast.error("Error While Loading Data,Please Try Again");
      setData([]);
      setTotals({ super: 0, normal: 0 });
    } finally {
      dispatch(hideLoader());
    }
  };
  useEffect(() => {
    getLeafRecordsByDates();
    getOfficerSummaries();
  }, []);


  const pieData = [
    { name: "Super", value: totals.super },
    { name: "Normal", value: totals.normal }
  ];

  // Optional monthly aggregation for Line Chart
  const lineChartData = data.reduce((acc, item) => {
    const day = dayjs(item.date).format("D");
    const existing = acc.find(d => d.name === day);
    if (!existing) {
      acc.push({
        name: day,
        Super: item.leaf_type === "Super" ? item.net_kg : 0,
        Normal: item.leaf_type === "Normal" ? item.net_kg : 0,
        Total: item.net_kg
      });
    } else {
      if (item.leaf_type === "Super") existing.Super += item.net_kg;
      if (item.leaf_type === "Normal") existing.Normal += item.net_kg;
      existing.Total += item.net_kg;
    }
    return acc;
  }, []);

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
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>

        <Col span={8}>
          <TotalCard label="This Month Collection" value={totals.super + totals.normal} type="total" />

        </Col>
        <Col span={5}>
          <Card bordered={false} style={cardStyle}>
            <LeafPieChart data={pieData} />
          </Card>
        </Col>
      </Row>




      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} style={cardStyle}>

            <Title level={4} style={{ color: "#fff" }}>Leaf Count Chart</Title>
            in here i need to show a chart

            <div style={{ height: 200, backgroundColor: "#333", borderRadius: 8 }}></div>
          </Card>
        </Col>
        {/* <Col span={8}>
          <Card bordered={false} style={cardStyle}>

          <OfficerSummaryList data={officerSummaries} title="This Month Officer Summary" />

          </Card>
        </Col> */}
        <Col span={8}>
          <Card bordered={false} style={cardStyle}>
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
          <Card bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleSearchRoute} block>
              View Route Suppliers
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} style={cardStyle}>
            <Button type="primary" onClick={handleTodaySupply} block>
              Go to Leaf Supply
            </Button>
          </Card>
        </Col>
      </Row>



    </div>
  );
};

export default Dashboard;
