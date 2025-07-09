import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select,
  Typography, DatePicker, Table
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import { Modal, Progress } from "antd";

import lineIdCodeMapForAll from "../data/lineIdCodeMapForAll.json";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import dayjs from "dayjs";
import { API_KEY } from "../api/api";
import '../App.css';
import CountUp from "react-countup";
import jsPDF from "jspdf";
import CircularLoader from "../components/CircularLoader";

const TodaySuppliers = () => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const leafRound = useSelector((state) => state.commonData?.leafRound);

  const [filters, setFilters] = useState({ line: "All" });
  const [supplierWithDataList, setSupplierWithDataList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [isToday, setIsToday] = useState(true);
  const [supplierLength, setSuppliersLength] = useState([]);

  const [totals, setTotals] = useState({ super: 0, normal: 0, total: 0 });

  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];
  const { isLoading } = useSelector((state) => state.loader);
  const [progressVisible, setProgressVisible] = useState(true);


  const [isCancel, setIsCancel] = useState(false);







  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cancelDownload, setCancelDownload] = useState(false);
  const [processingLine, setProcessingLine] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const downloadAllLeafReports = async () => {
    setCancelDownload(false);
    setIsDownloading(true);

    const uniqueLines = lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, id: l.lineId }));

    const total = uniqueLines.length;
    setTotalLines(total);

    const today = dayjs();
    const startDate = today.subtract(leafRound, "day").format("YYYY-MM-DD");

    for (let i = 0; i < total; i++) {
      setCurrentIndex(i);

      if (cancelDownload) {
        setIsDownloading(false);
        console.warn("Download cancelled by user.");
        break;
      }

      while (isPaused) {
        await new Promise(res => setTimeout(res, 300));
      }

      const line = uniqueLines[i];
      setProcessingLine(line.label);
      setProgressPercent(Math.round(((i + 1) / total) * 100));

      try {
        const leafDataUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${line.id}&d=${startDate}`;
        const response = await fetch(leafDataUrl);
        if (!response.ok) continue;

        const leafResult = await response.json();
        if (!Array.isArray(leafResult) || leafResult.length === 0) continue;

        const leafMap = {};
        for (const item of leafResult) {
          const supId = item["Supplier Id"];
          const net = parseFloat(item["Net"] || 0);
          const isSuper = item["Leaf Type"] === 2;

          if (!leafMap[supId]) {
            leafMap[supId] = {
              super_kg: 0,
              normal_kg: 0,
              lastDate: item["Leaf Date"]
            };
          }

          if (isSuper) leafMap[supId].super_kg += net;
          else leafMap[supId].normal_kg += net;

          leafMap[supId].total_kg = leafMap[supId].super_kg + leafMap[supId].normal_kg;

          const current = dayjs(item["Leaf Date"]);
          const existing = dayjs(leafMap[supId].lastDate);
          if (current.isAfter(existing)) {
            leafMap[supId].lastDate = item["Leaf Date"];
          }
        }

        const supplierIdsWithData = Object.keys(leafMap);
        if (supplierIdsWithData.length === 0) continue;

        const supRes = await fetch(`/quiX/ControllerV1/supdata?k=${API_KEY}&r=${line.id}`);
        if (!supRes.ok) continue;

        const allSuppliers = await supRes.json();

        const withData = allSuppliers
          .filter(sup => supplierIdsWithData.includes(sup["Supplier Id"]))
          .map(sup => ({
            id: sup["Supplier Id"],
            name: sup["Supplier Name"],
            address: sup["Address"],
            tel: sup["Contact"],
            lastDate: leafMap[sup["Supplier Id"]].lastDate,
            total_kg: leafMap[sup["Supplier Id"]].total_kg,
          }));

        if (withData.length > 0) {
          // downloadXSupplierListAsPDFAuto(line.label, withData);
        }
      } catch (err) {
        console.error(`Error processing line ${line.label}:`, err);
      }
    }

    setProcessingLine(null);
    setIsDownloading(false);
    setProgressPercent(0);
    dispatch(hideLoader());
  };


  const downloadXSupplierListAsPDFAuto = (lineCode, supplierWithDataList) => {
    console.log(lineCode);

    const doc = new jsPDF("p", "mm", "a4");
    const today = dayjs().format("YYYY-MM-DD");

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
    doc.text("Daily Leaf Supply Summary", 14, 52);
    doc.text(`${lineCode} Line Suppliers that need to Supply Leaf`, 14, 58);
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${today}    |    Line: ${lineCode}`, 14, 63);
    doc.line(14, 66, 196, 66);

    const tableData = supplierWithDataList.map((s, i) => [
      s.id,
      s.name,
      s.tel || "-",
      s.lastDate ? dayjs(s.lastDate).format("YYYY-MM-DD") : "",
      `${Math.round(s.total_kg || 0)} kg`,
      " ",
    ]);
    const numberedTableData = tableData.map((row, index) => [index + 1, ...row]);

    const totalLeaf = tableData.reduce((sum, row) => sum + parseFloat(row[4]) || 0, 0);

    const finalRow = [
      { content: "Total", colSpan: 5, styles: { halign: "right", fontStyle: "bold" } },
      { content: totalLeaf.toFixed(2), styles: { fontStyle: "bold" } },
      { content: "", styles: {} },
    ];
    numberedTableData.push(finalRow);

    doc.autoTable({
      startY: 72,
      head: [["#", "Supplier ID", "Name", "Contact", "Last Supply", "Total Leaf", "Availability"]],
      body: numberedTableData,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const lastPage = doc.internal.getNumberOfPages();
    doc.setPage(lastPage);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    const fileName = `${lineCode}_line_leaf_supply.pdf${today}`;
    doc.save(fileName);
  };



  const downloadXSupplierListAsPDF = () => {

    const doc = new jsPDF("p", "mm", "a4");
    const today = dayjs().format("YYYY-MM-DD");

    // Find readable line label
    const selectedLine = filters.line === "All"
      ? "All"
      : lineIdCodeMap.find(l => l.lineId === filters.line)?.lineCode || filters.line;

    const selectedDateFormatted = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "-";

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
    doc.text("Daily Leaf Supply Summary", 14, 52);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${selectedLine} Line Suppliers that need to Supply Leaf`, 14, 58);
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${today}    |    Line: ${selectedLine}`, 14, 63);

    doc.setDrawColor(0);
    doc.line(14, 66, 196, 66);

    // Prepare Table Data
    const tableData = supplierWithDataList.map((s, i) => [
      s.id,
      s.name,
      s.tel || "-",
      s.lastDate ? dayjs(s.lastDate).format("YYYY-MM-DD") : "",
      `${Math.round(s.total_kg || 0)} kg`,
      " ",  // Informed

    ]);
    // Add row numbers to each row in tableData
    const numberedTableData = tableData.map((row, index) => [index + 1, ...row]);

    // Calculate the total (example: summing "Total Leaf" column, which is index 5 in the row)
    const totalLeaf = tableData.reduce((sum, row) => sum + parseFloat(row[4] || 0), 0);

    // Add final total row (colSpan used to merge first 5 columns)
    const finalRow = [
      { content: "Total", colSpan: 5, styles: { halign: "right", fontStyle: "bold" } },
      { content: totalLeaf.toFixed(2), styles: { fontStyle: "bold" } },
      { content: "", styles: {} }, // empty last cell ("Availability")
    ];

    // Append the final row to the body
    numberedTableData.push(finalRow);

    doc.autoTable({
      startY: 72,
      head: [["#", "Supplier ID", "Name", "Contact", "Last Supply", "Total Leaf", "Availability"]],
      body: numberedTableData,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });



    // Total Summary
    const totalKG = supplierWithDataList.reduce((sum, s) => sum + (s.total_kg || 0), 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");



    // ✅ Add footer and summary ONLY on the last page
    const lastPage = doc.internal.getNumberOfPages();
    doc.setPage(lastPage);

    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);





    // Save
    const fileName = `${selectedLine}_line_leaf_supply.pdf`;
    doc.save(fileName);
    //setFilters({ line: "All" });
    //setSupplierWithDataList([]);
  };


  const getTodaySuppliers = async () => {
    if (!leafRound || isNaN(leafRound)) {
      return;
    }
    dispatch(showLoader());


    try {


      const uniqueLines = [
        { label: "All", value: "All" },
        ...lineIdCodeMap
          .filter(l => l.lineCode && l.lineId)
          .map(l => ({ label: l.lineCode, value: l.lineId }))
      ];
      console.log(uniqueLines);

      console.log(filters);

      const today = dayjs();
      const startDate = today.subtract(leafRound, "day").format("YYYY-MM-DD");
      const dateRange = `${startDate}`;
      const lineId = filters.line;
      setSelectedDate(startDate)
      setIsToday(true)
      // 1. Fetch leaf records
      const leafDataUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${lineId}&d=${dateRange}`;
      const response = await fetch(leafDataUrl);

      if (!response.ok) throw new Error("Failed to fetch leaf records");
      const result = await response.json();
      console.log(result);

      // 2. Group by supplier and calculate total super/normal
      const leafMap = {};
      result.forEach(item => {
        const supId = item["Supplier Id"];
        const net = parseFloat(item["Net"] || 0);
        const isSuper = item["Leaf Type"] === 2;

        if (!leafMap[supId]) {
          leafMap[supId] = {
            super_kg: 0,
            normal_kg: 0,
            lastDate: item["Leaf Date"]
          };
        }

        if (isSuper) {
          leafMap[supId].super_kg += net;
        } else {
          leafMap[supId].normal_kg += net;
        }
        leafMap[supId].total_kg = (leafMap[supId].super_kg || 0) + (leafMap[supId].normal_kg || 0);
        // Update latest date if newer
        const current = dayjs(item["Leaf Date"]);
        const existing = dayjs(leafMap[supId].lastDate);
        if (current.isAfter(existing)) {
          leafMap[supId].lastDate = item["Leaf Date"];
        }
      });

      const supplierIdsWithData = Object.keys(leafMap);

      // 3. Fetch all suppliers
      const allSuppliersUrl = `/quiX/ControllerV1/supdata?k=${API_KEY}&r=${lineId}`;
      const allResponse = await fetch(allSuppliersUrl);
      if (!allResponse.ok) throw new Error("Failed to fetch supplier list");

      const allSuppliersData = await allResponse.json();
      const allSuppliers = allSuppliersData.map(sup => ({
        id: sup["Supplier Id"],
        name: sup["Supplier Name"],
        address: sup["Address"],
        tel: sup["Contact"],
        lineCode: filters.lineCode || ""
      }));
      setSuppliersLength(allSuppliers.length)

      // 4. Filter and combine leaf data
      const withData = allSuppliers
        .filter(sup => supplierIdsWithData.includes(sup.id))
        .map(sup => ({
          ...sup,
          ...leafMap[sup.id]  // merge super_kg, normal_kg, lastDate
        }));

      console.log("Suppliers with Leaf Data:", withData);
      setSupplierWithDataList(withData);
      // 5. Calculate overall totals
      let totalSuper = 0;
      let totalNormal = 0;

      withData.forEach(sup => {
        totalSuper += sup.super_kg || 0;
        totalNormal += sup.normal_kg || 0;
      });

      const total = totalSuper + totalNormal;

      console.log("TOTALS => Super:", totalSuper, "Normal:", totalNormal, "Total:", total);

      // Optionally set state for UI display
      setTotals({
        super: totalSuper,
        normal: totalNormal,
        total: total
      });

    } catch (err) {
      console.error("Error fetching today suppliers:", err);
    } finally {

      dispatch(hideLoader());
    }
  };

  const getTommorowSuppliers = async () => {
    if (!leafRound || isNaN(leafRound)) {
      return;
    }
    dispatch(showLoader());
    try {
      const tomorrow = dayjs().add(1, "day"); // move to tomorrow
      const startDate = tomorrow.subtract(leafRound, "day").format("YYYY-MM-DD");
      const dateRange = `${startDate}`;
      const lineId = filters.line;
      setSelectedDate(startDate)
      // 1. Fetch leaf records
      setIsToday(false)
      const leafDataUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${lineId}&d=${dateRange}`;
      const response = await fetch(leafDataUrl);

      if (!response.ok) throw new Error("Failed to fetch leaf records");
      const result = await response.json();
      console.log(result);

      // 2. Group by supplier and calculate total super/normal
      const leafMap = {};
      result.forEach(item => {
        const supId = item["Supplier Id"];
        const net = parseFloat(item["Net"] || 0);
        const isSuper = item["Leaf Type"] === 2;

        if (!leafMap[supId]) {
          leafMap[supId] = {
            super_kg: 0,
            normal_kg: 0,
            lastDate: item["Leaf Date"]
          };
        }

        if (isSuper) {
          leafMap[supId].super_kg += net;
        } else {
          leafMap[supId].normal_kg += net;
        }
        leafMap[supId].total_kg = (leafMap[supId].super_kg || 0) + (leafMap[supId].normal_kg || 0);
        // Update latest date if newer
        const current = dayjs(item["Leaf Date"]);
        const existing = dayjs(leafMap[supId].lastDate);
        if (current.isAfter(existing)) {
          leafMap[supId].lastDate = item["Leaf Date"];
        }
      });

      const supplierIdsWithData = Object.keys(leafMap);

      // 3. Fetch all suppliers
      const allSuppliersUrl = `/quiX/ControllerV1/supdata?k=${API_KEY}&r=${lineId}`;
      const allResponse = await fetch(allSuppliersUrl);
      if (!allResponse.ok) throw new Error("Failed to fetch supplier list");

      const allSuppliersData = await allResponse.json();
      const allSuppliers = allSuppliersData.map(sup => ({
        id: sup["Supplier Id"],
        name: sup["Supplier Name"],
        address: sup["Address"],
        tel: sup["Contact"],
        lineCode: filters.lineCode || ""
      }));

      // 4. Filter and combine leaf data
      const withData = allSuppliers
        .filter(sup => supplierIdsWithData.includes(sup.id))
        .map(sup => ({
          ...sup,
          ...leafMap[sup.id]  // merge super_kg, normal_kg, lastDate
        }));

      console.log("Suppliers with Leaf Data:", withData);
      setSupplierWithDataList(withData);
      // 5. Calculate overall totals
      let totalSuper = 0;
      let totalNormal = 0;

      withData.forEach(sup => {
        totalSuper += sup.super_kg || 0;
        totalNormal += sup.normal_kg || 0;
      });

      const total = totalSuper + totalNormal;

      console.log("TOTALS => Super:", totalSuper, "Normal:", totalNormal, "Total:", total);

      // Optionally set state for UI display
      setTotals({
        super: totalSuper,
        normal: totalNormal,
        total: total
      });

    } catch (err) {
      console.error("Error fetching today suppliers:", err);
    } finally {
      dispatch(hideLoader());
    }
  };


  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 16
  };




  const cardStyles = {
    background: "rgba(0, 0, 0, 0.82)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };
  const columns = [
    {
      title: "Supplier ID",
      dataIndex: "id",
      key: "id",
      width: 100,
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
      title: "Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Contact",
      dataIndex: "tel",
      key: "tel"
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
            background: "linear-gradient(135deg, #C6F6D5,#00ff37)",
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


  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>


      <Card bordered={false} style={cardStyle}>
        <Row gutter={[16, 16]}>
          <Col md={2}>
            <Button
              icon={<ReloadOutlined />}
              danger
              type="primary"
              block
              onClick={() => {
                setFilters({ line: "All" });

                setSupplierWithDataList([]);
              }}
            />
          </Col>
          <Col md={4}>
            <Select
              showSearch
              className="line-select"
              placeholder="Select Line"
              value={filters.line}
              onChange={val => setFilters(prev => ({ ...prev, line: val }))}
              style={{
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 6
              }}
              dropdownStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
              bordered={false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {uniqueLines.map(line => (
                <Option key={line.value} value={line.value}>{line.label}</Option>
              ))}
            </Select>
          </Col>

          <Col md={4}>
            <Button type="primary" block onClick={getTodaySuppliers}>
              Today
            </Button>
          </Col>
          <Col md={4}>
            <Button type="primary" block onClick={getTommorowSuppliers}>
              Tommorow
            </Button>
          </Col>
          <Col md={4}>
            <Button type="primary" block onClick={downloadXSupplierListAsPDF}>
              Download {isToday ? "Today" : "Tommorow"} Suppliers
            </Button>
          </Col>
          <Col md={4}>
            <Button type="primary" block onClick={downloadAllLeafReports}>
              Download All Suppliers
            </Button>
          </Col>

        </Row>


      </Card>
      {isLoading && <CircularLoader />}
      {progressVisible && (

        <Card bordered={false} style={cardStyle}>
          <Row gutter={[16, 16]} justify="space-between">
            <Col>
              <div style={{ color: "#fff", fontWeight: 500 }}>
                <div>Processing Line</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                  {processingLine || "..."}
                </div>
              </div>
            </Col>


            <Col>
              <div style={{ color: "#fff", fontWeight: 500 }}>
                <div> Progress</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                  {progressPercent} %
                </div>
              </div>
            </Col>
          </Row>

          <Progress
            percent={progressPercent}
            status={isPaused ? "normal" : "active"}
            strokeColor={{
              from: "#108ee9",
              to: "#87d068",
            }}
            strokeWidth={14}
            trailColor="#f5f5f5"
            style={{
              marginTop: 24,
              borderRadius: 8,
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          />

          <Row gutter={12} justify="end" style={{ marginTop: 24 }}>
            <Col>
              <Button
                type="default"
                onClick={() => setIsPaused((prev) => !prev)}
                style={{
                  minWidth: 100,
                  fontWeight: "500",
                  backgroundColor: isPaused ? "#ffc107" : "#e6f7ff",
                  color: isPaused ? "#000" : "#1890ff",
                  borderColor: isPaused ? "#ffc107" : "#91d5ff",
                }}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                danger
                style={{ minWidth: 100, fontWeight: "500" }}
                onClick={() => setCancelDownload(true)}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Card>


      )}
      {

        !isLoading && (
          <>
            {supplierWithDataList.length && (

              <Card bordered={false} style={cardStyle}>
                <Row gutter={[16, 16]} justify="space-between">
                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Selected Line</div>
                      <div style={{ fontSize: 18, fontWeight: "bold" }}>
                        {filters.line === "All" ? "All Lines" : uniqueLines.find(l => l.value === filters.line)?.label || filters.line}
                      </div>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Last Day That Collected</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#ffa500" }}>
                        {dayjs(selectedDate).format("YYYY-MM-DD")}
                      </div>
                    </div>
                  </Col>

                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Total Leaf On That Day</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#00ff37" }}>
                        <CountUp end={Math.round(totals.total)} duration={1.2} separator="," /> kg
                      </div>
                    </div>
                  </Col>
                  {/* //selectedDate */}


                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Suppliers</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#ff000e" }}>
                        <CountUp end={supplierWithDataList.length} duration={1.2} separator="," />
                      </div>
                    </div>
                  </Col>

                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>All </div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#ff000e" }}>
                        <CountUp end={supplierLength} duration={1.2} separator="," />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {!supplierWithDataList.length && (

              <Card bordered={false} style={cardStyle}>
                <Row gutter={[16, 16]} justify="space-between">
                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Selected Line</div>
                      <div style={{ fontSize: 18, fontWeight: "bold" }}>
                        {filters.line === "All" ? "All Lines" : uniqueLines.find(l => l.value === filters.line)?.label || filters.line}
                      </div>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      <div>Last Day That Collected</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#ffa500" }}>
                        {dayjs(selectedDate).format("YYYY-MM-DD")}
                      </div>
                    </div>
                  </Col>

                  <Col>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>
                      <div>No any Suppliers</div>


                    </div>
                  </Col>





                </Row>
              </Card>
            )}

            {supplierWithDataList.length && (
              <Card bordered={false} style={cardStyle}>
                <Row gutter={16}>


                  <Col md={24}>

                    <Table
                      dataSource={supplierWithDataList}
                      columns={columns}
                      size="small"
                      pagination={{ pageSize: 8 }}
                      rowKey="id"
                      className="sup-bordered-table"
                      bordered
                    />
                  </Col>



                </Row>

              </Card>
            )}


          </>
        )

      }
      <>


      </>





    </div>
  );
};

export default TodaySuppliers;
