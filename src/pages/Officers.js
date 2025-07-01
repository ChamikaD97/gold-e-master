import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Select, Typography, Button, Table, Input, Modal
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import '../App.css';
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import CircularLoader from "../components/CircularLoader";
import SupplierLeafModal from "../components/SupplierLeafModal";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, getMonthDateRangeFromParts } from "../api/api";

import CountUp from "react-countup";

const { Option } = Select;
const { Text } = Typography;

const Officers = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-06-01");

  const [error, setError] = useState(null);
  const [lineTotal, setLineTotal] = useState({ super: 0, normal: 0, overall: 0 });
  const getOfficerByLineId = (lineId) => {
    const match = lineIdCodeMap.find((line) => line.lineId === lineId);
    return match ? match.officer : null;
  };

  const [xSupplierDetails, setXSupplierDetails] = useState([]); // array of detailed supplier objects
  const leafRound = useSelector((state) => state.commonData?.leafRound);

  const officerLineMap = useSelector((state) => state.officerLine?.officerLineMap || {});
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loader);
  const [lineWiseTotals, setLineWiseTotals] = useState({});

  const getLeafRecordsByRoutes = async () => {
    dispatch(showLoader());
    const dateRange = getMonthDateRangeFromParts(filters.year, filters.month);
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${filters.line}&d=${dateRange}`;
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch supplier data");
      const result = await response.json();

      const groupedMap = {};

      result.forEach(item => {
        const key = `${item["Supplier Id"]}_${item["Leaf Date"]}`;
        if (!groupedMap[key]) {
          groupedMap[key] = {
            supplier_id: item["Supplier Id"],
            date: item["Leaf Date"],
            lineCode: parseInt(item["Route"]),
            line: filters.lineCode,
            super_kg: 0,
            normal_kg: 0,
          };
        }

        const net = parseFloat(item["Net"] || 0);
        const isSuper = item["Leaf Type"] === 2;
        if (isSuper) {
          groupedMap[key].super_kg += net;
        } else {
          groupedMap[key].normal_kg += net;
        }
      });

      const transformed = Object.values(groupedMap).map(item => {
        const total_kg = item.super_kg + item.normal_kg;
        return {
          ...item,
          leaf_type:
            item.super_kg > 0 && item.normal_kg > 0
              ? "Both"
              : item.super_kg > 0
                ? "Super"
                : "Normal",
          net_kg: {
            Super: item.super_kg || null,
            Normal: item.normal_kg || null,
          },
          total_kg: total_kg.toFixed(2),
        };
      });

      // Supplier-wise monthly totals
      const supplierMonthlyTotalMap = {};
      transformed.forEach(item => {
        const sid = item.supplier_id;
        if (!supplierMonthlyTotalMap[sid]) {
          supplierMonthlyTotalMap[sid] = { total: 0, super: 0, normal: 0 };
        }
        supplierMonthlyTotalMap[sid].total += parseFloat(item.total_kg);
        supplierMonthlyTotalMap[sid].super += item.super_kg;
        supplierMonthlyTotalMap[sid].normal += item.normal_kg;
      });


      const lineWiseTotalMap = {};

      transformed.forEach(item => {
        const lineCode = item.lineCode;
        if (!lineWiseTotalMap[lineCode]) {
          lineWiseTotalMap[lineCode] = { super: 0, normal: 0, overall: 0 };
        }
        console.log('***********************************', lineCode);

        lineWiseTotalMap[lineCode].super += item.super_kg;
        lineWiseTotalMap[lineCode].normal += item.normal_kg;
        lineWiseTotalMap[lineCode].overall += item.super_kg + item.normal_kg;
      });
      console.log('***********************************', lineWiseTotalMap);
      console.log('***********************************', lineWiseTotalMap);



      setLineWiseTotals(lineWiseTotalMap);

      console.LOG("Line-wise totals:", lineWiseTotalMap);
      // Line-wide totals
      const lineSuperTotal = transformed.reduce((sum, item) => sum + item.super_kg, 0);
      const lineNormalTotal = transformed.reduce((sum, item) => sum + item.normal_kg, 0);
      const lineOverallTotal = lineSuperTotal + lineNormalTotal;

      setLineTotal({
        super: lineSuperTotal,
        normal: lineNormalTotal,
        overall: lineOverallTotal,
      });

      setData(transformed);
      setColData(transformed);
    } catch (err) {
      setError("❌ Failed to load supplier data");
      setData([]);
      setColData([]);
      setLineTotal({ super: 0, normal: 0, overall: 0 });
    } finally {
      dispatch(hideLoader());
    }
  };


  const setColData = (transformedData) => {
    if (filters.month === "Select Month") {
      setColumns([]);
      setTableData([]);
      return;
    }

    const daysInMonth = new Date(parseInt(filters.year), parseInt(filters.month), 0).getDate();
    const suppliers = [...new Set(
      transformedData.filter(item => item.lineCode === parseInt(filters.line)).map(item => item.supplier_id)
    )].sort();

    const highlightDateMap = {};
    const highlightValueMap = {};

    suppliers.forEach(supplierId => {
      const supplierRecords = transformedData
        .filter(item => item.supplier_id === supplierId)
        .map(item => ({ date: new Date(item.date), kg: item.net_kg }));

      const lastRecord = supplierRecords.reduce((latest, current) =>
        current.date > latest.date ? current : latest, supplierRecords[0]);

      const nextDate = new Date(lastRecord.date);
      nextDate.setDate(nextDate.getDate() + leafRound);

      highlightDateMap[supplierId] = nextDate.toDateString();
      highlightValueMap[supplierId] = lastRecord.kg;
    });

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
    const todayDate = today.getDate();

    const dayCols = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = new Date(`${filters.year}-${filters.month}-${String(day).padStart(2, "0")}`).toDateString();

      const isTodayCol = todayYear === parseInt(filters.year) &&
        todayMonth === filters.month &&
        todayDate === day;

      return {
        title: `${day}`,
        dataIndex: `day_${day}`,
        key: `day_${day}`,
        align: "center",
        width: 80,
        className: isTodayCol ? "highlight-column" : "",
        render: (value, row) => {
          const isHighlight = highlightDateMap[row.supplier_id] === dateStr;

          const spanStyle = (bg, color) => ({
            background: bg,
            color: color,
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 600,
            fontSize: 13,
            display: "inline-block",
            minWidth: "50px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "transform 0.5s",
          });

          if (isHighlight) {
            return (
              <div className="pulse-red animated-cell" style={{
                backgroundColor: '#AA0114',
                color: '#fff',
                borderRadius: '20px',
                padding: '6px',
                fontWeight: 'bold'
                , display: "inline-block",
                minWidth: "50px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "transform 0.5s",
              }}>
                X
              </div>
            );
          }

          if (!value) return "";

          if (value.kg.Super && value.kg.Normal) {
            return (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '4px'
              }}>
                <span style={spanStyle("#ffa347", "#000")}>{value.kg.Super}</span>
                <span style={spanStyle("hsl(210, 100.00%, 63.90%)	", "#000")}>{value.kg.Normal}</span>
              </div>
            );
          }

          if (value.kg.Super) {
            return <span style={spanStyle("#ffa347", "#000")}>{value.kg.Super}  </span>;
          }

          if (value.kg.Normal) {
            return <span style={spanStyle("#47a3ff	", "#000")}>{value.kg.Normal}  </span>;
          }

          return "";
        }

      };
    });


    const rows = suppliers.map(supplier_id => {
      const entries = transformedData.filter(item => item.supplier_id === supplier_id);

      const total_kg = entries.reduce((sum, item) => sum + parseFloat(item.total_kg || 0), 0);
      const super_kg = entries.reduce((sum, item) => sum + (item.super_kg || 0), 0);
      const normal_kg = entries.reduce((sum, item) => sum + (item.normal_kg || 0), 0);

      const row = {
        supplier_id,
        total_kg: total_kg,
        super_kg: super_kg,
        normal_kg: normal_kg
      };

      entries.forEach(item => {
        const day = new Date(item.date).getDate();
        row[`day_${day}`] = { type: item.leaf_type, kg: item.net_kg };
      });

      return row;
    });

    setColumns([
      {
        title: "Supplier ID",
        dataIndex: "supplier_id",
        key: "supplier_id",
        fixed: "left",
        align: "center",
        width: 130,
        render: text => (
          <span
            style={{
              background: "#ff000e",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "24px",
              fontWeight: 600,
              fontSize: 13,
              display: "inline-block",
              minWidth: "60px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text}
          </span>
        )
      },
      {
        title: "Super (kg)",
        dataIndex: "super_kg",
        key: "super_kg",
        align: "center",
        width: 110,
        render: text => (
          <span
            style={{
              background: "#ffa347",
              color: "#000",
              padding: "6px 12px",
              borderRadius: "24px",
              fontWeight: 600,
              fontSize: 13,
              display: "inline-block",
              minWidth: "60px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text} kg
          </span>
        )
      },
      {
        title: "Normal (kg)",
        dataIndex: "normal_kg",
        key: "normal_kg",
        align: "center",
        width: 110,
        render: text => (
          <span
            style={{
              background: "#47a3ff",
              color: "#000",
              padding: "6px 12px",
              borderRadius: "24px",
              fontWeight: 600,
              fontSize: 13,
              display: "inline-block",
              minWidth: "60px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text} kg
          </span>
        )
      },
      {
        title: "Total (kg)",
        dataIndex: "total_kg",
        key: "total_kg",
        align: "center",
        width: 110,
        render: text => (
          <span
            style={{
              background: "linear-gradient(135deg, #C6F6D5,rgb(0, 255, 55))",
              color: "#064E3B",
              padding: "6px 12px",
              borderRadius: "24px",
              fontWeight: 700,
              fontSize: 13,
              display: "inline-block",
              minWidth: "60px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text} kg
          </span>
        )
      }

      ,
      ...dayCols
    ]);

    setTableData(rows);
  };

  useEffect(() => {
    if (filters.month !== "Select Month") getLeafRecordsByRoutes();
  }, [filters.year, filters.month, filters.line, filters.lineCode]);







  const filteredTableData = tableData.filter(item =>
    !filters.supplierId || item.supplier_id.toLowerCase().startsWith(filters.supplierId.toLowerCase())
  );





  const uniqueLines = [{ label: "All", value: "All" }, ...lineIdCodeMap.map(l => ({ label: l.lineCode, value: l.lineId, officer: l.officer }))];
  const filteredLines = filters.officer === "All" ? [] : ["All", ...(officerLineMap[filters.officer] || [])];

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)", color: "#fff", borderRadius: 12, marginBottom: 6
  };

  const filterText = `Displaying data for ${filters.month !== "Select Month" ? monthMap[filters.month] : "all months"} ${filters.year}, ` +
    `${filters.officer !== "All" ? `Officer: ${filters.officer}, ` : ""}` +
    `${filters.line !== "All" ? `Line: ${filters.lineCode}` : ""}`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SupplierLeafModal open={modalOpen} filters={filters} onClose={() => setModalOpen(false)} supplierId={selectedSupplierId} selectedDate={selectedDate} />



      <div style={{ flex: "0 0 auto" }} className="fade-in">
        <Card bordered={false} style={cardStyle}>
          <Row gutter={[16, 16]}>
            <Col md={1}>
              <Button icon={<ReloadOutlined />} danger type="primary" block onClick={() => {

                setLineWiseTotals({})
                setXSupplierDetails([]);

                setFilters({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: "" })
              }} />
            </Col>

            <Col md={4}>
              <Select
                showSearch
                placeholder="Select Line"
                value={filters.line}
                onChange={val => {
                  const selectedLine = uniqueLines.find(line => line.value === val);
                  const officerMatch = Object.entries(officerLineMap).find(([officer, lines]) => lines.includes(val));
                  const matchedOfficer = officerMatch ? officerMatch[0] : "All";
                  setFilters(f => ({ ...f, officer: val.officer, line: val, lineCode: selectedLine?.label || "", officer: matchedOfficer, month: "Select Month" }));
                }}
                style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}
                dropdownStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                bordered={false}
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              >
                {uniqueLines.map(line => (
                  <Option key={line.value} value={line.value}>{line.label}</Option>
                ))}
              </Select>
            </Col>
            <Col md={4}>
              <Select showSearch
                style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}

                value={filters.year}
                bordered={false} onChange={val => setFilters(f => ({ ...f, year: val, month: "Select Month" }))}>

                <Option value="2021">2021</Option>
                <Option value="2022">2022</Option>
                <Option value="2023">2023</Option>

                <Option value="2024">2024</Option>
                <Option value="2025">2025</Option>
              </Select>
            </Col>
            <Col md={4}>
              <Select
                showSearch

                value={filters.month}
                onChange={val => setFilters(prev => ({ ...prev, month: val }))}
                style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}
                bordered={false}
              >
                {filteredMonths.map(m => (
                  <Option key={m} value={m}>{monthMap[m]}</Option>
                ))}
              </Select>
            </Col>
            <Col md={3}><Text style={{ color: "#fff" }}>Supplier ID</Text></Col>
            <Col md={4}>
              <Input
                value={filters.supplierId || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
                style={{ width: "100%", backgroundColor: "rgb(0, 0, 0)", color: "#fff", border: "1px solid #333", borderRadius: 6 }}
                allowClear
              />
            </Col>

          </Row>
        </Card>
      </div>




      {filters.line !== "M" && filters.officer !== "All" && (
        <Card bordered={false} style={cardStyle}>
          <Row gutter={[12, 12]}>
            {filteredLines.filter(l => l !== "All").map(line => (
              <Col xs={8} sm={4} md={4} key={line}>
                <Button
                  type={filters.line === line ? "primary" : "default"}
                  onClick={() => setFilters(prev => ({ ...prev, line, month: "Select Month" }))}
                  style={{ width: "100%", background: filters.line === line ? "#1890ff" : "#000", color: "#fff" }}
                >
                  {line}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      )}
      {filters.month !== "Select Month" && (
        <>
          {
            lineWiseTotals && (
              <Card bordered={false} style={{ ...cardStyle, marginTop: 0 }}>

                <Row gutter={[16, 16]} justify="center" style={{ marginTop: 1 }}>
                  {Object.entries(lineWiseTotals).map(([lineCode, totals]) => (
                    <Col xs={24} sm={24} md={24} key={lineCode}>

                      <div
                        style={{
                          margin: "16px 0",
                          textAlign: "center",

                          borderRadius: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#fff",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          -     {lineWiseTotals.length}  - Mr. {getOfficerByLineId(filters.line) || "Officer"} –  {filters.lineCode} Line - {monthMap[filters.month]} {filters.year}
                        </span>
                      </div>


                      {/* 3-column row for Super, Normal, and Total */}
                      <Row gutter={[16, 16]} justify="center">
                        {/* Super Total */}
                        <Col xs={24} sm={12} md={8}>
                          <div
                            style={{
                              backgroundColor: "#ffa347",
                              borderRadius: 10,
                              padding: "14px 24px",
                              textAlign: "center",
                              fontWeight: 600,
                              color: "#000",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                          >
                            Super Total<br />
                            <CountUp style={{ fontSize: 30 }} end={Math.round(totals.super)} duration={1.2} separator="," /> kg<br />

                          </div>
                        </Col>

                        {/* Normal Total */}
                        <Col xs={24} sm={12} md={8}>
                          <div
                            style={{
                              backgroundColor: "#47a3ff",
                              borderRadius: 15,
                              padding: "14px 24px",
                              textAlign: "center",
                              fontWeight: 600,
                              color: "#000",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                          >
                            Normal Total<br />
                            <CountUp style={{ fontSize: 30 }} end={Math.round(totals.normal)} duration={1.2} separator="," /> kg
                          </div>
                        </Col>

                        {/* Overall Total */}
                        <Col xs={24} sm={24} md={8}>
                          <div
                            style={{
                              backgroundColor: "#28a745",
                              borderRadius: 10,
                              padding: "14px 24px",
                              textAlign: "center",
                              fontWeight: 600,
                              color: "#000",
                              textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)",
                              boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
                            }}
                          >
                            Overall Total<br />                        <CountUp style={{ fontSize: 30 }} end={Math.round(totals.overall)} duration={1.2} separator="," /> kg<br />

                          </div>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Card>
            )

          }



        
          
          
        </>
      )}
    </div>
  );
};

export default Officers;
