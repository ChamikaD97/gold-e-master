import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Button, Table,
  message
} from "antd";
import { ReloadOutlined, UserOutlined } from "@ant-design/icons";
import '../App.css';



import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";

import { API_KEY, fetchLines, fetchOfficers, login } from "../api/api";
import dayjs from "dayjs";
import LineAnalyticsModal from "../components/LineAnalyticsModal";
import { AllInbox, ReportOffRounded } from "@mui/icons-material";
import FactoryAnalyticsModal from "../components/FactoryAnalyticsModal";
import { setAllLines, setOfficers } from "../redux/officerLineSlice";
const OfficerTargets = () => {

  const [officerDataMap, setOfficerDataMap] = useState({});
  const [filters, setFilters] = useState({ officer: "All", line: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [isFactory, setIsFactory] = useState(false);
  const filteredLines = filters.officer === "All" ? [] : officerDataMap[filters.officer] || [];
  const dispatch = useDispatch();

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.82)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };

  const officers = useSelector((state) => state.officerLine.officers);
  const allLines = useSelector((state) => state.officerLine.allLines);

  const [officerOrder, setOfficerOrder] = useState(officers.map(item => item.name));

  const getLines = async () => {
    try {
      const data = await fetchLines();
      dispatch(setAllLines(data));
      const filteredOfficers = data
        .map(item => item.officer)



    } catch (err) {
      message.error("Failed to fetch lines");
      console.error(err);
    }
  };
  const getOfficers = async () => {
    try {
      const data = await fetchOfficers();
      const officerNames = data.map(item => item.name);
      setOfficerOrder(officerNames);
      dispatch(setOfficers(data));
      const data2 = await fetchLines();
      dispatch(setAllLines(data2));
    } catch (err) {
      message.error("Failed to fetch Officers");
      console.error(err);
    } finally {
      const output = buildOfficerLineMap(officers, allLines);
      setOfficerDataMap(output);
    }
  };

  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const isReload =
      (nav && nav.type === 'reload') ||
      // Fallback for older browsers:
      (performance.navigation && performance.navigation.type === 1);

    if (isReload) {
      // 🔁 Page was reloaded
      getOfficers();
      getLines();
      console.log("reload");
    }
  }, []);

  useEffect(() => {
    getOfficers();
    console.log("officers or lines changed");

    getLines();
  }, [officers.length, allLines.length]);

  // ---------- Helper ----------
  const normalizeOfficer = (name = "") =>
    name.replace(/^Mr\.?\s*/i, "").trim(); // "Mr. Ajith" -> "Ajith"

  // Optional: include/exclude "Other" and unknown officers
  const INCLUDE_OTHERS = true;

  // Optional: special label overrides for specific (officer|code|ids)
  // Key format: `${officer}|${lineCode}|${sortedIds}`
  const SPECIAL_LABELS = new Map([
    ['Udayanga|PT|48,62,64', 'O-18/PT/PT2'], // example from your desired output
    ['Udayanga|DM|129', 'C 15'],             // example from your desired output
    // add more if you need exact renames
  ]);

  const keyFor = (officer, lineCode, idsArray) => {
    const sorted = [...idsArray].sort((a, b) => a - b).join(',');
    return `${officer}|${lineCode}|${sorted}`;
  };

  // ---------- Core transform ----------
  function buildOfficerLineMap(officersArr, assignmentsArr) {
    const knownOfficers = new Set(
      officersArr.map(o => normalizeOfficer(o.name))
    );

    const result = {};

    for (const rec of assignmentsArr) {
      const off = normalizeOfficer(rec.officer);
      if (
        (!INCLUDE_OTHERS && (!knownOfficers.has(off) || /^other$/i.test(off))) ||
        off === "" ||
        rec.lineCode == null ||
        rec.lineId == null
      ) continue;

      // Split/clean multi-IDs like "  81,97" -> [81, 97]
      const ids = String(rec.lineId)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(Number);

      const rawCode = String(rec.lineCode).trim();
      const overrideKey = keyFor(off, rawCode, ids);
      const label = SPECIAL_LABELS.get(overrideKey) ?? rawCode;

      if (!result[off]) result[off] = [];
      result[off].push({
        lineCode: label,
        lineId: ids.join(','),
      });
    }

    // Inject the "All" row per officer (deduped + numeric sort)
    for (const off of Object.keys(result)) {
      const allIds = new Set();
      for (const item of result[off]) {
        item.lineId.split(',').forEach(x => allIds.add(Number(x)));
      }
      const allJoined = [...allIds].sort((a, b) => a - b).join(',');
      result[off].unshift({ lineCode: 'All', lineId: allJoined });
    }

    return result;
  }

  // ---------- Usage ----------


  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>


      <LineAnalyticsModal
        visible={modalOpen}
        onClose={() => {


          setModalOpen(false)
        }}
        lineCode={filters.line}
        filteredLines={filteredLines.find(line => line.lineCode === filters.line)}
      />
      <FactoryAnalyticsModal
        visible={isFactory}
        onClose={() => {

          setIsFactory(false);
        }}
        lineCode={filters.line}
        filteredLines={filteredLines.find(line => line.lineCode === filters.line)}
      />

      <Card bordered={false} style={cardStyle} className="fade-in">

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={1}>
            <Button
              icon={<ReloadOutlined />}
              type="primary"
              block
              danger
              onClick={() => setFilters({ officer: "All", line: "" })}
            >

            </Button>
          </Col>
          <Col xs={12} sm={8} md={3}>
            <Button
              type="primary"
              block
              danger
              onClick={() => {
                setIsFactory(true);

              }}
            >
              All
            </Button>
          </Col>
          {Object.keys(officerDataMap).map((officer) => (
            <Col key={officer} xs={12} sm={8} md={4}>
              <Button
                icon={<UserOutlined />}
                type="primary"
                block
                onClick={() => {
                  setFilters({ officer: "All", line: "" });
                  setTimeout(() => {
                    setFilters({ officer, line: "" });
                  }, 100);
                }}


              >
                {officer.includes("Other") || officer.includes("New") ? officer : "Mr. " + officer}
              </Button>
            </Col>
          ))}

        </Row>
      </Card>

      {filters.officer !== "All" && (
        <>
          {/* Line Buttons */}
          <Card bordered={false} style={cardStyle} className="fade-in">
            <Row gutter={[12, 12]}>

              {filteredLines.map(({ lineCode }) => (
                <Col xs={8} sm={4} md={4} key={lineCode}>
                  <Button
                    type={filters.line === lineCode ? "primary" : "default"}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, line: lineCode }));
                      setModalOpen(true);
                    }}

                    style={{ width: "100%", background: filters.line === lineCode ? "#1890ff" : "#000", color: "#fff" }}
                  >
                    {lineCode || "N/A"}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>


        </>
      )}
    </div>
  );
};

export default OfficerTargets;
