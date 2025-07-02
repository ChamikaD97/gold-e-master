import React, { useState } from "react";
import {
  Card, Col, Row, Select, Typography, Button, message
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY } from "../api/api";
import dayjs from "dayjs";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import CountUp from "react-countup";
import { ReloadOutlined } from "@ant-design/icons";
import { Search, SearchOff, SearchOffOutlined, SearchOffRounded, SearchRounded } from "@mui/icons-material";
import CircularLoader from "../components/CircularLoader";

const { Option } = Select;
const { Text } = Typography;

const LeafSupplyByDateRange = () => {
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const currentDay = today.getDate().toString().padStart(2, "0");

  const [filters, setFilters] = useState({
    fromYear: currentYear,
    fromMonth: currentMonth,
    fromDay: "01",
    toYear: currentYear,
    toMonth: currentMonth,
    toDay: currentDay,
    line: ""
  });

  const uniqueLines = [{ label: "All", value: "All" }, ...lineIdCodeMap.map(l => ({ label: l.lineCode, value: l.lineId, officer: l.officer }))];
  const officerLineMap = useSelector((state) => state.officerLine?.officerLineMap || {});

  const [lineWiseSummary, setLineWiseSummary] = useState([]);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ super: 0, normal: 0 });
  const dispatch = useDispatch();
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const { isLoading } = useSelector((state) => state.loader);

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
    border: "1px solid #333",
    padding: 5
  };

  const selectStyle = {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 6
  };

  const getLeafRecordsByDates = async (lineId, range) => {
    const id = lineId?.toString().padStart(5, "0").trim();
    const formattedDates = range.map(date => dayjs(date).format("YYYY-MM-DD"));
    const dd = `${formattedDates[0]}~${formattedDates[1]}`;
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${id}&d=${dd}`;

    setData([]);
    dispatch(showLoader());

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaf records");

      const result = await response.json();

      const transformed = result.map(item => ({
        supplier_id: item["Supplier Id"],
        date: item["Leaf Date"],
        leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
        lineCode: parseInt(item["Route"]),
        net_kg: parseFloat(item["Net"]),
        gross_weight: parseFloat(item["Gross Weight"]),
        full_weight: parseFloat(item["Full Weight"]),
        bag_count: parseFloat(item["Bag Count"]),
        bag_weight: parseFloat(item["Bag Weight"]),
        trp_add: parseFloat(item["TrpAdd"]),
        trp_ded: parseFloat(item["TrpDed"]),
        total_ded: parseFloat(item["Total Ded"]),
      }));

      const calculatedTotals = transformed.reduce(
        (acc, item) => {
          if (item.leaf_type === "Super") acc.super += item.net_kg;
          else acc.normal += item.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );

      setTotals(calculatedTotals);

      const summaryMap = {};

      transformed.forEach(item => {
        const code = item.lineCode;
        if (!summaryMap[code]) summaryMap[code] = { lineCode: code, Super: 0, Normal: 0 };
        if (item.leaf_type === "Super") summaryMap[code].Super += item.net_kg;
        else summaryMap[code].Normal += item.net_kg;
      });

      setLineWiseSummary(Object.values(summaryMap));
      setData(transformed);
    } catch (err) {
      console.error(err);
      message.error("❌ Failed to load leaf records");
      setData([]);
    } finally {
      dispatch(hideLoader());
    }
  };

  const getOfficerByLineId = (lineId) => {
    const match = lineIdCodeMap.find((line) => line.lineId === lineId);
    return match ? match.officer : null;
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 auto" }} className="fade-in">


        <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} md={2}>

            <Card bordered={false} style={cardStyle}>


              <Button icon={<ReloadOutlined />} danger type="primary" block onClick={() => {
                setLineWiseSummary([]);
                setData([]);
                setTotals({ super: 0, normal: 0 });
                setFilters({
                  fromYear: "", fromMonth: "", fromDay: "",
                  toYear: "", toMonth: "", toDay: "",
                  line: ""
                });
              }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>

            <Card bordered={false} style={cardStyle}>


              <Select
                showSearch
                bordered={false}
                placeholder="Select Line"
                value={filters.line}



                onChange={val => {
                  const selectedLine = uniqueLines.find(line => line.value === val);
                  const officerMatch = Object.entries(officerLineMap).find(([officer, lines]) => lines.includes(val));
                  const matchedOfficer = officerMatch ? officerMatch[0] : "All";
                  setFilters(f => ({ ...f, officer: val.officer, line: val, lineCode: selectedLine?.label || "", officer: matchedOfficer, month: "Select Month" }));
                }}



                style={selectStyle}
                dropdownStyle={{ backgroundColor: "#1e1e1e" }}
              >
                {lineIdCodeMap.map(l => (
                  <Option key={l.lineId} value={l.lineId}>{l.lineCode}</Option>
                ))}
              </Select>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>

            <Card bordered={false} style={cardStyle}>
              <Row gutter={[8, 8]} style={{ marginTop: 0 }}>
                {["Year", "Month", "Day"].map(unit => {
                  const key = `from${unit}`;
                  return (
                    <Col span={8} key={key}>
                      <Select
                        value={filters[key]}
                        onChange={(val) => setFilters(prev => ({ ...prev, [key]: val }))}
                        placeholder={unit}
                        bordered={false}
                        style={selectStyle}
                        dropdownStyle={{ backgroundColor: "#1e1e1e" }}
                      >
                        {unit === "Day"
                          ? Array.from({ length: 31 }, (_, i) => (
                            <Option key={i + 1} value={String(i + 1).padStart(2, "0")}>{i + 1}</Option>
                          ))
                          : unit === "Month"
                            ? Object.entries(monthMap).map(([val, label]) => (
                              <Option key={val} value={val}>{label}</Option>
                            ))
                            : ["2023", "2024", "2025"].map(year => (
                              <Option key={year} value={year}>{year}</Option>
                            ))}
                      </Select>
                    </Col>
                  );
                })}
              </Row>


            </Card>



          </Col>

          <Col xs={24} sm={12} md={8}>

            <Card bordered={false} style={cardStyle}>
              <Row gutter={[8, 8]} style={{ marginTop: 0 }}>
                {["Year", "Month", "Day"].map(unit => {
                  const key = `to${unit}`;
                  return (
                    <Col span={8} key={key}>
                      <Select
                        value={filters[key]}
                        onChange={(val) => setFilters(prev => ({ ...prev, [key]: val }))}
                        placeholder={unit}
                        bordered={false}
                        style={selectStyle}
                        dropdownStyle={{ backgroundColor: "#1e1e1e" }}
                      >
                        {unit === "Day"
                          ? Array.from({ length: 31 }, (_, i) => (
                            <Option key={i + 1} value={String(i + 1).padStart(2, "0")}>{i + 1}</Option>
                          ))
                          : unit === "Month"
                            ? Object.entries(monthMap).map(([val, label]) => (
                              <Option key={val} value={val}>{label}</Option>
                            ))
                            : ["2023", "2024", "2025"].map(year => (
                              <Option key={year} value={year}>{year}</Option>
                            ))}
                      </Select>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Card bordered={false} style={cardStyle}>
              <Button
                type="primary"
                block
                icon={<SearchRounded />}
                onClick={() => {
                  const {
                    fromYear, fromMonth, fromDay,
                    toYear, toMonth, toDay
                  } = filters;

                  if (fromYear && fromMonth && fromDay && toYear && toMonth && toDay) {
                    const fromDate = `${fromYear}-${fromMonth}-${fromDay}`;
                    const toDate = `${toYear}-${toMonth}-${toDay}`;
                    if (filters.line) {
                      getLeafRecordsByDates(filters.line, [fromDate, toDate]);
                    } else {
                      message.warning("⚠️ Please select a line.");
                    }
                  } else {
                    message.warning("⚠️ Please complete all date fields.");
                  }
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      {isLoading && <CircularLoader />}
      {/* Display Totals */}
      {lineWiseSummary.length > 0 && (
        <Card bordered={false} style={{ ...cardStyle, marginTop: 12 }}>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: 1 }}>
            {lineWiseSummary.map((line) => (
              <Col xs={24} sm={24} md={24} key={line.lineCode}>
                <div style={{ margin: "16px 0", textAlign: "center", borderRadius: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: "bold", color: "#fff", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                    Mr. {getOfficerByLineId(filters.line) || "Officer"} –  {filters.lineCode} Line
                  </span>
                </div>
                <Row gutter={[16, 16]} justify="center">
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ backgroundColor: "#ffa347", borderRadius: 10, padding: "14px 24px", textAlign: "center", fontWeight: 600, color: "#000", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      Super Total<br />
                      <CountUp style={{ fontSize: 30 }} end={Math.round(line.Super)} duration={1.2} separator="," /> kg
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ backgroundColor: "#47a3ff", borderRadius: 15, padding: "14px 24px", textAlign: "center", fontWeight: 600, color: "#000", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      Normal Total<br />
                      <CountUp style={{ fontSize: 30 }} end={Math.round(line.Normal)} duration={1.2} separator="," /> kg
                    </div>
                  </Col>
                  <Col xs={24} sm={24} md={8}>
                    <div style={{ backgroundColor: "#28a745", borderRadius: 10, padding: "14px 24px", textAlign: "center", fontWeight: 600, color: "#000", textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)", boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)" }}>
                      Overall Total<br />
                      <CountUp style={{ fontSize: 30 }} end={Math.round(line.Super + line.Normal)} duration={1.2} separator="," /> kg
                    </div>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default LeafSupplyByDateRange;
