import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Table, Select, DatePicker } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [targets, setTargets] = useState([]);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

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

  const loadTargetsForMonth = async (filter) => {

    const formatted =
      (filter.year + '_' + filter.month)






    try {
      const data = await import(`../data/targets/targets_${formatted}.json`);
      setTargets(data.default);
    } catch (err) {
      console.error("Target file not found for:", formatted, err);
      setTargets([]); // or fallback to default
    }
  };

  useEffect(() => {
    loadTargetsForMonth(filters);
  }, [filters.month]);


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
          //     row.super.toLocaleString(),
          row.target.toLocaleString(),
          row.total.toLocaleString(),
          row.difference.toLocaleString()
        ];
      });

      autoTable(doc, {
        startY: startY + 9,
        head: [["Line", "Target", "Received", "Difference"]],
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

  const getLeafRecordsByWeeks = async () => {
    const ids = Array.from({ length: 162 }, (_, i) => i + 1).join(",");
    const weeklyRanges = getWeeklyRanges();

    const weekUrls = [
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week1}`, setSummary: setWeek1Summary, setTotals: setWeek1Totals },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week2}`, setSummary: setWeek2Summary, setTotals: setWeek2Totals },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week3}`, setSummary: setWeek3Summary, setTotals: setWeek3Totals },
      { url: `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${ids}&d=${weeklyRanges.week4}`, setSummary: setWeek4Summary, setTotals: setWeek4Totals },
    ];

    dispatch(showLoader());
    setLoading(true);
    setError(null);

    try {
      for (const { url, setSummary, setTotals } of weekUrls) {
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

        const summaryData = {
          records: transformed,
          totalSuper,
          totalTarget,
          totalReceived,
          totalDifference: totalTarget - totalReceived,
        };

        setTotals(summaryData);

        // Build summary table grouped by officer
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
      setError(err.message);
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


  useEffect(() => {
    getLeafRecordsByDates(dayjs().subtract(1, "day"));
    getLeafRecordsByWeeks()
  }, [filters.month]);

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
            <Col span={24}>
              <Row gutter={[8, 8]}>

                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to PDF All
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to Week 1
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to Week 2
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to Week 3
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={exportToPDF}
                  >
                    Export to Week 4
                  </Button>
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






              </Row>
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