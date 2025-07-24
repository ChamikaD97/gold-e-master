import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Table, Select, DatePicker } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, getMonthDateRangeFromParts } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
const { Option } = Select;
const MissRejo = () => {

  const dispatch = useDispatch();

  const [summery, setSummery] = useState([])




  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const officerLineMap = useSelector((state) => state.officerLine?.officerLineMap || {});

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);

  const officerOrder = ["Ajith", "Chamod", "Udara", "Gamini", "Udayanga", "Other"];
  const customLineCodeOrder = [
    "MT", "PH", "PW", "PP", "GO", "MP", "BM", "TP", "UP",
    "BA", "BK", "K", "PT", "PK", "A", "KM", "N", "DM",
    "NG", "S", "DR",
    "J", "T", "SELF 02", "TK", "HA", "D",
    "SLF", "DG", "ML", "MV"
  ];
  const ajithLines = ['60,154,129', '65', '146', '74', '33', '8', '98', '145', '81,97'];
  const udaraLines = ['23', '72', '96', '149', '21', '9', '162'];
  const udayangaLines = ['6', '7', '25', '61', '150', '36', '102,161,129', '48,64,62', '155'];
  const gaminiLines = ['70', '31,157', '34', '12,109,127'];
  const chamodLines = ['91', '67,68,69', '138,124'];

  const officerList = [
    { name: "Ajith", line: ajithLines },
    { name: "Udara", line: udaraLines },
    { name: "Udayanga", line: udayangaLines },
    { name: "Gamini", line: gaminiLines },
    { name: "Chamod", line: chamodLines }

  ];
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = endOfMonth.getDate() - today.getDate() + 1;

  const [currentSupplierTable, setCurrentSupplierTable] = useState([]);
  const [previousSupplierTable, setPreviousSupplierTable] = useState([]);
  const [missingSuppliers, setMissingSuppliers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState({ name: "Select Officer", line: "All" });
  const [selectedLine, setSelectedLine] = useState(null);

  const uniqueLines = [{ label: "All", value: "All" }, ...lineIdCodeMap.map(l => ({ label: l.lineCode, value: l.lineId, officer: l.officer }))];
  const filteredLines = filters.officer === "All" ? [] : ["All", ...(officerLineMap[filters.officer] || [])];
  const [missedSuppliers, setMissedSuppliers] = useState([]);
  const [rejoinedSuppliers, setRejoinedSuppliers] = useState([]);
  const [missedTotal, setMissedTotal] = useState("0.00");
  const [rejoinedTotal, setRejoinedTotal] = useState("0.00");

  const groupByLine = (suppliers) => {
    const grouped = {};
    suppliers.forEach(s => {
      if (!grouped[s.line]) grouped[s.line] = [];
      grouped[s.line].push(s);
    });
    return grouped;
  };


  const getOfficerByLineId = (lineId) => {
    const match = lineIdCodeMap.find((line) => line.lineId === lineId);
    return match ? match.officer : null;
  };

  const exportGroupedPDF = (suppliers, title = "Missing") => {
    const doc = new jsPDF("p", "mm", "a4");
    const grouped = groupByLine(suppliers);
    let startY = 46;
    let tablesOnPage = 0;

    // === HEADER ===
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, No: 40, Rotumba, Bandaranayakapura", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    // === DATE HEADER ===
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`${title} Cards on: ${filters.year} - ${monthMap[filters.month]}`, 14, startY);
    doc.line(14, startY + 4, 196, startY + 4);
    startY += 12;

    // === TABLES PER GROUP ===
    Object.keys(grouped).sort().forEach((line, index, array) => {
      const lineSuppliers = grouped[line];
      const totalKg = lineSuppliers.reduce((sum, s) => sum + parseFloat(s.total_kg), 0).toFixed(0);
      const supplierCount = lineSuppliers.length;

      // Add new page if more than 3 tables already rendered
      if (tablesOnPage === 3) {
        doc.addPage();
        startY = 20;
        tablesOnPage = 0;
      }

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0);
      doc.text(`Line: ${line} - Officer: ${lineSuppliers[0]?.officer || "Unknown"}`, 14, startY);

      const body = lineSuppliers.map((s, index) => [
        index + 1,
        s.supplier_id,
        s.name || "-",
        s.contact || "-",
        s.total_kg
      ]);

      autoTable(doc, {
        startY: startY + 4,
        head: [["No", "Supplier ID", "Name", "Contact", "Total Net (kg)"]],
        body: body,
        theme: "grid",
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 10,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: title === 'Rejoined' ? [22, 160, 133] : [255, 102, 102],
          textColor: 255,
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          halign: "center",
          valign: "middle",
        },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.setTextColor(0);
          doc.text(`Total Net (kg): ${totalKg}   |   Supplier Count: ${supplierCount}`, 14, data.cursor.y + 8);

          // Draw line after table

          doc.setLineWidth(0.3); // Make the line thicker (bold)
          doc.line(14, data.cursor.y + 14, 196, data.cursor.y + 14);

          startY = data.cursor.y + 22;
        }
      });

      tablesOnPage++;
    });

    // === Footer ONLY on last page ===
    const totalPages = doc.internal.getNumberOfPages();
    doc.setPage(totalPages);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    doc.save(`${title.replace(" ", "_")}_${filters.year}_${filters.month}.pdf`);
  };




  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, No: 40, Rotumba, Bandaranayakapura", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    let startY = 46;
    doc.setFontSize(11);
    doc.text(`Missing & Rejoined Cards on: ${filters.year} - ${monthMap[filters.month]}`, 14, startY);
    doc.line(14, startY + 4, 196, startY + 4);

    const officer = getOfficerByLineId(filters.line);

    // === Missed Section ===
    startY += 12;
    doc.setFont(undefined, 'bold');
    doc.text(`Line: ${filters.lineCode} - Officer: ${officer || "Unknown"}`, 14, startY);
    doc.setFont(undefined, 'normal');

    autoTable(doc, {
      startY: startY + 4,
      head: [["No", "Supplier ID", "Name", "Contact", "Total Net (kg)"]],
      body: missedSuppliers.map((s, index) => [
        index + 1,
        s.supplier_id,
        s.name || "Unknown",
        s.contact || "-",
        s.total_kg
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [255, 102, 102],
        textColor: 255,
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
      },
      margin: { left: 14, right: 14 },
    });

    // === Rejoined Section ===
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, 'bold');
    doc.text(`Missed Suppliers: ${missedSuppliers.length} | Total Net: ${missedTotal} kg`, 14, startY);
    doc.setFont(undefined, 'normal');

    autoTable(doc, {
      startY: startY + 4,
      head: [["No", "Supplier ID", "Name", "Contact", "Total Net (kg)"]],
      body: rejoinedSuppliers.map((s, index) => [
        index + 1,
        s.supplier_id,
        s.name || "Unknown",
        s.contact || "-",
        s.total_kg
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
      },
      margin: { left: 14, right: 14 },
    });
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, 'bold');
    doc.text(`Rejoined Suppliers: ${rejoinedSuppliers.length} | Total Net: ${rejoinedTotal} kg`, 14, startY);
    doc.setFont(undefined, 'normal');
    // === Footer ONLY on Last Page ===
    const totalPages = doc.internal.getNumberOfPages();
    doc.setPage(totalPages);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    doc.save(`Missing_Rejoined_${filters.year}_${filters.month}.pdf`);
  };


  const supplierTableColumns = [
    {
      title: "Supplier ID",
      dataIndex: "supplier_id",
      key: "supplier_id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
    },
    {
      title: "Officer",
      dataIndex: "officer",
      key: "officer",
    },
    {
      title: "Total Net (kg)",
      dataIndex: "total_kg",
      key: "total_kg",
      align: "right"
    },
  ];


  const [routeSummary, setRouteSummary] = useState({ current: [], previous: [] });
  const [supplierCounts, setSupplierCounts] = useState({ current: 0, previous: 0 });
  const getMergedMap = () => {
    const map = {};
    lineIdCodeMap.forEach(item => {
      const mergedCode = item.lineCode;
      const lineIds = item.lineId.split(",").map(id => id.trim());
      lineIds.forEach(id => {
        map[id] = mergedCode;
      });
    });
    return map;
  };
  const mergedMap = getMergedMap();

  const supplierMap = {};


  const getOfficerByLineCode = (lineCode) => {
    const entry = lineIdCodeMap.find(item => item.lineCode === lineCode);
    return entry?.officer || "Unknown";
  };



  const groupBySupplier = (dataArr) => {
    const map = {};
    dataArr.forEach(d => {
      const sid = d["Supplier Id"];
      const net = parseFloat(d["Net"]) || 0;
      const sup = supplierMap[sid] || {};

      if (!map[sid]) {
        map[sid] = {
          supplier_id: sid,
          total_kg: 0,
          name: sup.name || "Unknown",
          contact: sup.contact || "-",
          line: sup.lineCode || "Unknown",
          officer: sup.officer || "Unknown"
        };
      }
      map[sid].total_kg += net;
    });

    return Object.values(map).map(item => ({
      ...item,
      total_kg: item.total_kg.toFixed(0)
    }));
  };




  // Group by supplier_id



  const getLeafRecordsByDates = async () => {
    const selectedYear = parseInt(filters.year);
    const selectedMonth = parseInt(filters.month);
    if (isNaN(selectedYear) || isNaN(selectedMonth)) {
      toast.warning("Please select valid year and month.");
      return;
    }

    const formattedCurrent = `${filters.year}_${filters.month}`;
    const currentStart = getMonthDateRangeFromParts(filters.year, filters.month);

    const prev = dayjs(`${filters.year}-${filters.month}-01`).subtract(1, "month");
    const prevYear = prev.year();
    const prevMonth = String(prev.month() + 1).padStart(2, "0");
    const prevStart = getMonthDateRangeFromParts(prevYear, prevMonth);

    let ids = filters.line;
    if (selectedOfficer.line !== 'All') {
      ids = selectedOfficer.line;
    } else if (selectedOfficer.line === 'All' && filters.line !== 'Select Line') {
      ids = filters.line;
    }

    const currentUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${currentStart}`;
    const prevUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${prevStart}`;
    const supplierUrl = `/quiX/ControllerV1/supdata?k=${API_KEY}&r=${ids}`;

    dispatch(showLoader());
    setLoading(true);
    setError(null);

    try {
      const [currentRes, prevRes, supRes] = await Promise.all([
        fetch(currentUrl),
        fetch(prevUrl),
        fetch(supplierUrl)
      ]);

      if (!currentRes.ok || !prevRes.ok || !supRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [currentData, previousData, supplierData] = await Promise.all([
        currentRes.json(),
        prevRes.json(),
        supRes.json()
      ]);

      // ✅ Step 1: Prepare merged map and supplier info
      const mergedMap = getMergedMap(); // Needed!
      const supplierMap = {};

      supplierData.forEach(s => {
        const rawLineId = s["Route"] || s["Line"] || "Unknown";
        const mergedCode = mergedMap[rawLineId] || rawLineId;
        const officer = getOfficerByLineCode(mergedCode);

        supplierMap[s["Supplier Id"]] = {
          name: s["Supplier Name"],
          contact: s["Contact"],
          line: mergedCode,
          officer: officer
        };
      });

      // ✅ Step 2: Group by supplier and sum
      const groupBySupplier = (dataArr) => {
        const map = {};
        dataArr.forEach(d => {
          const sid = d["Supplier Id"];
          const net = parseFloat(d["Net"]) || 0;
          const sup = supplierMap[sid] || {};

          if (!map[sid]) {
            map[sid] = {
              supplier_id: sid,
              total_kg: 0,
              name: sup.name || "Unknown",
              contact: sup.contact || "-",
              line: sup.line || "Unknown",
              officer: sup.officer || "Unknown"
            };
          }
          map[sid].total_kg += net;
        });

        return Object.values(map).map(item => ({
          ...item,
          total_kg: item.total_kg.toFixed(0)
        }));
      };

      const currentSuppliers = groupBySupplier(currentData);
      const previousSuppliers = groupBySupplier(previousData);

      setCurrentSupplierTable(currentSuppliers);
      setPreviousSupplierTable(previousSuppliers);

      // ✅ Step 3: Identify missed and rejoined
      const currentIds = new Set(currentSuppliers.map(s => s.supplier_id));
      const previousIds = new Set(previousSuppliers.map(s => s.supplier_id));

      const missed = previousSuppliers.filter(s => !currentIds.has(s.supplier_id));
      const rejoined = currentSuppliers.filter(s => !previousIds.has(s.supplier_id));

      setMissedSuppliers(missed);
      setRejoinedSuppliers(rejoined);

      const missedTotal = missed.reduce((sum, s) => sum + parseFloat(s.total_kg), 0);
      const rejoinedTotal = rejoined.reduce((sum, s) => sum + parseFloat(s.total_kg), 0);

      setMissedTotal(missedTotal.toFixed(0));
      setRejoinedTotal(rejoinedTotal.toFixed(0));

      setSupplierCounts({
        current: currentSuppliers.length,
        previous: previousSuppliers.length
      });

    } catch (err) {
      console.error("Error in getLeafRecordsByDates:", err);
      toast.error("Error while loading data. Please try again.");
    } finally {
      dispatch(hideLoader());
      setLoading(false);
    }
  };






  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
        <Card bordered={false} style={cardStyle}>
          <Row justify="space-between" gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col md={1}>



                  <Button
                    icon={<ReloadOutlined />}
                    type="primary"
                    danger
                    block
                    onClick={() => {
                      setSelectedOfficer({ name: "Select Officer", line: "All" })
                      setMissedSuppliers([]);
                      setRejoinedSuppliers([]);
                      setFilters({
                        year: "Select Year",
                        month: "Select Month",
                        officer: "All",
                        line: "Select Line",
                        lineCode: '',
                        officer: ''
                      });
                    }}
                  >

                  </Button>

                </Col>
                <Col md={3} style={{ display: "flex", alignItems: "center", height: "100%" }}>
                  <Select
                    placeholder="Select Officer"
                    style={{
                      width: "100%",
                      backgroundColor: "rgb(0, 0, 0)",
                      color: "#000",
                      border: "1px solid #333",
                      borderRadius: 6
                    }}
                    bordered={false}
                    value={selectedOfficer?.name}
                    onChange={(value) => {
                      const officer = officerList.find(o => o.name === value);
                      setSelectedOfficer(officer);
                      setSelectedLine(null);
                    }}
                  >
                    {officerList.map((officer) => (
                      <Option key={officer.name} value={officer.name}>
                        Mr. {officer.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col md={3}>
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
                <Col md={3}>
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
                <Col md={3}>
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
                <Col md={1}>

                  <Button
                    icon={<SearchRounded />}
                    type="primary"
                    onClick={() => getLeafRecordsByDates()}
                  />
                </Col>
                <Col md={3}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={() => exportToPDF()}
                  >
                    All
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={() => exportGroupedPDF(missedSuppliers, "Missed")}
                  >
                    Missed
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={() => exportGroupedPDF(rejoinedSuppliers, "Rejoined")}
                  >
                    Rejoined
                  </Button>
                </Col>


              </Row>
            </Col>
          </Row>
        </Card>

        {loading && <CircularLoader />}


        {
          missedSuppliers.length > 0 && (

            <Card bordered={false} style={cardStyle}>

              <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
                <Col span={12}>
                  Missing Cards -   {missedSuppliers.length}   -



                  {missedTotal}</Col>
                <Col span={12}>
                  Rejoined Cards- {rejoinedSuppliers.length}  -
                  -                  {rejoinedTotal}
                </Col>

              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
                <Col span={12}>
                  <Card bordered={false} style={cardStyle}>
                    <Table
                      columns={supplierTableColumns}
                      dataSource={missedSuppliers} className="sup-bordered-table"
                      rowKey="supplier_id"
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card bordered={false} style={cardStyle}>
                    <Table
                      columns={supplierTableColumns}
                      dataSource={rejoinedSuppliers} className="sup-bordered-table"
                      rowKey="supplier_id"
                      size="small"

                      pagination={{ pageSize: 100 }}
                    />
                  </Card>
                </Col>


              </Row>


            </Card>
          )
        }




      </div>
    </div>
  );
};

export default MissRejo;