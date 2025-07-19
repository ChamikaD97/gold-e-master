import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Table, Tooltip, DatePicker } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Summary = () => {
  const dispatch = useDispatch();
  const [routeSummary, setRouteSummary] = useState([]);

  const [summery, setSummery] = useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs()); // default to current month
  const [targets, setTargets] = useState([]);

  const officerOrder = ["Ajith", "Chamod", "Udara", "Gamini", "Udayanga", "Other"];
  const customLineCodeOrder = [
    "MT", "PH", "PW", "PP", "GO", "MP", "BM", "TP", "UP",
    "BA", "BK", "K", "PT", "PK", "A", "KM", "N", "DM",
    "NG", "S", "DR",
    "J", "T", "SELF 02", "TK", "HA", "D",
    "SLF", "DG", "ML", "MV"
  ];

  const loadTargetsForMonth = async (month) => {
    
    const formatted = dayjs(month).format("YYYY_MM");
    console.log(formatted);

    try {
      const data = await import(`../data/targets/targets_${formatted}.json`);
      setTargets(data.default);
    } catch (err) {
      console.error("Target file not found for:", formatted, err);
      setTargets([]); // or fallback to default
    }
  };

  useEffect(() => {
    loadTargetsForMonth(selectedMonth);
  }, [selectedMonth]);

  
  useEffect(() => {
    loadTargetsForMonth(selectedMonth);
  }, [selectedMonth]);

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

    let startY = 56;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    doc.text(`Leaf Summary on Date: ${yesterday.toLocaleDateString()}`, 14, 46);

    doc.line(14, 50, 196, 50);
    // First Page: Officers 0, 1, 2
    officerOrder.slice(0, 3).forEach(officer => {
      const data = routeSummary.filter(row => row.officer === officer);
      if (!data.length) return;

      const title = `Mr. ${officer} Summary`;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(title, 14, startY);
      doc.setFont(undefined, 'normal');

      const tableData = data.map(row => {
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (row.line.includes("(")) {
          const [code, ids] = row.line.split("(");
          lineCode = code.trim();
        } else {
          lineCode = row.line;
        }

        return [
          lineCode,
          row.super.toLocaleString(),
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString()
        ];
      });

      autoTable(doc, {
        startY: startY + 9,
        head: [["Line", "Super", "Target", "Received", "Difference"]],
        body: tableData,
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
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.2,
        horizontalLineColor: [0, 0, 0],
        horizontalLineWidth: 0.2,
        verticalLineColor: [0, 0, 0],
        verticalLineWidth: 0.2,
        margin: { left: 14, right: 14 },

        didParseCell: function (data) {
          const columnIndex = data.column.index;
          const cellValue = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = tableData.length - 1;

          // ✅ Green background only for the first column, excluding header and "Total" row
          if (
            data.section === 'body' &&
            columnIndex === 0 &&           // Only "Line" column
            cellValue !== "Total" &&       // Skip "Total" row
            rowIndex !== lastIndex         // Extra safety check
          ) {
            data.cell.styles.fillColor = [255, 255, 153]; // Light yellow
          }

          // 🎯 Highlight "Total" row in pink
          if (
            data.section === 'body' &&
            rowIndex === lastIndex &&
            tableData[lastIndex][0] === "Total"
          ) {
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [255, 192, 203]; // Light pink
          }
        }
      });

      startY = doc.lastAutoTable.finalY + 10;
    });
    // Add Second Page
    doc.addPage();
    startY = 20; // Reset Y for new page
    // Second Page: Officers 3 and 4
    officerOrder.slice(3, 5).forEach(officer => {
      const data = routeSummary.filter(row => row.officer === officer);
      if (!data.length) return;

      const title = `Mr. ${officer} Summary`;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(title, 14, startY);
      doc.setFont(undefined, 'normal');

      const tableData = data.map(row => {
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (row.line.includes("(")) {
          const [code, ids] = row.line.split("(");
          lineCode = code.trim();
        } else {
          lineCode = row.line;
        }

        return [
          lineCode,
          row.super.toLocaleString(),
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString()
        ];
      });

      autoTable(doc, {
        startY: startY + 9,
        head: [["Line", "Super", "Target", "Received", "Difference"]],
        body: tableData,
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
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.2,
        horizontalLineColor: [0, 0, 0],
        horizontalLineWidth: 0.2,
        verticalLineColor: [0, 0, 0],
        verticalLineWidth: 0.2,
        margin: { left: 14, right: 14 },

        didParseCell: function (data) {
          const columnIndex = data.column.index;
          const cellValue = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = tableData.length - 1;

          // ✅ Green background only for the first column, excluding header and "Total" row
          if (
            data.section === 'body' &&
            columnIndex === 0 &&           // Only "Line" column
            cellValue !== "Total" &&       // Skip "Total" row
            rowIndex !== lastIndex         // Extra safety check
          ) {
            data.cell.styles.fillColor = [255, 255, 153]; // Light yellow
          }

          // 🎯 Highlight "Total" row in pink
          if (
            data.section === 'body' &&
            rowIndex === lastIndex &&
            tableData[lastIndex][0] === "Total"
          ) {
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [255, 192, 203]; // Light pink
          }
        }
      });

      startY = doc.lastAutoTable.finalY + 10;
    });


    officerOrder.slice(5, 6).forEach(officer => {
      const data = routeSummary.filter(row => row.officer === officer);
      if (!data.length) return;


      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const tableData = data.map(row => {
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (row.line.includes("(")) {
          const [code, ids] = row.line.split("(");
          lineCode = code.trim();
        } else {
          lineCode = row.line;
        }

        return [
          lineCode,
          row.super.toLocaleString(),
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString()
        ];
      });

      autoTable(doc, {
        startY: startY + 9,
        head: [["Line", "Super", "Target", "Received", "Difference"]],
        body: tableData,
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
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.2,
        horizontalLineColor: [0, 0, 0],
        horizontalLineWidth: 0.2,
        verticalLineColor: [0, 0, 0],
        verticalLineWidth: 0.2,
        margin: { left: 14, right: 14 },

        didParseCell: function (data) {
          const columnIndex = data.column.index;
          const cellValue = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = tableData.length - 1;

          // ✅ Green background only for the first column, excluding header and "Total" row
          if (
            data.section === 'body' &&
            columnIndex === 0 &&           // Only "Line" column
            cellValue !== "Total" &&       // Skip "Total" row
            rowIndex !== lastIndex         // Extra safety check
          ) {
            data.cell.styles.fillColor = [255, 255, 153]; // Light yellow
          }

          // 🎯 Highlight "Total" row in pink
          if (
            data.section === 'body' &&
            rowIndex === lastIndex &&
            tableData[lastIndex][0] === "Total"
          ) {
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [255, 192, 203]; // Light pink
          }
        }

      });

      startY = doc.lastAutoTable.finalY + 10;
    });
    officerOrder.slice(5, 7).forEach(officer => {
      const data = routeSummary.filter(row => row.officer === officer);
      if (!data.length) return;

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);

      doc.setFont(undefined, 'normal');

      // ✅ Calculate overall totals from officer total rows


      // ✅ Build table data
      const summaryTableData = [[

        summery.totalSuper,
        summery.totalTarget, summery.totalReceived,

      ]];

      // ✅ Add spacing
      startY = doc.lastAutoTable.finalY + 10;

      // ✅ Add Summary Table
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text("Grand Total Summary", 14, startY);
      doc.setFont(undefined, 'normal');

      autoTable(doc, {
        startY: startY + 4,
        head: [["Super", "Target", "Received"]],
        body: summaryTableData,
        styles: {
          fontSize: 10,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [0, 123, 255], // blue header
          textColor: 255,
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
          fillColor: [255, 255, 200], // light yellow background
        },
        margin: { left: 14, right: 14 },
      });

      startY = doc.lastAutoTable.finalY + 10;
    });
    // Go to last page
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);

    // Footer only on last page
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    doc.save("GreenHouse_Summary.pdf");
  };


  const columns = [
    {
      title: "Line",
      dataIndex: "lineCode",
      key: "lineCode",
      render: (text, row) =>
        row.isTotal
          ? <strong style={{ color: row.officer === "Grand Total" ? "#FFD700" : "orange" }}>{row.officer}</strong>
          : <span>{text}</span>,
    },
    {
      title: "Super",
      dataIndex: "super",
      key: "super",
      align: "right",
      render: (value, row) => row.isTotal
        ? <strong>{value.toLocaleString()}</strong>
        : value.toLocaleString(),
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      align: "right",
      render: (value, row) => row.isTotal
        ? <strong>{value.toLocaleString()}</strong>
        : value.toLocaleString(),
    },
    {
      title: "Received",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (value, row) => row.isTotal
        ? <strong>{value.toLocaleString()}</strong>
        : value.toLocaleString(),
    },
    {
      title: "Difference",
      dataIndex: "difference",
      key: "difference",
      align: "right",
      render: (value, row) => {
        const color = value >= 0 ? "lime" : "red";
        return (
          <span style={{ color }}>
            {row.isTotal ? <strong>{value.toLocaleString()}</strong> : value.toLocaleString()}
          </span>
        );
      }
    }
  ];

  const getOfficerByLineCode = (lineCode) => {
    const entry = lineIdCodeMap.find(item => item.lineCode === lineCode);
    return entry?.officer || "Unknown";
  };

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

  const getMergeDisplayMap = () => {
    const displayMap = {};
    lineIdCodeMap.forEach(item => {
      const ids = item.lineId.split(",");
      if (ids.length > 1) {
        ids.forEach(id => {
          displayMap[item.lineCode] = item.lineCode + " (" + item.lineId + ")";
        });
      }
    });
    return displayMap;
  };

  const getTargetByLineCode = (lineCode) => {
    const entry = targets.find(item => item.lineCode === lineCode);
    return entry ? entry.target : "";
  };

  const getLeafRecordsByDates = async (day) => {
    const fromDate = day.startOf("month").format("YYYY-MM-DD");
    const toDate = day.format("YYYY-MM-DD");
    const dateRange = `${fromDate}~${toDate}`;
    const ids = Array.from({ length: 162 }, (_, i) => i + 1).join(",");
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${dateRange}`;

    dispatch(showLoader());
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaf records");
      const result = await response.json();

      const idToMergedCode = getMergedMap();
      const mergeDisplayMap = getMergeDisplayMap();
      const transformed = result.map(item => {
        const lineId = String(item["Route"]).trim();
        const lineCode = idToMergedCode[lineId] || "Unknown";
        const net_kg = parseFloat(item["Net"]);
        const isSuper = item["Leaf Type"] === 2;
        const target = getTargetByLineCode(lineCode) || 0;

        return {
          supplier_id: item["Supplier Id"],
          date: item["Leaf Date"],
          leaf_type: isSuper ? "Super" : "Normal",
          lineId,
          lineCode,
          displayLine: mergeDisplayMap[lineCode] || lineCode,
          net_kg,
          isSuper,
          target,
          officer: getOfficerByLineCode(lineCode),
        };
      });

      // 👉 Aggregate totals
      let totalSuper = 0;
      let totalReceived = 0;
      let totalTarget = 0;

      const uniqueLineCodes = new Set();

      transformed.forEach(record => {
        totalReceived += record.net_kg;
        if (record.isSuper) totalSuper += record.net_kg;

        if (!uniqueLineCodes.has(record.lineCode)) {
          totalTarget += record.target;
          uniqueLineCodes.add(record.lineCode);
        }
      });

      const totalDifference = totalTarget - totalReceived;

      // ✅ Final summary object
      const summaryData = {
        records: transformed,
        totalSuper,
        totalTarget,
        totalReceived,
        totalDifference,
      };

      // Set state
      setSummery(summaryData);

      console.log(summaryData);

      const groupedTotals = {};
      transformed.forEach(item => {
        const key = `${item.officer}__${item.lineCode}`;
        if (!groupedTotals[key]) {
          groupedTotals[key] = {
            officer: item.officer,
            line: item.displayLine,
            lineCode: item.lineCode,
            super: 0,
            total: 0,
            target: getTargetByLineCode(item.lineCode),
            difference: 0,
          };
        }
        if (item.leaf_type === "Super") groupedTotals[key].super += item.net_kg;
        groupedTotals[key].total += item.net_kg;
        groupedTotals[key].difference = groupedTotals[key].target - groupedTotals[key].total;
      });

      const groupedByOfficer = {};
      Object.values(groupedTotals).forEach(row => {
        if (!groupedByOfficer[row.officer]) groupedByOfficer[row.officer] = [];
        groupedByOfficer[row.officer].push(row);
      });

      const finalTableData = [];
      let keyCounter = 0;

      officerOrder.forEach(officer => {
        let group = groupedByOfficer[officer] || [];

        // Sort group by custom line code order
        group = group.sort((a, b) => {
          const indexA = customLineCodeOrder.indexOf(a.lineCode);
          const indexB = customLineCodeOrder.indexOf(b.lineCode);

          if (indexA === -1 && indexB === -1) return a.lineCode.localeCompare(b.lineCode);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        group.forEach((entry, index) => {
          finalTableData.push({
            key: keyCounter++,
            ...entry,
            officerRowSpan: index === 0 ? group.length + 1 : 0,
            isTotal: false,
          });
        });

        const total = group.reduce(
          (acc, row) => {
            acc.super += row.super;
            acc.total += row.total;
            acc.target += row.target;
            acc.difference += row.difference;
            return acc;
          },
          { super: 0, total: 0, target: 0, difference: 0 }
        );

        finalTableData.push({
          key: keyCounter++,
          officer,
          line: "Total",
          lineCode: "",
          super: total.super,
          total: total.total,
          target: total.target,
          difference: total.difference,
          officerRowSpan: 0,
          isTotal: true,
        });
      });

      // Add grand total row at the end
      const grandTotal = finalTableData.reduce(
        (acc, row) => {
          if (!row.isTotal) return acc; // Only sum officer total rows
          acc.super += row.super;
          acc.total += row.total;
          acc.target += row.target;
          acc.difference += row.difference;
          return acc;
        },
        { super: 0, total: 0, target: 0, difference: 0 }
      );

      finalTableData.push({
        key: keyCounter++,
        officer: "Grand Total",
        line: "",
        lineCode: "",
        super: grandTotal.super,
        total: grandTotal.total,
        target: grandTotal.target,
        difference: grandTotal.difference,
        officerRowSpan: 0,
        isTotal: true,
      });

      setRouteSummary(finalTableData);
    } catch (err) {
      setError(err.message);
    } finally {
      dispatch(hideLoader());
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeafRecordsByDates(dayjs().subtract(1, "day"));
  }, []);

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 16 }}>
      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
        <Card bordered={false} style={cardStyle}>
          <Row justify="space-between" gutter={[16, 16]}>
            <Col span={12}>
              <Row gutter={[8, 8]}>
                <Col md={2}>
                  <Button
                    icon={<ReloadOutlined />}
                    danger
                    type="primary"
                    block
                    onClick={() => getLeafRecordsByDates(dayjs().subtract(1, "day"))}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to PDF
                  </Button>
                </Col>

                <Col md={6}>


                  <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={(date) => {
                      if (date) {
                        setSelectedMonth(date);
                        getLeafRecordsByDates(date.endOf("month")); // trigger reload
                      }
                    }}
                    style={{ marginRight: 12 }}
                  />


                </Col>




              </Row>
            </Col>

            {/* 👉 Summary display on right */}
            <Col span={12} style={{ textAlign: "right" }}>
              <div style={{ color: "white", fontSize: 12, lineHeight: 1.5 }}>
                <div><strong>Total Super:</strong> {summery?.totalSuper?.toLocaleString() || 0} kg</div>
                <div><strong>Total Target:</strong> {summery?.totalTarget?.toLocaleString() || 0} kg</div>
                <div><strong>Total Received:</strong> {summery?.totalReceived?.toLocaleString() || 0} kg</div>
                <div><strong>Difference:</strong> <span style={{ color: summery?.totalDifference >= 0 ? "lime" : "red" }}>
                  {summery?.totalDifference?.toLocaleString() || 0} kg
                </span></div>
              </div>
            </Col>
          </Row>

        </Card>
        {loading && <CircularLoader />}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}


        <Card bordered={false} style={cardStyle}>
          {officerOrder.map((officer) => {
            const officerData = routeSummary.filter(row => row.officer === officer);
            if (!officerData.length) return null;
            return (
              <Card key={officer} bordered={false} style={{ ...cardStyle, marginBottom: 20 }}>
                <h3 style={{ color: "#FFD700", marginBottom: 12 }}>{officer} Summary</h3>
                <Table
                  columns={columns}
                  className="sup-bordered-table"

                  dataSource={officerData}
                  pagination={false}
                  bordered
                  size="middle"
                  rowClassName={(record) => record.officer === "Grand Total" ? "grand-total-row" : record.isTotal ? "officer-total-row" : ""}
                />

              </Card>
            );
          })}
        </Card>
      </div>
    </div>
  );
};

export default Summary;