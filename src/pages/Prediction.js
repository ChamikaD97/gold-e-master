import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Select, Typography, Button, Table, Input, Modal,
  message
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import '../App.css';
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import CircularLoader from "../components/CircularLoader";
import SupplierLeafModal from "../components/SupplierLeafModal";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, getMonthDateRangeFromParts } from "../api/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CountUp from "react-countup";

const { Option } = Select;
const { Text } = Typography;

const Prediction = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '', lineTarget: '' });
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

  const handleTargetSearch = () => {
    const enteredTarget = filters.lineTarget?.trim();
    if (!enteredTarget) {
      message.warning("Please enter a target value to search.");
      return;
    }
    getLeafRecordsByRoutes(); // Ensure data is fetched before searching
    // Example: filter totals or find specific section in your table
    const matched = lineWiseTotals && Object.entries(lineWiseTotals).find(
      ([line, value]) => value.target?.toString() === enteredTarget
    );

    if (matched) {
      message.success(`✅ Found line ${matched[0]} with target ${enteredTarget}`);
      // Optionally scroll to a div or update table highlight
    } else {
      message.error("❌ No line found with the entered target");
    }
  };

  const [xSupplierDetails, setXSupplierDetails] = useState([]); // array of detailed supplier objects
  const leafRound = useSelector((state) => state.commonData?.leafRound);
  const cellStyle = {
    background: "linear-gradient(135deg, #C6F6D5,rgb(255, 230, 0))",
    color: "#000",
    padding: "6px 12px",
    borderRadius: "24px",
    fontWeight: 700,
    fontSize: 13,
    display: "inline-block",
    minWidth: "60px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
    transition: "transform 0.2s"
  };


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
          total_kg: total_kg.toFixed(0),
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


      // ✅ Merge all line-wise totals into first lineCode
      const firstLineCode = transformed[0]?.lineCode;
      const lineWiseTotalMap = {
        [firstLineCode]: { super: 0, normal: 0, overall: 0 }
      };

      transformed.forEach(item => {
        lineWiseTotalMap[firstLineCode].super += item.super_kg;
        lineWiseTotalMap[firstLineCode].normal += item.normal_kg;
        lineWiseTotalMap[firstLineCode].overall += item.super_kg + item.normal_kg;
      });

      setLineWiseTotals(lineWiseTotalMap);

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
      setColData(transformed, filters.lineTarget);

    } catch (err) {
      console.error(err);
      setError("❌ Failed to load supplier data");
      setData([]);
      setColData([]);
      setLineTotal({ super: 0, normal: 0, overall: 0 });
    } finally {
      dispatch(hideLoader());
    }
  };


  const setColData = (transformedData, userEnteredLineTotal) => {
    if (filters.month === "Select Month") {
      setColumns([]);
      setTableData([]);
      return;
    }




    const suppliers = [...new Set(
      transformedData.map(item => item.supplier_id)
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

    const supplierTotalsMap = {};
    const rows = suppliers.map(supplier_id => {
      const entries = transformedData.filter(item => item.supplier_id === supplier_id);

      const total_kg = entries.reduce((sum, item) => sum + parseFloat(item.total_kg || 0), 0);
      const super_kg = entries.reduce((sum, item) => sum + (item.super_kg || 0), 0);
      const normal_kg = entries.reduce((sum, item) => sum + (item.normal_kg || 0), 0);

      supplierTotalsMap[supplier_id] = total_kg;

      const row = {
        supplier_id,
        total_kg,
        super_kg,
        normal_kg
      };

      entries.forEach(item => {
        const day = new Date(item.date).getDate();
        row[`day_${day}`] = { type: item.leaf_type, kg: item.net_kg };
      });

      return row;
    });

    // Calculate total for all suppliers in line
    const totalLineWeight = Object.values(supplierTotalsMap).reduce((sum, val) => sum + val, 0);

    // Add prediction
    rows.forEach(row => {
      const supplierWeight = row.total_kg;
      const prediction = totalLineWeight > 0
        ? (supplierWeight / totalLineWeight) * userEnteredLineTotal
        : 0;

      row.weekValue = prediction;
      row.week1 = prediction * 0.2;
      row.week2 = prediction * 0.25;
      row.week3 = prediction * 0.25;
      row.week4 = prediction * 0.3;
    });


    // Set column definitions
    setColumns([
      {
        title: "Supplier ID",
        dataIndex: "supplier_id",
        key: "supplier_id",
        fixed: "left",
        align: "center",
        width: 130,
        render: text => (
          <span style={{
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
            transition: "transform 0.2s"
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text}
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
          <span style={{
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
            transition: "transform 0.2s"
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {text} kg
          </span>
        )
      },
      {
        title: "Prediction (kg)",
        dataIndex: "weekValue",
        key: "weekValue",
        align: "center",
        width: 130,
        render: value => (
          <span style={{
            background: "linear-gradient(135deg, #bee3f8, #3182ce)",
            color: "#003366",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 700,
            fontSize: 13,
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s"
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {value?.toFixed(0)} kg
          </span>
        )
      }, {
        title: "Week 1",
        dataIndex: "week1",
        key: "week1",
        align: "center",
        width: 100,
        render: val => (
          <span style={cellStyle}> {val?.toFixed(0)} kg</span>
        )
      },
      {
        title: "Week 2",
        dataIndex: "week2",
        key: "week2",
        align: "center",
        width: 100,
        render: val => (
          <span style={cellStyle}> {val?.toFixed(0)} kg</span>
        )
      },
      {
        title: "Week 3",
        dataIndex: "week3",
        key: "week3",
        align: "center",
        width: 100,
        render: val => (
          <span style={cellStyle}> {val?.toFixed(0)} kg</span>
        )
      },
      {
        title: "Week 4",
        dataIndex: "week4",
        key: "week4",
        align: "center",
        width: 100,
        render: val => (
          <span style={cellStyle}> {val?.toFixed(0)} kg</span>
        )
      }

    ]);

    setTableData(rows);
  };

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
  const buildSupplierInfoMap = async () => {
    const map = {};

    for (const row of tableData) {
      const id = row.supplier_id?.toString().padStart(5, "0");
      const url = `/quiX/ControllerV1/supdata?k=${API_KEY}&s=${id}`;

      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        const supplier = Array.isArray(json) ? json[0] : json;

        if (supplier) {
          map[row.supplier_id] = {
            name: supplier["Supplier Name"] || "-",
            contact: supplier["Contact"] || "-"
          };
        }
      } catch (err) {
        console.error(`Error fetching supplier ${id}:`, err);
      }
    }

    return map;
  };
  const downloadPredictionPDF = async (print = false) => {
    const supplierInfoMap = await buildSupplierInfoMap();
    downloadXSupplierListAsPDF(supplierInfoMap, print);
  };

  const downloadXSupplierListAsPDF = (supplierInfoMap, p) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    const selectedLine = filters.lineCode || "All";
    const target = filters.lineTarget || "N/A";
    const firstLineKey = Object.keys(lineWiseTotals)[0];
    const lastMonthAchievement = lineWiseTotals?.[firstLineKey]?.overall?.toFixed(0) || "N/A";


    // --- Header ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 20, 196, 20);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 28, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 32, 196, 32);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, No: 40, Rotumba, Bandaranayakapura", 14, 40);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 45);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Monthly Leaf Supply Prediction", 14, 52);
    doc.text(`${selectedLine} Line Suppliers that need to Supply In July`, 14, 58);

    doc.setFont(undefined, 'normal');
    doc.line(14, 63, 196, 63);
    doc.text(`July Target: ${target} kg`, 14, 69);
    doc.text(`June Achievement: ${lastMonthAchievement} kg`, 105, 69);
    doc.line(14, 72, 196, 72);

    // --- Table Body ---
    const predictionTableRows = tableData.map((row) => {
      const info = supplierInfoMap[row.supplier_id] || { name: "-", contact: "-" };
      return [
        row.supplier_id,
        info.name,
        info.contact,
        `${Number(row.total_kg).toFixed(0)}`,
        `${Number(row.weekValue).toFixed(0)}`,

      ];
    });

    // --- Table ---
    doc.autoTable({
      startY: 78,
      head: [["ID", "Name", "Mobile", "Total (kg)", "Predicted (kg)", "Week 1 (kg)", "Week 2 (kg)", "Week 3 (kg)", "Week 4 (kg)"]],
      body: predictionTableRows,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1
    });

    // --- Footer only on last page ---
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    const y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    const week1Total = tableData.reduce((sum, row) => sum + parseFloat(row.week1 || 0), 0);

    doc.setFontSize(8);
    doc.setTextColor(50);
    doc.line(14, 275, 196, 275);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);
    doc.text(`Page ${pageCount}`, 190, 290, { align: 'right' });

    // --- Save or Print ---
    const formattedDate = new Date().toISOString().split('T')[0];
    doc.save(`${selectedLine} line suppliers - ${formattedDate}.pdf`);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SupplierLeafModal open={modalOpen} filters={filters} onClose={() => setModalOpen(false)} supplierId={selectedSupplierId} selectedDate={selectedDate} />

      {filteredTableData.length}

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
            <Col md={3}><Text style={{ color: "#fff" }}>Line Target</Text></Col>
            <Col md={4}>
              <Input
                placeholder="Enter Line Target"
                value={filters.lineTarget || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, lineTarget: e.target.value }))}
                style={{
                  width: "100%",
                  backgroundColor: "rgb(0, 0, 0)",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: 6
                }}
                allowClear
              />
            </Col>
            <Col md={2}>
              <Button
                type="primary"
                onClick={handleTargetSearch}
                style={{ borderRadius: 6 }}
              >
                Search
              </Button>
            </Col>
            <Col md={2}>
              <Button
                type="primary"
                onClick={downloadPredictionPDF}
                style={{ borderRadius: 6 }}
              >
                Download
              </Button>
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
                          Mr. {getOfficerByLineId(filters.line) || "Officer"} –  {filters.lineCode} Line - {monthMap[filters.month]} {filters.year}
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




          <Card bordered={false} style={cardStyle}>
            {isLoading ? <CircularLoader /> : (
              <Table
                className="red-bordered-table"
                columns={columns}
                dataSource={filteredTableData}
                pagination={false}
                scroll={{ x: "max-content", y: 400 }} // ✅ vertical scroll to fix header
                bordered
                size="small"
                rowKey="supplier_id"
              />

            )}
          </Card>
        </>
      )}

    </div>
  );
};

export default Prediction;
