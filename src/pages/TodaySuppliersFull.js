import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select,
  Typography
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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
import { Space } from "antd";

const TodaySuppliers = () => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const leafRound = useSelector((state) => state.commonData?.leafRound);

  const dateRangeYears = useSelector((state) => state.commonData?.dateRangeYears);
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
  const [progressVisible, setProgressVisible] = useState(false);


  const [isCancel, setIsCancel] = useState(false);





  const { Title, Text } = Typography

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cancelDownload, setCancelDownload] = useState(false);
  const [processingLine, setProcessingLine] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const downloadAllLeafReports = async (day) => {
    setProgressVisible(true)
    setCancelDownload(false);
    setIsDownloading(true);

    const uniqueLines = lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, id: l.lineId, officer: l.officer }));

    const total = uniqueLines.length;
    setTotalLines(total);


    const startDate = day.subtract(leafRound, "day").format("YYYY-MM-DD");

    for (let i = 0; i < total; i++) {
      console.log(i);

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



        // ➤ Suppliers who did supply
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

        // ➤ Suppliers who did NOT supply
        const withoutData = allSuppliers.filter(
          sup => !supplierIdsWithData.includes(sup["Supplier Id"])
        );

        // Fetch last record for each missing supplier
        let glfHistory = [];
        try {
          const dateRange = `${dayjs().subtract(dateRangeYears, 'year').format("YYYY-MM-DD")}~${dayjs().subtract(leafRound, 'days').format("YYYY-MM-DD")}`;
          const glfHistoryRes = await fetch(`/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${line.id}&d=${dateRange}`);
          glfHistory = await glfHistoryRes.json();
        } catch (e) {
          console.warn("Failed to fetch GLF history for missing suppliers", e);
        }

        const latestSupplyMap = {};
        glfHistory.forEach(entry => {
          const sid = entry["Supplier Id"];
          const date = entry["Leaf Date"];
          const net = parseFloat(entry["Net"] || 0);

          if (!latestSupplyMap[sid] || new Date(date) > new Date(latestSupplyMap[sid].lastDate)) {
            latestSupplyMap[sid] = {
              lastDate: date,
              total_kg: net
            };
          } else {
            latestSupplyMap[sid].total_kg += net;
          }
        });

        const enrichedWithoutData = withoutData
          .filter(sup => {
            const sid = sup["Supplier Id"];
            const lastInfo = latestSupplyMap[sid];
            return !!lastInfo?.lastDate; // only include if lastDate exists
          })
          .map(sup => {
            const sid = sup["Supplier Id"];
            const lastInfo = latestSupplyMap[sid];
            const lastDate = lastInfo?.lastDate;

            let inactiveFor = "-";
            if (lastDate) {
              const last = dayjs(lastDate);
              const now = dayjs();
              const years = now.diff(last, "year");
              const months = now.diff(last.add(years, "year"), "month");
              const days = now.diff(last.add(years, "year").add(months, "month"), "day");

              const parts = [];
              if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
              if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
              if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
              inactiveFor = parts.join(" ") || "0 days";
            }

            return {
              id: sid,
              name: sup["Supplier Name"],
              address: sup["Address"],
              tel: sup["Contact"],
              lastDate,
              total_kg: lastInfo?.total_kg || 0,
              inactiveFor,
            };
          });





        // 🔽 Export complete list
        if (withData.length > 0) {
          downloadXSupplierListAsPDFAuto(line.label, withData, enrichedWithoutData, startDate, line.officer);
        }


      } catch (err) {
        console.error(`Error processing line ${line.label}:`, err);
      }
    }

    setProcessingLine(null);
    setIsDownloading(false);
    setProgressVisible(false)
    setProgressPercent(0);
    dispatch(hideLoader());
  };



 const downloadXSupplierListAsPDFAuto = (lineCode, todaySuppliers, missingSuppliers, day, officer) => {
  const doc = new jsPDF("p", "mm", "a4");
  const todayStr = dayjs().format("YYYY-MM-DD");

  // === HEADER ===
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.line(14, 20, 196, 20);
  doc.setFont(undefined, 'bold');
  doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 28, { align: "center" });

  doc.setFontSize(9);
  doc.line(14, 32, 196, 32);
  doc.setFont(undefined, 'normal');
  doc.text("Factory: Panakaduwa, No: 40, Rotumba, Bandaranayakapura", 14, 38);
  doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 43);

  doc.setFontSize(11);
  doc.line(14, 47, 196, 47);
  doc.text("Daily Leaf Supply Summary", 14, 52);

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Mr. ${officer}   -   ${lineCode} Line`, 14, 61);

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Report Generated: ${todayStr}`, 14, 68);
  doc.line(14, 71, 196, 71);

  // === TODAY SUPPLIERS TABLE ===
  const todayHead = [["#", "Supplier ID", "Name", "Contact", "Last Supply", "Total Leaf", "Informed"]];
  const todayTable = todaySuppliers.map(s => [
    s.id,
    s.name,
    s.tel || "-",
    s.lastDate ? dayjs(s.lastDate).format("YYYY-MM-DD") : "-",
    `${Math.round(s.total_kg || 0)} kg`,
    ' '
  ]);
  const todayTableBody = todayTable.map((row, i) => [i + 1, ...row]);

  const todayTotalLeaf = todaySuppliers.reduce((sum, s) => sum + (s.total_kg || 0), 0);
  todayTableBody.push([
    "",
    { content: "Total", colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: `${Math.round(todayTotalLeaf)} kg`, styles: { fontStyle: 'bold' } },
    ''
  ]);

  doc.autoTable({
    startY: 75,
    head: todayHead,
    body: todayTableBody,
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
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // === MISSING SUPPLIERS TABLE ===
  if (missingSuppliers.length > 0) {
    doc.addPage();

    const sortedMissing = [...missingSuppliers].sort((b, a) => {
      const getInactiveDays = (str) => {
        if (!str || str === "-") return 0;
        const years = parseInt((str.match(/(\d+)\s*year[s]?/) || [])[1] || 0);
        const months = parseInt((str.match(/(\d+)\s*month[s]?/) || [])[1] || 0);
        const days = parseInt((str.match(/(\d+)\s*day[s]?/) || [])[1] || 0);
        return (years * 365) + (months * 30) + days;
      };
      return getInactiveDays(b.inactiveFor) - getInactiveDays(a.inactiveFor);
    });

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`Suppliers with Last Supply Record Within ${dateRangeYears} Year`, 14, 25);
    doc.line(14, 28, 196, 28);

    const missingHead = [["#", "Supplier ID", "Name", "Contact", "Last Supply", "Total Leaf", "Inactive For"]];
    const missingTable = sortedMissing.map(s => [
      s.id,
      s.name,
      s.tel || "-",
      s.lastDate !== "-" ? dayjs(s.lastDate).format("YYYY-MM-DD") : "-",
      `${Math.round(s.total_kg || 0)} kg`,
      s.inactiveFor || "-"
    ]);
    const missingTableBody = missingTable.map((row, i) => [i + 1, ...row]);

    const missingTotalLeaf = sortedMissing.reduce((sum, s) => sum + (s.total_kg || 0), 0);
    missingTableBody.push([
      "",
      { content: "Total", colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${Math.round(missingTotalLeaf)} kg`, styles: { fontStyle: 'bold' } }
    ]);

    doc.autoTable({
      startY: 32,
      head: missingHead,
      body: missingTableBody,
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
      alternateRowStyles: { fillColor: [255, 250, 240] }
    });
  }

  // === FOOTER ===
  const lastPage = doc.internal.getNumberOfPages();
  doc.setPage(lastPage);
  doc.line(14, 275, 196, 275);
  doc.setFontSize(8);
  doc.setFont("helvetica");
  doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
  doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

  doc.save(`Mr. ${officer}  ${lineCode}_leaf_report_${day}.pdf`);
};





  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 16
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
        <Row gutter={[16, 16]} align="middle">

          <Col md={1}>
            <Button
              icon={<ReloadOutlined />}
              danger
              type="primary"
              block

              onClick={() => {
                setFilters({ line: "All" });
                setSupplierWithDataList([]);
                setProgressVisible(false)
              }}
            />
          </Col>

          <Col md={7} style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ fontSize: 15, color: "#fff" }}>
              Download All Suppliers That Need To Supply Leaf
            </div>
          </Col>

          <Col md={3}>
            <Button type="primary" block onClick={() => downloadAllLeafReports(dayjs())}>
              Today
            </Button>
          </Col>

          <Col md={3}>
            <Button type="primary" block onClick={() => downloadAllLeafReports(dayjs().add(1, 'day'))}>
              Tomorrow
            </Button>
          </Col>

          {/* Spacer to visually separate the button groups */}
          <Col md={1}>
            {/* Optional visual separator */}
          </Col>

          {/* Last 3 buttons with different color */}
          {[2, 3, 4].map((offset) => (
            <Col md={3} key={offset}>
              <Button
                block
                style={{
                  background: "rgb(168, 143, 0)",

                  color: "#000",
                  border: "none"
                }}
                onClick={() => downloadAllLeafReports(dayjs().add(offset, 'day'))}
              >
                {dayjs().add(offset, 'day').format('Do')} of {dayjs().add(offset, 'day').format('MMMM')}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {isLoading && <CircularLoader />}




      {progressVisible && (
        <Card
          bordered={false}
          style={{
            ...cardStyle,

          }}
        >
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={4}>
                <Text style={{ color: "#ccc", fontSize: 14 }}>Processing Line</Text>
                <Title level={4} style={{ margin: 0, color: "#fff" }}>
                  {processingLine || "—"}
                </Title>
              </Space>
            </Col>


            <Col>
              <Space direction="vertical" size={4}>
                <Title level={4} style={{ margin: 0, color: "#fff" }}>
                  {progressPercent}%
                </Title>

              </Space>
            </Col>
          </Row>

          <Progress
            percent={progressPercent}
            status={isPaused ? "normal" : "active"}
            strokeColor={{
              from: "#1890ff",
              to: "#52c41a",
            }}
            strokeWidth={14}
            style={{
              marginTop: 32,
              borderRadius: 8,
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          />

          <Row gutter={12} justify="end" style={{ marginTop: 15 }}>
            <Col>
              <Button
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
                style={{
                  minWidth: 100,
                  fontWeight: "500",
                  backgroundColor: "#ff4d4f",
                  borderColor: "#ff7875",
                }}
                onClick={() => setCancelDownload(true)}
              >
                Stop
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





          </>
        )

      }

    </div>
  );
};

export default TodaySuppliers;