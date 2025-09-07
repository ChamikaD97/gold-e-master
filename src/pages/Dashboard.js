import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Input, Button, message, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import icon from "../images/logo.ico";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import Clock from "../components/dashboardCards/Clock";
import { API_KEY, fetchLines, fetchOfficers, login } from "../api/api";
import { setAllLines, setOfficers } from "../redux/officerLineSlice";
import dayjs from "dayjs";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { toast } from "react-toastify";
import { Spin, Tooltip } from "antd"; // (top of file)

const { Text, Title } = Typography;

const cardStyle = {
  background: "rgba(0, 0, 0, 0.8)",
  color: "#fff",
  borderRadius: 12,
  marginBottom: 16,
};


const Dashboard = () => {
  const dispatch = useDispatch();
  const lines = useSelector((state) => state.officerLine.allLines);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Fetch lines from backend
  const getLines = async () => {
    try {
      const data = await fetchLines();
      dispatch(setAllLines(data));
    } catch (err) {
      message.error("Failed to fetch lines");
      console.error(err);
    } finally {
      getLeafRecordsByDates();
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
  const pct = (part, whole) => {
    const p = Number(part ?? 0), w = Number(whole ?? 0);
    return w > 0 ? ((p / w) * 100).toFixed(1) : "0.0";
  };
  useEffect(() => {
    getOfficers();
    getLines();
    getLeafRecordsByDates();
  }, []);

  useEffect(() => {
    if (lines.length === 0) {
      message.warning("No lines available. Please add lines to continue.");
    } else {
      message.success("Lines fetched successfully.");
    }
  }, [lines]);

  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ super: 0, normal: 0 });

  const getLeafRecordsByDates = async (linesArg) => {
    // Prefer lines passed in (fresh from API); else use Redux state
    console.log(linesArg);
       const data = await fetchLines();
    const allLines = linesArg && linesArg.length ? linesArg : data;

    // If no lines, reset UI and exit
    if (!allLines || allLines.length === 0) {
      console.log("no lines");
      
      setTotals({ super: 0, normal: 0 });
      setData([]);
      setYesterdayData([]);
      setYTotals({ super: 0, normal: 0 });
      return;
    }

    const year = currentYear;
    const month = currentMonth;

    const startOfMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");

    // Month-to-date (1st → yesterday) only if yesterday is in the same month/year
    const mtdValid =
      yesterday.isSame(startOfMonth, "month") && yesterday.isSame(startOfMonth, "year");

    const ddMTD = mtdValid
      ? `${startOfMonth.format("YYYY-MM-DD")}~${yesterday.format("YYYY-MM-DD")}`
      : null;

    // Yesterday-only range (always)
    const ddY = `${yesterday.format("YYYY-MM-DD")}~${yesterday.format("YYYY-MM-DD")}`;

    // Flatten all line IDs to CSV (helper must exist in scope)
    const r = getAllLineIdsCSV(allLines);

    if (!r) {
      console.log(allLines);
      
      setTotals({ super: 0, normal: 0 });
      setData([]);
       console.log("no lines");
      setYesterdayData([]);
      setYTotals({ super: 0, normal: 0 });
      return;
    }

    const urlFor = (dd) =>
      `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${encodeURIComponent(r)}&d=${dd}`;

    dispatch(showLoader());
    setData([]);
    setYesterdayData([]);
    setYTotals({ super: 0, normal: 0 });

    try {
      // Fetch both in parallel (skip MTD if not valid)
      const [resY, resMTD] = await Promise.all([
        fetch(urlFor(ddY)),
        ddMTD ? fetch(urlFor(ddMTD)) : Promise.resolve(null),
      ]);

      if (!resY?.ok) throw new Error("Failed to fetch yesterday records");
      const rawY = await resY.json();

      const rawMTD = resMTD ? (resMTD.ok ? await resMTD.json() : []) : [];

      const mapRows = (rows) =>
        (rows ?? []).map((item) => ({
          supplier_id: item["Supplier Id"],
          date: dayjs(item["Leaf Date"]).format("YYYY-MM-DD"),
          leaf_type: Number(item["Leaf Type"]) === 2 ? "Super" : "Normal",
          lineCode: parseInt(item["Route"], 10),
          net_kg: parseFloat(item["Net"]),
        }));

      const yRows = mapRows(rawY);
      const mtdRows = mapRows(rawMTD);

      // Yesterday dataset + totals
      setYesterdayData(yRows);
      const totalsY = yRows.reduce(
        (acc, r) => {
          if (r.leaf_type === "Super") acc.super += r.net_kg;
          else acc.normal += r.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );
      setYTotals(totalsY);

      // MTD totals (1st → yesterday) for current month; else zeros
      const totalsMTD = mtdRows.reduce(
        (acc, r) => {
          if (r.leaf_type === "Super") acc.super += r.net_kg;
          else acc.normal += r.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );
      setTotals(totalsMTD);

      // Keep MTD rows if needed elsewhere (optional)
      setData(mtdRows);
    } catch (err) {
      console.error(err);
      toast.error("Error While Loading Data, Please Try Again");
      setTotals({ super: 0, normal: 0 });
      setData([]);
      setYesterdayData([]);
      setYTotals({ super: 0, normal: 0 });
    } finally {
      dispatch(hideLoader());
    }
  };


  // add states (below your existing data/totals)
  const [yesterdayData, setYesterdayData] = useState([]);
  const [yTotals, setYTotals] = useState({ super: 0, normal: 0 });

  // helper to flatten all line IDs to CSV
  const getAllLineIdsCSV = (arr) =>
    [...new Set(
      (arr ?? []).flatMap(l =>
        String(l.lineId)
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      )
    )]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b)
      .join(",");

  const fmtKg = (n) =>
    Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (
    <div style={{ padding: 10 }}>
      {/* Logo Header */}
      <Card bordered={false} style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }} className="fade-in">
          <img
            src={icon}
            alt="SLMS"
            style={{
              width: 120, height: 120, borderRadius: "50%", border: "1px solid white", border: "2px solid white",
              boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            }}
          />




          <div>

            <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
              SUPER LEAF MONITORING SYSTEM
            </div>
            <div style={{ fontSize: 16, color: "#ccc" }}>GREENHOUSE PLANTATION (PVT) LTD</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Clock />
          </div>
        </div>

      </Card><Row gutter={[16, 16]} justify="space-between" style={{ marginTop: 10, marginBottom: 10 }}>
        {/* MTD */}
        <Col xs={24} sm={12} md={12}>
          <Card bordered={false} style={cardStyle}>
            <Title level={4} style={{ color: "#fff", margin: 0 }}>
              Month To Date ({dayjs().subtract(1, "day").format("YYYY/MM/DD")})
            </Title>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", gap: 16, flexWrap: "wrap" }} className="fade-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 12 }}>
                {(() => {
                  const mtdSuper = Number(totals?.super ?? 0);
                  const mtdNormal = Number(totals?.normal ?? 0);
                  const mtdTotal = mtdSuper + mtdNormal;

                  return (
                    <>
                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#ff9800", fontSize: 16 }}>Super Leaf</Text>
                        <Title level={3} style={{ color: "#ff9800", margin: 0 }}>{fmtKg(mtdSuper)} kg</Title>


                      </div>
                              <Divider type="vertical" style={{ height: 75, borderInlineColor: "rgba(255,255,255,0.25)" }} />

                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#47a3ff", fontSize: 16 }}>Normal Leaf</Text>
                        <Title level={3} style={{ color: "#47a3ff", margin: 0 }}>{fmtKg(mtdNormal)} kg</Title>

                      </div>
                              <Divider type="vertical" style={{ height: 75, borderInlineColor: "rgba(255,255,255,0.25)" }} />

                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#4caf50", fontSize: 16 }}>Total Collected</Text>
                        <Title level={3} style={{ color: "#4caf50", margin: 0 }}>{fmtKg(mtdTotal)} kg</Title>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

          </Card>
        </Col>

        {/* Yesterday */}
        <Col xs={24} sm={12} md={12}>
          <Card bordered={false} style={cardStyle}>

            <Title level={4} style={{ color: "#fff", margin: 0 }}>
              Leaf Collected Yesterday - {dayjs().subtract(1, "day").format("YYYY/MM/DD")}

            </Title>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", gap: 16, flexWrap: "wrap" }} className="fade-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 12 }}>
                {(() => {
                  const ySuper = Number(yTotals?.super ?? 0);
                  const yNormal = Number(yTotals?.normal ?? 0);
                  const yTotal = ySuper + yNormal;

                  return (
                    <>
                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#ff9800", fontSize: 16 }}>Super Leaf</Text>
                        <Title level={3} style={{ color: "#ff9800", margin: 0 }}>{fmtKg(ySuper)} kg</Title>


                      </div>
                              <Divider type="vertical" style={{ height: 75, borderInlineColor: "rgba(255,255,255,0.25)" }} />

                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#47a3ff", fontSize: 16 }}>Normal Leaf</Text>
                        <Title level={3} style={{ color: "#47a3ff", margin: 0 }}>{fmtKg(yNormal)} kg</Title>


                      </div>
                              <Divider type="vertical" style={{ height: 75, borderInlineColor: "rgba(255,255,255,0.25)" }} />

                      <div style={{ textAlign: "center", margin: 10 }}>
                        <Text style={{ color: "#4caf50", fontSize: 16 }}>Total Collected</Text>
                        <Title level={3} style={{ color: "#4caf50", margin: 0 }}>{fmtKg(yTotal)} kg</Title>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

          </Card>
        </Col>
      </Row>




    </div>
  );
};

export default Dashboard;
