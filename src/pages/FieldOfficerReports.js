import React, { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Spin, notification, Modal, Progress } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import CustomButton from "../components/CustomButton";
import OfficerProfileModal from "../components/OfficerProfileModal";
import {
  LeftCircleOutlined,
  DeleteFilled,
  UserOutlined,
} from "@ant-design/icons";
import "./SingleTrip.css";
import { Alert } from "antd";
import { Iso, Padding } from "@mui/icons-material";
import CenteredCard from "../components/CenteredCard";
import {
  ReloadOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
  MoreOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { b, bb, gl, p } from "../var";
import { selectClasses } from "@mui/material";
import MonthRangeSelector from "../components/MonthButton";
import LastYearModel from "../components/LastYearModel";
import MonthlyProgressModal from "../components/MonthlyProgressModal";
import PerformanceModal from "../components/PerformanceModal";
const FieldOfficerReports = () => {
  const { Ids } = useParams();

  const navigate = useNavigate();
  const [diff, setDiff] = useState("");
  const [officer, setOfficer] = useState();
  const [officers, setOfficers] = useState();
  const [Id, setId] = useState([]);
  const [total, setTotal] = useState();

  const [monthlyTargets, setMonthlyTargets] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isShorMoreModel, setShorMoreModelVisible] = useState(false);
  const [isLastYearModalVisible, setIsLastYearModalVisible] = useState(false);

  const [isMonthlyProgressVisible, setIsMonthlyProgressVisible] =
    useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const [isDetailsModelVisible, setIsDetailsModelVisible] = useState(false);

  const [filteredmonthlyTargets, setFilteredMonthlyTargets] = useState([]);
  const [filteredachievements, setFilteredAchievements] = useState([]);

  const [achivementFroSelectedMonth, setAchivementFroSelectedMonth] = useState(
    []
  );
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });

  const [targetForSelectedMonth, setTargetForSelectedMonth] = useState([]);
  const handleRowClick = (officer) => {
    setSelectedOfficer(officer);
    setIsProfileModalVisible(true); // open profile first
  };

  const [selectedMonth, setSelectedMonth] = useState([]);
  const [
    monthlyTargetsFroSelectedOfficer,
    setMonthlyTargetsFroSelectedOfficer,
  ] = useState([]);

  const [achivementsFroSelectedOfficer, setAchivementsFroSelectedOfficer] =
    useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [summaryData, setSummaryData] = useState([]);

  const [selectedOfficer, setSelectedOfficer] = useState([]);
  const [monthSelectorKey, setMonthSelectorKey] = useState(0);

  const [loading, setLoading] = useState(false);
  
  const API_URL = "http://192.168.1.77:8080";
  const resetRange = () => {
    setSummaryData([]);
    setMonthSelectorKey((prev) => prev + 1); // This forces remount
  };
  const [lastYearVisible, setLastYearVisible] = useState(false);
  const [monthlyVisible, setMonthlyVisible] = useState(false);
  const [performanceVisible, setPerformanceVisible] = useState(false);
  const handleRangeChange = (range, firstMonth) => {
    console.log("Selected Range start:", range.start);
    console.log("Selected end:", range.end);
    const filtered = achievements.filter(
      (item) => item.officer_id === officer.id
    );
    let startMonth = range.start;
    if (!range.end) {
      let endMonth = range.end;

      let x = startMonth;
      startMonth = endMonth;
      endMonth = x;

      console.log("same");

      const summary = calculateCumulative(filtered, range.start, range.start);
      setSummaryData(summary);
      console.log(summary);
    } else {
      const summary = calculateCumulative(filtered, range.start, range.end);
      setSummaryData(summary);

      console.log(summary);
    }

    if (range.start > selectedMonth.id) {
      console.log("Invalid ******** selected");
      return;
    }

    setShorMoreModelVisible(true);
    closeDataModel();
    setShorMoreModelVisible(true);

    if (!range.start || !range.end) {
      console.log("Invalid range selected");
      return;
    }
  };

  const fetchOfficers = () => {
    axios.get("http://localhost:5000/api/officers").then((res) => {
      const filtered = res.data.filter((item) => item.id == Id);
      setOfficers(res.data);
      setOfficer(filtered[0]);
    });
  };
  const calculateTotalTargetSum = (dataArray) => {
    return dataArray.reduce((sum, item) => sum + (item.total_target || 0), 0);
  };
  const fetchMonthlyTargets = () => {
    axios.get("http://localhost:5000/api/monthly-target").then((res) => {
      const filtered = res.data.filter((item) => item.officer_id == Id);
      setTotal(calculateTotalTargetSum(res.data));

      setMonthlyTargets(res.data);
      setFilteredMonthlyTargets(filtered);
      //calculateTotals(res.data);
    });
  };

  const fetchAchievements = () => {
    axios.get("http://localhost:5000/api/achievements").then((res) => {
      const filtered = res.data.filter((item) => item.officer_id == Id);
      setAchievements(res.data);
      setFilteredAchievements(res.data);
    });
  };

  const dataFetch = (officer) => {
    if (officer == "all") {
      setOfficer();
      return;
    }

    const filtered = achievements.filter(
      (item) => item.officer_id === officer.id
    );
    setOfficer(officer);
    const filteredMonthlyTargets = monthlyTargets.filter(
      (item) => item.officer_id === officer.id
    );
    setFilteredAchievements(filtered);

    setFilteredMonthlyTargets(filteredMonthlyTargets);

    const updateTargets = months.map((month) => ({
      id: month.id,
      name: month.name,
      target: filteredMonthlyTargets[month.id], // Get the target from original data
    }));

    // Transform into an array of { id, name, target }
    const TargetsFroSelectedOfficer = months.map((month) => ({
      id: month.id,
      name: month.name,
      target: filteredMonthlyTargets[0][month.id], // Get the target from original data
    }));

    setMonthlyTargetsFroSelectedOfficer(TargetsFroSelectedOfficer);

    const achivementsFroSelectedOfficer = months.map((month) => ({
      id: month.id,
      name: month.name,
      target: filtered[0][month.id], // Get the target from original data
    }));

    setAchivementsFroSelectedOfficer(achivementsFroSelectedOfficer);

    setId(officer.id);
  };

  const handleSearch = (officer) => {
    setId(officer.id);
    setSelectedOfficer(officer);
    dataFetch(officer);

    setIsProfileModalVisible(true); // open profile first
  };

  useEffect(() => {
    fetchOfficers();
    fetchMonthlyTargets();
    fetchAchievements();
  }, [Id]);

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  }

  // Get all data related to the Id

  const showDataModel = (monthData) => {
    const filtered = achievements.filter(
      (item) => item.officer_id === selectedOfficer.id
    );
    console.log(monthData);

    if (!monthData.id) {
      alert("");
    }
    setSelectedMonth(monthData);
    const achivement = filtered.filter((item) => item.month == monthData.id);
    const officerMonthlyTargets = monthlyTargetsFroSelectedOfficer.filter(
      (item) => item.id == monthData.id
    );

    if (achivement[0]) {
      setAchivementFroSelectedMonth(achivement[0]);
      setTargetForSelectedMonth(officerMonthlyTargets[0]);
      setIsDetailsModelVisible(true);
    }
  };

  const closeDetailsModel = () => {
    setIsDetailsModelVisible(false);
  };
  const closeDataModel = () => {
    setShorMoreModelVisible(false);
  };
  const months = [
    { id: "jan", name: "January" },
    { id: "feb", name: "February" },
    { id: "mar", name: "March" },
    { id: "apr", name: "April" },
    { id: "may", name: "May" },
    { id: "jun", name: "June" },
    { id: "jul", name: "July" },
    { id: "aug", name: "August" },
    { id: "sep", name: "September" },
    { id: "oct", name: "October" },
    { id: "nov", name: "November" },
    { id: "dece", name: "December" }, // matches your key: 'dece'
  ];
  const monthOrder = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dece",
  ];

  const getMonthNameById = (monthId) =>
    months.find((m) => m.id === monthId)?.name || null;
  const achievedMonths = new Set(filteredachievements.map((ach) => ach.month));

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  function countUp(element, end, duration = 1000) {
    let start = 0;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      const current = Math.floor(progressRatio * end);
      element.innerText = current;
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        element.innerText = end; // ensure exact end value
      }
    }

    requestAnimationFrame(step);
  }

  function filterTargetsByMonthRange(data, startMonth, endMonth) {
    const monthOrder = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    if (!data || data.length === 0) return 0;

    const record = data[0]; // Assuming only one object
    const startIndex = monthOrder.indexOf(startMonth);
    const endIndex = monthOrder.indexOf(endMonth);

    if (startIndex === -1 || endIndex === -1) return 0;

    const [from, to] =
      startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

    const sum = monthOrder
      .slice(from, to + 1)
      .reduce((acc, month) => acc + (record[month] || 0), 0);

    console.log("Summed Range:", monthOrder.slice(from, to + 1));
    console.log("Total Sum:", sum);

    return sum;
  }
  function filterGoldLeftByMonthRange(data, startMonth, endMonth) {
    const monthOrder = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    if (!data || data.length === 0) return 0;

    const record = data[0]; // Assuming only one object
    const startIndex = monthOrder.indexOf(startMonth);
    const endIndex = monthOrder.indexOf(endMonth);

    if (startIndex === -1 || endIndex === -1) return 0;

    const [from, to] =
      startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

    const sum = monthOrder
      .slice(from, to + 1)
      .reduce((acc, month) => acc + (record[month] || 0), 0);

    console.log("Summed Range:", monthOrder.slice(from, to + 1));
    console.log("Total Sum:", sum);

    return sum;
  }
  const calculateCumulative = (dataArray, startMonth, endMonth) => {
    const monthOrder = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    let startIdx = monthOrder.indexOf(startMonth.toLowerCase());
    let endIdx = monthOrder.indexOf(endMonth.toLowerCase());
    if (startIdx > endIdx) {
      let x = startIdx;
      startIdx = endIdx;
      endIdx = x;
    }
    if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
      throw new Error("Invalid month range");
    }

    const filteredData = dataArray.filter((item) => {
      const monthIdx = monthOrder.indexOf(item.month.toLowerCase());
      return monthIdx >= startIdx && monthIdx <= endIdx;
    });

    const months = filteredData.length;
    const r = filteredData.reduce((sum, item) => sum + (item.value || 0), 0);
    const b = filteredData.reduce((sum, item) => sum + (item.B || 0), 0);
    const bob = filteredData.reduce((sum, item) => sum + (item.BoB || 0), 0);
    const p = filteredData.reduce((sum, item) => sum + (item.P || 0), 0);
    const gold_leaf = filteredData.reduce(
      (sum, item) => sum + (item.gold_leaf || 0),
      0
    );
    const targets = monthlyTargets.filter(
      (item) => item.officer_id === officer.id
    );

    const goldTargets = monthlyTargets.filter(
      (item) => item.officer_id === officer.id
    );
    const total_target = filterTargetsByMonthRange(
      targets,
      startMonth,
      endMonth
    );
    console.log(b, bob, p);

    const b_percentage = months > 0 ? Math.round(b / months) : 0;
    const bob_percentage = months > 0 ? Math.round(bob / months) : 0;
    const p_percentage = months > 0 ? Math.round(p / months) : 0;

    const overoll_percentage = months > 0 ? Math.round(r / total_target) : 0;

    const total_gl_target = total_target * gl;
    const gold_leaf_percentage =
      r > 0 ? Math.round((gold_leaf / total_gl_target) * 100) : 0;

    return {
      received: r,
      months,
      overoll_percentage,
      gold_leaf,
      b_percentage,
      bob_percentage,
      p_percentage,
      gold_leaf_percentage,
      total_gl_target,
      total_target,
    };
  };

  const showMoreModel = () => {
    const filtered = achievements.filter(
      (item) => item.officer_id === officer.id
    );
    if (selectedMonth.id) {
      console.log("///////////////////");

      const summary = calculateCumulative(
        filtered,
        selectedMonth.id,
        selectedMonth.id
      );
      setSummaryData(summary);
    }
    closeDataModel();
    setShorMoreModelVisible(true);

    resetRange();

    setShorMoreModelVisible(true);
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "10px",
          marginTop: "10px",
          width: "100%",
          paddingBottom: "10px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#FFFFFF" /* Add your desired color here */,
          }}
        >
          {officer?.name
            ? `${officer.name}'s Reports`
            : " Factory Reports - 2025"}
        </h2>
      </div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Distribute buttons evenly
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",

            width: "100%",
          }}
        >
          <CustomButton
            onClick={() => {}}
            icon={<ReloadOutlined />}
            type="#910000"
          />
          {officers &&
            officers.map((off) => (
              <CustomButton
                text={off.name}
                type="rgba(0, 10, 145, 0.78)"
                icon={<UserOutlined />}
                onClick={() => handleSearch(off)}
              />
            ))}
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // Distribute buttons evenly
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "10px",
          marginTop: "10px",

          paddingBottom: "10px",
        }}
      >
        {/* {officer && filteredData && (
          <Card
            style={{
              display: "flex",
              justifyContent: "space-evenly", // Distribute buttons evenly
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",

                width: "100%",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Monthly Target
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly", // Distribute buttons evenly
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {officers && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
                    gap: "10px", // spacing between items
                    width: "100%",
                    margin: "10px 0",
                  }}
                >
                  {monthlyTargetsFroSelectedOfficer.map((month) => (
                    <CustomButton
                      key={month.id}
                      text={`${month.name} - ${month.target.toLocaleString()}`}
                      type="rgba(0, 0, 0, 0.78)"
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        )} */}

        {/* {officer && filteredData && (
          <Card
            style={{
              display: "flex",
              justifyContent: "space-between", // Distribute buttons evenly
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",

                width: "100%",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Achievement Target
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between", // Distribute buttons evenly
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {officers && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
                    gap: "10px", // spacing between items
                    width: "100%",
                    margin: "10px 0",
                  }}
                >
                  {months
                    .sort((a, b) => {
                      const monthOrder = {
                        jan: 1,
                        feb: 2,
                        mar: 3,
                        apr: 4,
                        may: 5,
                        jun: 6,
                        jul: 7,
                        aug: 8,
                        sep: 9,
                        oct: 10,
                        nov: 11,
                        dece: 12,
                      };
                      return monthOrder[a.id] - monthOrder[b.id];
                    })
                    .map((month) => (
                      <CustomButton
                        key={month.id}
                        text={month.name}
                        type={
                          achievedMonths.has(month.id)
                            ? "rgba(0, 145, 31, 0.78)"
                            : "rgba(145, 0, 0, 0.78)"
                        }
                        onClick={
                          achievedMonths.has(month.id)
                            ? () => showDataModel(month)
                            : () => console.log("")
                        }
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          </Card>
        )} */}
      </div>
      <OfficerProfileModal
        officers={officers}
        visible={isProfileModalVisible}
        filteredData={filteredData}
        monthlyTargetsFroSelectedOfficer={monthlyTargetsFroSelectedOfficer}
        onClose={() => setIsProfileModalVisible(false)}
        officer={selectedOfficer}
        onContinue={(action = "default") => {
          setIsProfileModalVisible(false);

          switch (action) {
            case "lastYear":
              setLastYearVisible(true);
              break;
            case "monthly":
              setMonthlyVisible(true);
              break;
            case "performance":
              setSelectedMonth({ id: "jan", name: "January" });
              setPerformanceVisible(true);
              break;
            default:
              setIsDetailsModelVisible(true);
              break;
          }
        }}
      />

      <LastYearModel
        visible={lastYearVisible}
        onClose={() => setLastYearVisible(false)}
      />
      <MonthlyProgressModal
        visible={monthlyVisible}
        onClose={() => setMonthlyVisible(false)}
      />
      <PerformanceModal
        visible={performanceVisible}
        onClose={() => setPerformanceVisible(false)}
      />

      <Modal
        title={
          targetForSelectedMonth.target
            ? selectedOfficer
              ? selectedMonth.name + " Report of " + selectedOfficer.name
              : selectedOfficer.id
            : "Select Month to Show the Reports"
        }
        visible={isDetailsModelVisible}
        onCancel={() => setIsDetailsModelVisible(false)}
        footer={null}
        centered
      >
        {officer && filteredData && (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {/* <h2
              style={{
                marginBottom: "16px",
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              Achievement Target
            </h2> */}

            {officers && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {months
                  .sort((a, b) => {
                    const monthOrder = {
                      jan: 1,
                      feb: 2,
                      mar: 3,
                      apr: 4,
                      may: 5,
                      jun: 6,
                      jul: 7,
                      aug: 8,
                      sep: 9,
                      oct: 10,
                      nov: 11,
                      dece: 12,
                    };
                    return monthOrder[a.id] - monthOrder[b.id];
                  })
                  .map(
                    (month) =>
                      achievedMonths.has(month.id) && (
                        <CustomButton
                          key={month.id}
                          text={month.name}
                          type={
                            achievedMonths.has(month.id)
                              ? "rgb(0, 145, 31)"
                              : "rgba(145, 0, 0, 0.78)"
                          }
                          onClick={
                            achievedMonths.has(month.id)
                              ? () => showDataModel(month)
                              : () => console.log("Month not achieved")
                          }
                          style={{
                            textAlign: "center",
                            padding: "6px 10px",
                          }}
                        />
                      )
                  )}
              </div>
            )}
          </div>
        )}
        {targetForSelectedMonth.target && (
          <>
            {/* Top Section (2 Cards) */}
            {/* Top Section (Leaf Count + Super Leaf) */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {/* Leaf Count */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "15px" }}>Leaf Count</h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                    <div>Target - {targetForSelectedMonth.target} kg</div>
                    <div>Received - {achivementFroSelectedMonth.value} kg</div>
                  </div>
                  <div>
                    <Progress
                      type="circle"
                      
                      percent={getPercentage(
                        achivementFroSelectedMonth.value,
                        targetForSelectedMonth.target
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Super Leaf */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "15px" }}>
                  Super Leaf (50%)
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                    <div>Target - {targetForSelectedMonth.target * gl} kg</div>
                    <div>
                      Received - {achivementFroSelectedMonth.gold_leaf} kg
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      minWidth: "80px",
                    }}
                  >
                    <Progress
                      type="circle"
                       strokeColor="#877c07"
                      percent={getPercentage(
                        achivementFroSelectedMonth.gold_leaf,
                        targetForSelectedMonth.target * gl
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Super Leaf */}

            {/* Bottom Section (3 Cards) */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {/* B */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "15px" }}>B (60%)</h2>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                ><Progress
                percent=         {achivementFroSelectedMonth.B} 
                 strokeColor="#005e1e"
              />
           
                </div>
              </div>

              {/* BB */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "15px" }}>BB (10%)</h2>
         
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  <Progress
                    percent=  {achivementFroSelectedMonth.BoB}
                    strokeColor="#1890ff"  
                  />
                <div>
               
             
                </div>
                </div>
              </div>

              {/* P */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "15px" }}>P (30%)</h2>
                
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  <Progress
                    percent=  {achivementFroSelectedMonth.P}
                   strokeColor="#910000"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <CustomButton
          text={"More"}
          type={"rgb(44, 0, 145)"}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
          onClick={() => showMoreModel()}
        />
      </Modal>

      <Modal
        title={"Select Month Range"}
        visible={isShorMoreModel}
        onCancel={() => setShorMoreModelVisible(false)}
        footer={null}
        centered
        width={"60%"}
      >
        {/* Header Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <CustomButton
            type="#f0f0f0"
            onClick={resetRange}
            icon={<ReloadOutlined />}
            style={{
              backgroundColor: "#910000",
              border: "1px solid #d9d9d9",
            }}
          />
          {months.filter((month) => achievedMonths.has(month.id)).length >
            0 && (
            <MonthRangeSelector
              key={monthSelectorKey}
              months={months.filter((month) => achievedMonths.has(month.id))}
              onRangeChange={handleRangeChange}
            />
          )}
        </div>

        {/* 3 Segments in a Row */}

        {summaryData && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                paddingBottom: "20px",
                flexWrap: "nowrap",
              }}
            >
              {/* Segment 1 */}
              <div
                style={{
                  width: "33%",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid rgb(0, 0, 0)",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h3>Basic Summary</h3>
                <div>
                  <strong>Received:</strong> {summaryData?.received}
                </div>
                <div>
                  <strong>Total Target:</strong> {summaryData?.total_target}
                </div>
                <div>
                  <strong>Overall %:</strong>
                  <Progress
                    percent={getPercentage(
                      summaryData?.received,
                      summaryData?.total_target
                    )}
                    strokeColor="#910000"
                  />
                </div>
              </div>

              {/* Segment 2 */}
              <div
                style={{
                  width: "33%",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid rgb(0, 0, 0)",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h3>Super Leaf Details</h3>
                <div>
                  <strong>Super Leaf Target:</strong>{" "}
                  {summaryData?.total_gl_target}
                </div>
                <div>
                  <strong>Super:</strong> {summaryData?.gold_leaf}
                </div>
                <div>
                  <strong>Super %:</strong>
                  <Progress
                    percent={summaryData?.gold_leaf_percentage}
                    strokeColor="#877c07"
                  />
                </div>
              </div>

              {/* Segment 3 */}
              <div
                style={{
                  width: "33%",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid rgb(0, 0, 0)",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Category Percentages</h3>
                <div>
                  <strong>B %:</strong>
                  <Progress
                    percent={summaryData?.b_percentage}
      
                     strokeColor="#005e1e"
                  />
                </div>
                <div>
                  <strong>BB %:</strong>
                  <Progress
                    percent={summaryData?.bob_percentage}
                     strokeColor="#1890ff"  
                  />
                </div>
                <div>
                  <strong>P %:</strong>
                  <Progress
                    percent={summaryData?.p_percentage}
                      strokeColor="#910000"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* {!officer && <Card>{total}</Card>} */}
    </>
  );
};

export default FieldOfficerReports;
