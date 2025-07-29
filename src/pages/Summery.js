import React, { useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Progress } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, fetchMonthlyTargets, getMonthDateRangeFromParts } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import CountUp from "react-countup";
const { Option } = Select;
const Summary = () => {

  const dispatch = useDispatch();
  const [routeSummary, setRouteSummary] = useState([]);

  const [summery, setSummery] = useState([])

  const [week1Summary, setWeek1Summary] = useState([]);
  const [week2Summary, setWeek2Summary] = useState([]);
  const [week3Summary, setWeek3Summary] = useState([]);
  const [week4Summary, setWeek4Summary] = useState([]);

  const [week1Totals, setWeek1Totals] = useState({});
  const [week2Totals, setWeek2Totals] = useState({});
  const [week3Totals, setWeek3Totals] = useState({});
  const [week4Totals, setWeek4Totals] = useState({});



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const targetsN = useRef();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);
  const { week1Target, week2Target, week3Target, week4Target } = useSelector((state) => state.commonData);

  const officerOrder = ["Ajith", "Chamod", "Udara", "Gamini", "Udayanga", "Other"];
  const customLineCodeOrder = [
    "MT", "PH", "PW", "PP", "GO", "MP", "BM", "TP", "UP",
    "BA", "BK", "K", "PT", "PK", "A", "KM", "N", "DM",
    "NG", "S", "DR",
    "J", "T", "SELF 02", "TK", "HA", "D",
    "SLF", "DG", "ML", "MV"
  ];

  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = endOfMonth.getDate() - today.getDate() + 1;
  const exportToPDFOfficer = (pdfData, title, key) => {
    const doc = new jsPDF();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const renderTable = (data, startY) => {
      const tableData = data.map((row, index) => {
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (row.line.includes("(")) {
          const [code] = row.line.split("(");
          lineCode = code.trim();
        } else {
          lineCode = row.line;
        }

        return [
          row.isTotal ? "" : index + 1,
          lineCode,
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString(),
          row.target > 0 ? ((row.total / row.target) * 100).toFixed(0) + "%" : "-",
          row.super.toLocaleString(),
          row.super > 0 ? ((row.super / row.total) * 100).toFixed(0) + "%" : "-",
          row.difference > 0 && daysRemaining > 0 ? Math.round(row.difference / daysRemaining).toLocaleString() : "-"
        ];
      });

      autoTable(doc, {
        startY: startY,
        head: [["#", "Line", "Target", "Received", "Difference", "%", "Super", "%", "Per Day"]],
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
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          const columnIndex = data.column.index;
          const cellValue = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = data.table.body.length - 1;

          if (data.section === 'body') {
            if (columnIndex === 1 && cellValue !== "Total" && rowIndex !== lastIndex) {
              data.cell.styles.fillColor = [255, 255, 153];
            }

            if (rowIndex === lastIndex && data.row.cells[1].raw === "Total") {
              data.cell.styles.fillColor = [255, 192, 203];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }

            if (columnIndex === 5 && typeof cellValue === 'string' && cellValue.endsWith('%')) {
              const percent = parseFloat(cellValue.replace('%', ''));
              if (percent >= 100) {
                data.cell.raw = `${cellValue} ✅ Done`;
                data.cell.styles.fillColor = [0, 255, 127];
              } else if (percent >= 70) {
                data.cell.styles.fillColor = [153, 255, 153];
              } else if (percent >= 50) {
                data.cell.styles.fillColor = [255, 204, 102];
              } else if (percent >= 20) {
                data.cell.styles.fillColor = [255, 255, 153];
              } else {
                data.cell.styles.fillColor = [255, 102, 102];
              }
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }

            if (columnIndex === 7 && typeof cellValue === 'string' && cellValue.endsWith('%')) {
              const percent = parseFloat(cellValue.replace('%', ''));
              data.cell.styles.fillColor = percent > 50 ? [153, 255, 153] : [255, 102, 102];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        }
      });

      return doc.lastAutoTable.finalY + 10;
    };

    // === Header ===
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Leaf Summary by Mr. ${title} on Date: ${yesterday.toLocaleDateString()}`, 14, 46);
    doc.line(14, 50, 196, 50);

    let startY = 56;
    const officer = officerOrder[key];
    const data = pdfData.filter(row => row.officer === officer);
    if (data.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      if (officer == 'Other') {
        doc.text(`${officer} Summary`, 14, startY);
      } else {
        doc.text(`Mr. ${officer} Summary`, 14, startY);
      } doc.setFont(undefined, 'normal');
      startY = renderTable(data, startY + 9);
    }

    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    doc.save(`Leaf Summary by Mr. ${title} on Date: ${yesterday.toLocaleDateString()}.pdf`);
  };

  const exportToPDF = (pdfData, title) => {
    const doc = new jsPDF();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const renderTable = (data, startY) => {
      const tableData = data.map((row, index) => {
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (row.line.includes("(")) {
          const [code] = row.line.split("(");
          lineCode = code.trim();
        } else {
          lineCode = row.line;
        }

        return [
          row.isTotal ? "" : index + 1,
          lineCode,
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString(),
          row.target > 0 ? ((row.total / row.target) * 100).toFixed(0) + "%" : "-",
          row.super.toLocaleString(),
          row.super > 0 ? ((row.super / row.total) * 100).toFixed(0) + "%" : "-",
          row.difference > 0 && daysRemaining > 0 ? Math.round(row.difference / daysRemaining).toLocaleString() : "-"
        ];
      });

      autoTable(doc, {
        startY: startY,
        head: [["#", "Line", "Target", "Received", "Difference", "%", "Super", "%", "Per Day"]],
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
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          const columnIndex = data.column.index;
          const cellValue = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = data.table.body.length - 1;

          if (data.section === 'body') {
            if (columnIndex === 1 && cellValue !== "Total" && rowIndex !== lastIndex) {
              data.cell.styles.fillColor = [255, 255, 153];
            }

            if (rowIndex === lastIndex && data.row.cells[1].raw === "Total") {
              data.cell.styles.fillColor = [255, 192, 203];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }

            if (columnIndex === 5 && typeof cellValue === 'string' && cellValue.endsWith('%')) {
              const percent = parseFloat(cellValue.replace('%', ''));
              if (percent >= 100) {
                data.cell.raw = `${cellValue} ✅ Done`;
                data.cell.styles.fillColor = [0, 255, 127];
              } else if (percent >= 70) {
                data.cell.styles.fillColor = [153, 255, 153];
              } else if (percent >= 50) {
                data.cell.styles.fillColor = [255, 204, 102];
              } else if (percent >= 20) {
                data.cell.styles.fillColor = [255, 255, 153];
              } else {
                data.cell.styles.fillColor = [255, 102, 102];
              }
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }

            if (columnIndex === 7 && typeof cellValue === 'string' && cellValue.endsWith('%')) {
              const percent = parseFloat(cellValue.replace('%', ''));
              data.cell.styles.fillColor = percent >= 50 ? [153, 255, 153] : [255, 102, 102];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        }
      });

      return doc.lastAutoTable.finalY + 10;
    };

    // === Header ===
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    // === Title ===
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const summaryTitle = title === 'Full Summery' ? `Leaf Summary on Date: ${yesterday.toLocaleDateString()}` : title;
    doc.text(summaryTitle, 14, 46);
    doc.line(14, 50, 196, 50);

    let startY = 56;

    officerOrder.forEach((officer, i) => {
      const data = pdfData.filter(row => row.officer === officer);
      if (!data.length) return;

      if (i === 3 || i === 5) doc.addPage();
      if (i === 3 || i === 5) startY = 20;

      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      if (officer == 'Other') {
        doc.text(`${officer} Summary`, 14, startY);
      } else {
        doc.text(`Mr. ${officer} Summary`, 14, startY);
      }
      doc.setFont(undefined, 'normal');

      startY = renderTable(data, startY + 9);
    });

    // === Footer ===
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
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

  const getTargetByLineCode = (lineCode, target) => {
    const entry = target.find(item => item.lineCode === lineCode);
    return entry ? entry.target : "";
  };

  const getLeafRecordsByDates = async () => {
    const dateRange = getMonthDateRangeFromParts(filters.year, filters.month);


    const ids = Array.from({ length: 170 }, (_, i) => i + 1).join(",");
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${dateRange}`;

    dispatch(showLoader());
    setLoading(true);
    setError(null);
    try {
      // 👉 Wait until target data is fully loaded
      const data = await fetchMonthlyTargets(filters.year, filters.month);

      if (data && Array.isArray(data)) {
        targetsN.current = data

      } else {
        toast.warn("⚠️ No target found for selected line.");
        return; // stop further execution if no target
      }

      // 👉 Proceed with leaf record fetch *after* target fetch completes
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaf records");

      const result = await response.json();
      if (!Array.isArray(result)) throw new Error("Invalid API data format");

      // ... continue processing result as you're already doing


      const idToMergedCode = getMergedMap();
      const mergeDisplayMap = getMergeDisplayMap();

      const transformed = result.map(item => {
        const lineId = String(item["Route"]).trim();
        const lineCode = idToMergedCode[lineId] || "Unknown";
        const net_kg = parseFloat(item["Net"]) || 0;
        const isSuper = item["Leaf Type"] === 2;
        const target = getTargetByLineCode(lineCode, targetsN.current) || 0;

        if (lineCode === "Unknown") {
          console.warn(`Unknown line ID: ${lineId}`);
        }

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

      setSummery({
        records: transformed,
        totalSuper,
        totalTarget,
        totalReceived,
        totalDifference,
      });
      // 👉 Group data by officer and line
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
            target: getTargetByLineCode(item.lineCode, targetsN.current),
            difference: 0,
          };
        }
        if (item.leaf_type === "Super") groupedTotals[key].super += item.net_kg;
        groupedTotals[key].total += item.net_kg;
        groupedTotals[key].difference =
          groupedTotals[key].target - groupedTotals[key].total;
      });

      // 👉 Group rows per officer
      const groupedByOfficer = {};
      Object.values(groupedTotals).forEach(row => {
        if (!groupedByOfficer[row.officer]) groupedByOfficer[row.officer] = [];
        groupedByOfficer[row.officer].push(row);
      });

      const finalTableData = [];
      let keyCounter = 0;

      officerOrder.forEach(officer => {
        let group = groupedByOfficer[officer] || [];

        group = group.sort((a, b) => {
          const indexA = customLineCodeOrder.indexOf(a.lineCode);
          const indexB = customLineCodeOrder.indexOf(b.lineCode);
          if (indexA === -1 && indexB === -1)
            return a.lineCode.localeCompare(b.lineCode);
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

      // 👉 Add grand total row
      const grandTotal = finalTableData.reduce(
        (acc, row) => {
          if (!row.isTotal) return acc;
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

      // 👉 Weekly breakdown
      if (typeof getLeafRecordsByWeeks === "function") {
        getLeafRecordsByWeeks(targetsN.current);
      }

      setRouteSummary(finalTableData);
      console.log('////////////////////////////////////');

    } catch (err) {
      console.error("Error in getLeafRecordsByDates:", err);
      toast.error("Error while loading data. Please try again.");
    } finally {
      dispatch(hideLoader());
      setLoading(false);
    }
  };


  const getLeafRecordsByWeeks = async (targets) => {
    const ids = Array.from({ length: 170 }, (_, i) => i + 1).join(",");
    const weeklyRanges = getWeeklyRanges();

    const weekUrls = [
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week1}`, setSummary: setWeek1Summary, setTotals: setWeek1Totals, weeklyPortion: week1Target / 100 },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week2}`, setSummary: setWeek2Summary, setTotals: setWeek2Totals, weeklyPortion: week2Target / 100 },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week3}`, setSummary: setWeek3Summary, setTotals: setWeek3Totals, weeklyPortion: week3Target / 100 },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week4}`, setSummary: setWeek4Summary, setTotals: setWeek4Totals, weeklyPortion: week4Target / 100 },
    ];

    dispatch(showLoader());
    setLoading(true);
    setError(null);

    const previousLineDiffMap = {}; // Carry forward map

    try {
      for (const { url, setSummary, setTotals, weeklyPortion } of weekUrls) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch leaf records");
        const result = await response.json();

        const idToMergedCode = getMergedMap();
        const mergeDisplayMap = getMergeDisplayMap();

        const transformed = result && result.map(item => {
          const lineId = String(item["Route"]).trim();
          const lineCode = idToMergedCode[lineId] || "Unknown";
          const net_kg = parseFloat(item["Net"]);
          const isSuper = item["Leaf Type"] === 2;

          const baseTarget = getTargetByLineCode(lineCode, targets) * weeklyPortion || 0;
          const lastDiff = previousLineDiffMap[lineCode];
          const carryOver = lastDiff > 0 ? lastDiff : 0;
          const finalTarget = baseTarget + carryOver;

          return {
            supplier_id: item["Supplier Id"],
            date: item["Leaf Date"],
            leaf_type: isSuper ? "Super" : "Normal",
            lineId,
            lineCode,
            displayLine: mergeDisplayMap[lineCode] || lineCode,
            net_kg,
            isSuper,
            target: finalTarget,
            officer: getOfficerByLineCode(lineCode),
          };
        });

        // Summary totals
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

        setTotals({
          records: transformed,
          totalSuper,
          totalTarget,
          totalReceived,
          totalDifference: totalTarget - totalReceived,
        });

        // Group and summarize per officer
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
              target: item.target,
              difference: 0,
            };
          }
          if (item.leaf_type === "Super") groupedTotals[key].super += item.net_kg;
          groupedTotals[key].total += item.net_kg;
          const val = groupedTotals[key].target - groupedTotals[key].total;
          groupedTotals[key].difference = groupedTotals[key].target - groupedTotals[key].total;
        });

        // Save differences for next week
        for (const row of Object.values(groupedTotals)) {
          previousLineDiffMap[row.lineCode] = row.difference;
        }

        // Sort and structure final table
        const groupedByOfficer = {};
        Object.values(groupedTotals).forEach(row => {
          if (!groupedByOfficer[row.officer]) groupedByOfficer[row.officer] = [];
          groupedByOfficer[row.officer].push(row);
        });

        const finalTableData = [];
        let keyCounter = 0;

        officerOrder.forEach(officer => {
          const group = (groupedByOfficer[officer] || []).sort((a, b) => {
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

        const grandTotal = finalTableData.reduce(
          (acc, row) => {
            if (!row.isTotal) return acc;
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

        setSummary(finalTableData);
      }
    } catch (err) {

    } finally {
      dispatch(hideLoader());
      setLoading(false);
    }
  };


  const getWeeklyRanges = () => {
    const { year, month } = filters;

    // Check if year or month are not properly selected
    if (year === "Select Year" || month === "Select Month") {
      console.warn("Invalid year or month selected for weekly range calculation");
      return [];
    }

    const yearNum = Number(year);
    const monthNum = Number(month) - 1; // dayjs is 
    // 0-indexed

    const firstDay = dayjs(new Date(yearNum, monthNum, 1));
    const lastDay = firstDay.endOf("month");




    const week1 = `${firstDay.format("YYYY-MM-DD")}~${firstDay.add(6, "day").format("YYYY-MM-DD")}`;
    const week2 = `${firstDay.add(7, "day").format("YYYY-MM-DD")}~${firstDay.add(13, "day").format("YYYY-MM-DD")}`;
    const week3 = `${firstDay.add(14, "day").format("YYYY-MM-DD")}~${firstDay.add(20, "day").format("YYYY-MM-DD")}`;
    const week4 = `${firstDay.add(21, "day").format("YYYY-MM-DD")}~${lastDay.format("YYYY-MM-DD")}`;



    return {


      week1, week2, week3, week4
    };
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
          <Row justify="space-evenly" gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={1}>
                  <Button
                    icon={<ReloadOutlined />}
                    type="primary"
                    block
                    danger
                    onClick={


                      () => {

                        setRouteSummary([])
                        setWeek1Summary([])
                        setWeek2Summary([])
                        setWeek3Summary([])
                        setWeek4Summary([])
                        setFilters({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' })
                      }

                    }
                  >

                  </Button>
                </Col>
                <Col md={3}>
                  <Select showSearch
                    style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}

                    value={filters.year}
                    bordered={false} onChange={val => setFilters(f => ({ ...f, year: val, month: "Select Month" }))}>

                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      );
                    })}



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
                <Col md={3}>

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
                    disabled={!routeSummary.length}
                    onClick={() => exportToPDF(routeSummary, 'Full Summery')}
                  >
                    Download
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    disabled={!routeSummary.length}

                    onClick={() => exportToPDF(week1Summary, '1st Week Summery')}
                  >
                    Week 1
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }} disabled={!routeSummary.length}

                    onClick={() => exportToPDF(week2Summary, '2nd Week Summery')}
                  >
                    Week 2
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }} disabled={!routeSummary.length}

                    onClick={() => exportToPDF(week3Summary, '3rd Week Summery')}
                  >
                    Week 3
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }} disabled={!routeSummary.length}

                    onClick={() => exportToPDF(week4Summary, 'Last Week Summery')}
                  >
                    Week 4
                  </Button>
                </Col>

              </Row>
            </Col>
          </Row>
        </Card>



        <Row gutter={[16, 16]} justify="center">
          {!loading &&
            officerOrder.map((officer, key) => {
              const officerData = routeSummary.filter((row) => row.officer === officer);
              if (!officerData.length) return null;

              const lastRow = officerData[officerData.length - 1]; // Get last row

              const { super: superKg, total, target } = lastRow;
              const achievementPercent = target > 0 ? ((total / target) * 100).toFixed(0) : "0.0";
              const superLeafPercent = target > 0 ? ((superKg / total) * 100).toFixed(0) : "0.0";
              const normal = total - superKg
              return (
                <Col key={officer} xs={24} sm={12} md={24}>
                  <div
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      borderRadius: 10,
                      padding: "16px 24px",
                      fontWeight: 500,
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    <h3 style={{ color: "#FFD700", textAlign: "center", marginBottom: 12 }}>
                      {officer} Summary
                    </h3>
                    <Row gutter={[16, 16]} justify="center">

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
                          <CountUp style={{ fontSize: 30 }} end={Math.round(superKg)} duration={0.5} separator="," /> kg<br />

                        </div>


                      </Col>
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
                          <CountUp style={{ fontSize: 30 }} end={Math.round(normal)} duration={0.5} separator="," /> kg
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
                          Overall Total<br />                        <CountUp style={{ fontSize: 30 }} end={Math.round(total)} duration={0.5} separator="," /> kg<br />

                        </div>
                      </Col>

                    </Row>
                    <br></br>
                    <Row gutter={[16, 16]} justify="center">
                      <Col xs={24} sm={24} md={22}>

                        <Progress
                          percent={parseFloat(achievementPercent)}
                          status="active"
                          strokeColor={{
                            from: "#ff1818ff",
                            to: "#52c41a",
                          }}
                          strokeWidth={14}
                          style={{
                            marginTop: 12,
                            borderRadius: 8,
                            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
                          }}
                          format={(percent) => (
                            <span style={{ fontSize: 25, fontWeight: "bold", color: "#fff" }}>
                              {percent}%
                            </span>
                          )}
                        />
                      </Col>

                    </Row>
                    <br />
                    <Row gutter={[16, 16]} justify="end">


                      <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => exportToPDFOfficer(routeSummary, officer, key)}
                      >
                        Download
                      </Button>


                    </Row>


                    {/* <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                      <div><strong>Super:</strong> {Math.round(superKg)} kg</div>
                      <div><strong>Normal:</strong> {Math.round(normal)} kg</div>
                      <div><strong>Total:</strong> {Math.round(total)} kg</div>
                      <div><strong>Super:</strong> {superLeafPercent}%</div>
                      <div><strong>Target:</strong> {Math.round(target)} kg</div>
                      <div><strong>Achieved:</strong> {achievementPercent}%</div>
                    </div> */}
                  </div>
                </Col>
              );
            })}
        </Row>



        {loading && <CircularLoader />}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}



      </div>
    </div>
  );
};

export default Summary;