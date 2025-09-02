import React, { useEffect, useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Progress, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, fetchLines, fetchMonthlyTargets, fetchOfficers, getMonthDateRangeFromParts } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import CountUp from "react-countup";
import { setAllLines, setOfficers } from "../redux/officerLineSlice";
const { Option } = Select;
const Summary = () => {

  const dispatch = useDispatch();
  const [routeSummary, setRouteSummary] = useState([]);
  const lineIdCodeMap = useSelector((state) => state.officerLine.allLines);
  const [finalTotal, setFinalTotal] = useState([]);
  const [summery, setSummery] = useState([])
  const [lastRow, setLastRow] = useState([]);

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
  const monthMap =
  {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December"
  }
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);
  const { week1Target, week2Target, week3Target, week4Target } = useSelector((state) => state.commonData);


  const [officerpOrder, setOfficerOrder] = useState([]);
  const officerOrder = ["Mr. Ajith", "Mr. Udayanga", "Mr. Udara", "Mr. Gamini", "Mr. Chamod", "Other"];


  const customLineCodeOrder = [
    "MT", "PH", "PW", "PP", "GO", "MP", "BM", "TP", "UP",
    "BA", "BK", "K", "PT", "PK", "A", "KM", "N", "DM",
    "NG", "S", "DR",
    "J", "T", "SELF 02", "TK", "HA", "D",
    "SLF", "DG", "ML", "MV"
  ];




  const getLines = async () => {
    try {
      const data = await fetchLines();
      dispatch(setAllLines(data));
      const filteredOfficers = data
        .map(item => item.officer)
      console.log("Fetched Lines:", data);


      const uniqueOfficers = [...new Set(
        data
          .map(item => item.officer)
          .filter(officer => officerpOrder.includes(officer))
      )];
      uniqueOfficers.push("Other");
      setOfficerOrder(uniqueOfficers);
      console.log("Officer Order:", uniqueOfficers);




    } catch (err) {
      message.error("Failed to fetch lines");
      console.error(err);
    }
  };
  const getOfficers = async () => {
    try {
      const data = await fetchOfficers();
      dispatch(setOfficers(data));


    } catch (err) {
      message.error("Failed to fetch Officers");
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    getOfficers();

    getLines();
  }, []);


  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = endOfMonth.getDate() - today.getDate() + 1;
  const exportToPDFOfficer = (pdfData, title, key) => {
    const doc = new jsPDF();

    // --- Month helpers ---
    const monthMap = {
      "01": "January", "02": "February", "03": "March", "04": "April",
      "05": "May", "06": "June", "07": "July", "08": "August",
      "09": "September", "10": "October", "11": "November", "12": "December"
    };
    const pad2 = (v) => String(v).padStart(2, "0");
    const getMonthName = (num) => monthMap[pad2(num)] || monthMap[num] || "";

    // --- Current / Selected month-year ---
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1; // 1..12
    const currentYear = now.getFullYear();
    const currentMonthName = getMonthName(currentMonthNum);

    // filters must be in scope (or pass them in)
    const selectedMonthNum = Number(filters?.month ?? currentMonthNum);
    const selectedYear = Number(filters?.year ?? currentYear);
    const selectedMonthName = getMonthName(selectedMonthNum);

    const isCurrentMonth =
      selectedMonthNum === currentMonthNum && selectedYear === currentYear;

    if (!isCurrentMonth) {
      console.log(
        `[NOT CURRENT MONTH] Selected: ${selectedMonthName} ${selectedYear} — Current: ${currentMonthName} ${currentYear}`
      );
      // message.info?.(`Showing data for ${selectedMonthName} ${selectedYear} (not current month).`);
    }

    // --- Yesterday (for header label) ---
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // --- Days remaining for "Per Day" (only for current month) ---
    const daysInSelectedMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
    const daysRemaining = isCurrentMonth
      ? Math.max(0, daysInSelectedMonth - yesterday.getDate())
      : 0;

    // --- Table renderer ---
    const renderTable = (rows, startY) => {
      const tableData = rows.map((row, index) => {
        const safeLine = typeof row.line === "string" ? row.line : String(row.line ?? "");
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (safeLine.includes("(")) {
          const [code] = safeLine.split("(");
          lineCode = code.trim();
        } else {
          lineCode = safeLine;
        }

        const target = Number(row.target ?? 0);
        const total = Number(row.total ?? 0);
        const difference = Number(row.difference ?? 0);
        const superKg = Number(row.super ?? 0);

        const pctTarget = target > 0 ? ((total / target) * 100).toFixed(0) + "%" : "-";
        const pctSuper = superKg > 0 && total > 0 ? ((superKg / total) * 100).toFixed(0) + "%" : "-";
        const perDay =
          difference > 0 && daysRemaining > 0
            ? Math.round(difference / daysRemaining).toLocaleString()
            : "-";

        return [
          row.isTotal ? "" : index + 1,
          lineCode,
          target.toLocaleString(),
          total.toLocaleString(),
          difference.toLocaleString(),
          pctTarget,
          superKg.toLocaleString(),
          pctSuper,
          perDay,
        ];
      });

      autoTable(doc, {
        startY,
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

          if (data.section !== "body") return;

          // Highlight line cells (non-total rows)
          if (columnIndex === 1 && cellValue !== "Total" && rowIndex !== lastIndex) {
            data.cell.styles.fillColor = [255, 255, 153]; // light yellow
          }

          // Totals row styling
          if (rowIndex === lastIndex && data.row.cells[1]?.raw === "Total") {
            data.cell.styles.fillColor = [255, 192, 203]; // pink
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [0, 0, 0];
          }

          // % of target column (index 5)
          if (columnIndex === 5 && typeof cellValue === "string" && cellValue.endsWith("%")) {
            const percent = parseFloat(cellValue.replace("%", ""));
            if (!isNaN(percent)) {
              if (percent >= 100) {
                data.cell.raw = `${cellValue} ✅ Done`;
                data.cell.styles.fillColor = [0, 255, 127]; // spring green
              } else if (percent >= 70) {
                data.cell.styles.fillColor = [153, 255, 153]; // light green
              } else if (percent >= 50) {
                data.cell.styles.fillColor = [255, 204, 102]; // light orange
              } else if (percent >= 20) {
                data.cell.styles.fillColor = [255, 255, 153]; // light yellow
              } else {
                data.cell.styles.fillColor = [255, 102, 102]; // light red
              }
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }

          // % Super column (index 7)
          if (columnIndex === 7 && typeof cellValue === "string" && cellValue.endsWith("%")) {
            const percent = parseFloat(cellValue.replace("%", ""));
            if (!isNaN(percent)) {
              data.cell.styles.fillColor = percent > 50 ? [153, 255, 153] : [255, 102, 102];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        },
      });

      return doc.lastAutoTable.finalY + 10;
    };

    // === Header ===
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, "bold");
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, "normal");
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    if (isCurrentMonth) {
      doc.text(`Leaf Summary by ${title} on Date: ${yesterday.toLocaleDateString()}`, 14, 46);
    } else {
      doc.text(`Leaf Summary by ${title} for ${selectedMonthName} ${selectedYear}`, 14, 46);
    }


    //doc.text(`Leaf Summary by ${title} on Date: ${yesterday.toLocaleDateString()}`, 14, 46);
    doc.line(14, 50, 196, 50);

    // === Content ===
    let startY = 56;
    const officer = officerOrder?.[key] ?? title; // officerOrder must be in scope
    const dataForOfficer = (pdfData || []).filter((row) => row.officer === officer);

    if (dataForOfficer.length > 0) {
      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text(`${officer} Summary`, 14, startY);
      doc.setFont(undefined, "normal");
      startY = renderTable(dataForOfficer, startY + 9);
    } else {
      doc.setFontSize(10);
      doc.text(`No data available for ${officer}`, 14, startY);
      startY += 8;
    }

    // === Footer ===
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, "normal");
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    // === Save ===
    const fileDate = yesterday.toLocaleDateString().replaceAll("/", "-");
    doc.save(`Leaf Summary by ${title} on Date ${fileDate}.pdf`);
  };


  const exportToPDF = (pdfData, title) => {
    const doc = new jsPDF();

    // --- Dates & daysRemaining (used for "Per Day") ---
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonthNum = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const selectedMonthNum = Number(filters?.month ?? currentMonthNum);
    const selectedYear = Number(filters?.year ?? currentYear);

    const isCurrentMonth =
      selectedMonthNum === currentMonthNum && selectedYear === currentYear;

    const daysInSelectedMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
    const daysRemaining = isCurrentMonth
      ? Math.max(0, daysInSelectedMonth - yesterday.getDate())
      : 0;

    // --- Table renderers ---
    const renderTable = (rows, startY) => {
      const tableData = rows.map((row, index) => {
        const safeLine = typeof row.line === "string" ? row.line : String(row.line ?? "");
        let lineCode = "";
        if (row.isTotal) {
          lineCode = "Total";
        } else if (safeLine.includes("(")) {
          const [code] = safeLine.split("(");
          lineCode = code.trim();
        } else {
          lineCode = safeLine;
        }

        const target = Number(row.target ?? 0);
        const total = Number(row.total ?? 0);
        const difference = Number(row.difference ?? 0);
        const superKg = Number(row.super ?? 0);

        return [
          row.isTotal ? "" : index + 1,
          lineCode,
          target.toLocaleString(),
          total.toLocaleString(),
          difference.toLocaleString(),
          target > 0 ? ((total / target) * 100).toFixed(0) + "%" : "-",
          superKg.toLocaleString(),
          total > 0 ? ((superKg / total) * 100).toFixed(0) + "%" : "-",
          difference > 0 && daysRemaining > 0
            ? Math.round(difference / daysRemaining).toLocaleString()
            : "-",
        ];
      });

      autoTable(doc, {
        startY,
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
        bodyStyles: { halign: "center", valign: "middle" },
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          const col = data.column.index;
          const raw = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = data.table.body.length - 1;

          if (data.section !== "body") return;

          // Highlight line cells (non-total rows)
          if (col === 1 && raw !== "Total" && rowIndex !== lastIndex) {
            data.cell.styles.fillColor = [255, 255, 153];
          }

          // Totals row styling
          if (rowIndex === lastIndex && data.row.cells[1]?.raw === "Total") {
            data.cell.styles.fillColor = [255, 192, 203];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [0, 0, 0];
          }

          // Achievement % color banding
          if (col === 5 && typeof raw === "string" && raw.endsWith("%")) {
            const percent = parseFloat(raw.replace("%", ""));
            if (!isNaN(percent)) {
              if (percent >= 100) {
                data.cell.raw = `${raw} ✅ Done`;
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
          }

          // Super % color
          if (col === 7 && typeof raw === "string" && raw.endsWith("%")) {
            const percent = parseFloat(raw.replace("%", ""));
            if (!isNaN(percent)) {
              data.cell.styles.fillColor = percent >= 50 ? [153, 255, 153] : [255, 102, 102];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        },
      });

      return doc.lastAutoTable.finalY + 10;
    };

    const renderTableLast = (rows, startY) => {
      const tableData = rows.map((row, index) => {
        const target = Number(row.target ?? 0);
        const total = Number(row.total ?? 0);
        const difference = Number(row.difference ?? 0);
        const superKg = Number(row.super ?? 0);

        return [
          index + 1,
          row.officer ?? "",
          target.toLocaleString(),
          total.toLocaleString(),
          difference.toLocaleString(),
          target > 0 ? ((total / target) * 100).toFixed(0) + "%" : "-",
          superKg.toLocaleString(),
          total > 0 ? ((superKg / total) * 100).toFixed(0) + "%" : "-",
          difference > 0 && daysRemaining > 0
            ? Math.round(difference / daysRemaining).toLocaleString()
            : "-",
        ];
      });

      autoTable(doc, {
        startY,
        head: [["#", "Officer", "Target", "Received", "Difference", "%", "Super", "%", "Per Day"]],
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
        bodyStyles: { halign: "center", valign: "middle" },
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          const col = data.column.index;
          const raw = data.cell.raw;
          const rowIndex = data.row.index;
          const lastIndex = data.table.body.length - 1;

          if (data.section !== "body") return;

          // officer column highlight (not last row)
          if (col === 1 && raw !== "" && rowIndex !== lastIndex) {
            data.cell.styles.fillColor = [255, 255, 153];
          }

          // final total row highlight
          if (rowIndex === lastIndex) {
            data.cell.styles.fillColor = [255, 192, 203];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [0, 0, 0];
          }

          // Achievement %
          if (col === 5 && typeof raw === "string" && raw.endsWith("%")) {
            const percent = parseFloat(raw.replace("%", ""));
            if (!isNaN(percent)) {
              if (percent >= 100) {
                data.cell.raw = `${raw} ✅ Done`;
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
          }

          // Super %
          if (col === 7 && typeof raw === "string" && raw.endsWith("%")) {
            const percent = parseFloat(raw.replace("%", ""));
            if (!isNaN(percent)) {
              data.cell.styles.fillColor = percent >= 50 ? [153, 255, 153] : [255, 102, 102];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        },
      });

      return doc.lastAutoTable.finalY + 10;
    };

    // === Header ===
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, "bold");
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, "normal");
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    // === Title ===
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    const monthMap = {
      "01": "January", "02": "February", "03": "March", "04": "April",
      "05": "May", "06": "June", "07": "July", "08": "August",
      "09": "September", "10": "October", "11": "November", "12": "December"
    };
    const pad2 = (v) => String(v).padStart(2, "0");

    if (isCurrentMonth) {
      const summaryTitle =
        title === "Full Summery"
          ? `Leaf Summary on Date: ${yesterday.toLocaleDateString()}`
          : title;
      doc.text(summaryTitle, 14, 46);
      // doc.text(`Leaf Summary on Date: ${yesterday.toLocaleDateString()}`, 14, 46);
    }
    else {
      const monthName = monthMap[pad2(selectedMonthNum)] || "";
      doc.text(`Leaf Summary for ${monthName} ${selectedYear}`, 14, 46);
    }
    //

    doc.line(14, 50, 196, 50);

    let startY = 56;

    // === Prepare final summary data ===
    const finalD = (finalTotal || [])
      .filter((row) => row.isTotal)
      .map((row) => ({
        ...row,
        target: Number(row.target ?? 0),
        total: Number(row.total ?? 0),
        super: Number(row.super ?? 0),
        difference: Number(row.difference ?? 0),
      }));

    const allButLast = finalD.slice(0, -1);
    const totalRow = {
      key: "",
      officer: "Total",
      line: "Total",
      lineCode: "",
      super: allButLast.reduce((sum, r) => sum + r.super, 0),
      total: allButLast.reduce((sum, r) => sum + r.total, 0),
      target: allButLast.reduce((sum, r) => sum + r.target, 0),
      difference: allButLast.reduce((sum, r) => sum + r.difference, 0),
      officerRowSpan: 0,
      isTotal: true,
    };
    const updatedFinalD = [...allButLast, totalRow];

    // === Officer pages ===

    
    (officerOrder || []).forEach((officer, i) => {
      const dataForOfficer = (pdfData || []).filter((row) => row.officer === officer);
      if (!dataForOfficer.length) return;

      if (i > 0) {
        doc.addPage();
        startY = 20;
      }

      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text(`${officer} Summary`, 14, startY);
      doc.setFont(undefined, "normal");

      startY = renderTable(dataForOfficer, startY + 9);
    });

    // === Full Summary page ===
    doc.addPage();
    startY = 70;

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Full Summary", 14, startY);
    doc.setFont(undefined, "normal");

    startY = renderTableLast(updatedFinalD, startY + 9);

    // === Footer ===
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, "normal");
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    // === Save ===
    const fileDate = yesterday.toLocaleDateString().replaceAll("/", "-");
    doc.save(`GreenHouse_Summary_${fileDate}.pdf`);
  };



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
        await getLeafRecordsByWeeks(targetsN.current); // awaited properly as part of async flow
      }
      const finalD = finalTableData
        .filter(row => row.isTotal)
        .map(row => ({
          ...row,
          target: Number(row.target)
        }));


      console.log(finalD);

      setFinalTotal(finalD);
      setRouteSummary(finalTableData);

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
    background: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };



  // Palette (same theme)
  const palette = {
    bgCard: "rgba(0, 0, 0, 0.65)",
    gold: "#FFD700",
    super: "#ffa347",
    normal: "#47a3ff",
    total: "#28a745",
  };

  // Upgrade your cardStyle (optional: replace your current one)

  // KPI tile styles (same colors, nicer finish)
  const kpiTile = {
    base: {
      borderRadius: 12,
      padding: "14px 22px",
      textAlign: "center",
      fontWeight: 600,
      color: "#000",
      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      border: "1px solid rgba(0,0,0,0.15)",
      transition: "transform 200ms ease, box-shadow 200ms ease",
    },
    hover: {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
    },
    super: { backgroundColor: palette.super },
    normal: { backgroundColor: palette.normal },
    total: {
      backgroundColor: palette.total,
      textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)",
    },
  };

  // Typographic tweaks
  const headerTitleStyle = {
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
    textShadow: "0 2px 6px rgba(0,0,0,0.4), 0 0 8px rgba(255,215,0,0.25)",
  };

  const kpiLabelStyle = {
    fontSize: 13,
    letterSpacing: 0.3,
    opacity: 0.95,
  };

  const kpiValueStyle = {
    fontSize: 32,
    lineHeight: 1.1,
    margin: 0,
  };

  const unitStyle = {
    fontSize: 12,
    opacity: 0.9,
    marginLeft: 6,
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
                    style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", color: "#000", border: "1px solid #333", borderRadius: 6 }}

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
                    style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", color: "#000", border: "1px solid #333", borderRadius: 6 }}
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

              const lastOfficerRow = officerData[officerData.length - 1];
              const { super: superKg, total, target } = lastOfficerRow;
              const achievementPercent = target > 0 ? Math.round((total / target) * 100) : 0;
              const normal = Math.max(0, total - superKg);

              return (
                <Col key={officer} xs={24} sm={12} md={24}>
                  <Card bordered={false} style={cardStyle}>
                    <Typography.Title level={3} style={headerTitleStyle}>
                      {officer} Summary
                    </Typography.Title>

                    <Row gutter={[16, 16]} justify="center">
                      <Col xs={24} sm={12} md={8}>
                        <div
                          style={{ ...kpiTile.base, ...kpiTile.super }}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, kpiTile.hover)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, kpiTile.base, kpiTile.super)}
                        >
                          <div style={kpiLabelStyle}>Super Total</div>
                          <Typography.Title level={3} style={{ ...kpiValueStyle, color: "#000" }}>
                            {Math.round(superKg).toLocaleString()}
                            <span style={unitStyle}>kg</span>
                          </Typography.Title>
                        </div>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <div
                          style={{ ...kpiTile.base, ...kpiTile.normal }}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, kpiTile.hover)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, kpiTile.base, kpiTile.normal)}
                        >
                          <div style={kpiLabelStyle}>Normal Total</div>
                          <Typography.Title level={3} style={{ ...kpiValueStyle, color: "#000" }}>
                            {Math.round(normal).toLocaleString()}
                            <span style={unitStyle}>kg</span>
                          </Typography.Title>
                        </div>
                      </Col>

                      <Col xs={24} sm={24} md={8}>
                        <div
                          style={{ ...kpiTile.base, ...kpiTile.total }}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, kpiTile.hover, kpiTile.total)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, kpiTile.base, kpiTile.total)}
                        >
                          <div style={{ ...kpiLabelStyle, color: "#00330f" }}>Overall Total</div>
                          <Typography.Title level={3} style={{ ...kpiValueStyle, color: "#000" }}>
                            {Math.round(total).toLocaleString()}
                            <span style={unitStyle}>kg</span>
                          </Typography.Title>
                        </div>
                      </Col>
                    </Row>

                    <div style={{ height: 8 }} />

                    <Row gutter={[16, 16]} justify="center">
                      <Col xs={24} sm={24} md={22}>
                        <Progress
                          percent={achievementPercent}
                          status="active"
                          strokeColor={{ from: "#ff1818ff", to: "#52c41a" }}
                          trailColor="rgba(255,255,255,0.12)"
                          strokeWidth={14}
                          style={{
                            marginTop: 6,
                            borderRadius: 10,
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
                          }}
                          format={(percent) => (
                            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: 0.4 }}>
                              {percent}%
                            </span>
                          )}
                        />
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]} justify="end" style={{ marginTop: 10 }}>
                      <Button
                        type="primary"
                        style={{
                          borderRadius: 10,
                          boxShadow: "0 6px 16px rgba(71,163,255,0.35)",
                        }}
                        onClick={() => exportToPDFOfficer(routeSummary, officer, key)}
                      >
                        Download
                      </Button>
                    </Row>
                  </Card>
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