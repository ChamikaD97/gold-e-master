import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Select, Typography, Button, Progress, Table
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import CountUp from "react-countup";
import achievementsData from "./data/achievements.json";
import { useSelector } from "react-redux";



ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const { Option } = Select;
const { Title, Text } = Typography;





const FactoryTargetAchievements = () => {
  const [data, setData] = useState([]);

  const [filters, setFilters] = useState({ year: "2024", month: "All", officer: "All", line: "All" });
  const [suppliersMarkedTomorrow, setSuppliersMarkedTomorrow] = useState([]);
  useEffect(() => {
    setData(achievementsData);
  }, []);

  const filteredData = useMemo(() => {
    let result = data.filter(d => d.month.startsWith(filters.year));
    if (filters.month !== "All") result = result.filter(d => d.month === `${filters.year}-${filters.month}`);
    if (filters.officer !== "All") result = result.filter(d => d.field_officer === filters.officer);
    if (filters.line !== "All") result = result.filter(d => d.line_id === filters.line);
    return result;
  }, [data, filters]);
  const allLines = useSelector(state => state.officerLine.allLines || []);

  const totalTarget = useMemo(() => filteredData.reduce((sum, d) => sum + d.target, 0), [filteredData]);
  const totalAchieved = useMemo(() => filteredData.reduce((sum, d) => sum + d.achieved, 0), [filteredData]);
  const totalAchievedSuper = useMemo(() => filteredData.reduce((sum, d) => sum + d.achievedSuper, 0), [filteredData]);
  const achievementRate = useMemo(() => totalTarget ? ((totalAchieved / totalTarget) * 100).toFixed(2) : 0, [totalTarget, totalAchieved]);

  const monthlyChartData = useMemo(() => {
    const summary = {};
    filteredData.forEach(({ month, target, achieved }) => {
      if (!summary[month]) summary[month] = { target: 0, achieved: 0 };
      summary[month].target += target;
      summary[month].achieved += achieved;
    });
    return Object.entries(summary).map(([month, values]) => ({
      month,
      ...values
    }));
  }, [filteredData]);
  const officerLineMap = useSelector((state) => state.officerLine.officerLineMap);

  const monthMap = useSelector((state) => state.commonData?.monthMap);


  const dailyChartData = useMemo(() => {
    const summary = {};
    filteredData.forEach(({ month, target, achieved }) => {
      const day = month.split("-")[2]; // extract DD from YYYY-MM-DD
      if (!summary[day]) summary[day] = { target: 0, achieved: 0 };
      summary[day].target += target;
      summary[day].achieved += achieved;
    });
    return Object.entries(summary).map(([day, values]) => ({
      day,
      ...values
    }));
  }, [filteredData]);

  const lineChartDatas = useMemo(() => ({
    labels: monthlyChartData.map(d => monthMap[d.month.slice(5)]),
    datasets: [
      {
        label: "Target",
        data: monthlyChartData.map(d => d.target),
        fill: false,
        borderColor: "#8884d8",
        tension: 0.3
      },
      {
        label: "Achieved",
        data: monthlyChartData.map(d => d.achieved),
        fill: false,
        borderColor: "#52c41a",
        tension: 0.3
      },
      {
        label: "Achievement %",
        data: monthlyChartData.map(d =>
          d.target ? ((d.achieved / d.target) * 100).toFixed(2) : 0
        ),
        fill: false,
        borderColor: "#faad14",
        tension: 0.3,
        yAxisID: 'percentage' // <- will need a separate Y axis
      }
    ]
  }), [monthlyChartData]);






  const lineChartData = useMemo(() => {
    if (filters.month !== "All") {
      // Show days of the selected month
      const daysInMonth = new Date(+filters.year, +filters.month, 0).getDate(); // e.g. 30
      const dayLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

      const dayDataMap = {};
      filteredData.forEach(d => {
        const day = d.month.split("-")[2]; // expecting YYYY-MM-DD
        if (day) {
          const dayNum = parseInt(day, 10);
          if (!dayDataMap[dayNum]) {
            dayDataMap[dayNum] = { target: 0, achieved: 0 };
          }
          dayDataMap[dayNum].target += d.target;
          dayDataMap[dayNum].achieved += d.achieved;
        }
      });

      return {
        labels: dayLabels,

        datasets: [
          {
            label: "Target",
            data: dailyChartData.map(d => d.target),
            fill: false,
            borderColor: "#adasdsad",
            tension: 0.3
          },
          {
            label: "Achieved",
            data: dailyChartData.map(d => d.achieved),
            fill: false,
            borderColor: "#52c41a",
            tension: 0.3
          },
          {
            label: "Achievement %",
            data: dailyChartData.map(d =>
              d.target ? ((d.achieved / d.target) * 100).toFixed(2) : 0
            ),
            fill: false,
            borderColor: "#faad14",
            tension: 0.3,
            yAxisID: 'percentage' // <- will need a separate Y axis
          }
        ]
      };
    } else {
      // Default monthly chart
      return {
        labels: monthlyChartData.map(d => monthMap[d.month.slice(5)]),
        datasets: [
          {
            label: "Target",
            data: monthlyChartData.map(d => d.target),
            fill: false,
            borderColor: "#8884d8",
            tension: 0.3
          },
          {
            label: "Achieved",
            data: monthlyChartData.map(d => d.achieved),
            fill: false,
            borderColor: "#52c41a",
            tension: 0.3
          },
          {
            label: "Achievement %",
            data: monthlyChartData.map(d =>
              d.target ? ((d.achieved / d.target) * 100).toFixed(2) : 0
            ),
            fill: false,
            borderColor: "#faad14",
            tension: 0.3,
            yAxisID: 'percentage' // <- will need a separate Y axis
          }
        ]
      };
    }
  }, [monthlyChartData, filteredData, filters]);


  const lineChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#fff" }
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff"
      }
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { display: false } // ❌ No grid lines on x-axis
      },
      y: {
        display: false,

      },

    }
  };

  const officerChartData = useMemo(() => {
    const summary = {};
    filteredData.forEach(({ field_officer, target, achieved }) => {
      if (!summary[field_officer]) summary[field_officer] = { target: 0, achieved: 0 };
      summary[field_officer].target += target;
      summary[field_officer].achieved += achieved;
    });
    return Object.entries(summary).map(([officer, stats]) => ({
      officer,
      ...stats,
      percent: stats.target ? ((stats.achieved / stats.target) * 100).toFixed(2) : 0
    }));
  }, [filteredData]);

  const barData = {
    labels: officerChartData.map(d => d.officer),
    datasets: [{
      label: "Achievement %",
      data: officerChartData.map(d => d.percent),
      backgroundColor: "#1890ff"
    }]
  };

  const pieData = {
    labels: officerChartData.map(d => d.officer),
    datasets: [{
      label: "Achievement Share",
      data: officerChartData.map(d => d.achieved),
      backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"]
    }]
  };

  const columns = [
    { title: "Month", dataIndex: "month", key: "month" },
    { title: "Line", dataIndex: "line_id", key: "line_id" },
    { title: "Officer", dataIndex: "field_officer", key: "field_officer" },
    { title: "Target", dataIndex: "target", key: "target" },
    { title: "Achieved", dataIndex: "achieved", key: "achieved" },
    {
      title: "Achieved %",
      key: "percent",
      render: (record) => `${((record.achieved / record.target) * 100).toFixed(2)}%`
    }
  ];

  const uniqueOfficers = ["All", ...Object.keys(officerLineMap)];
  const filteredLines = filters.officer === "All"
    ? ["All", ...new Set(data.map(d => d.line_id))]
    : ["All", ...(officerLineMap[filters.officer] || [])];
  const uniqueMonths = ["All", ...new Set(data.filter(d => d.month.startsWith(filters.year)).map(d => d.month.slice(5)))];

  const cardStyle = { background: "rgba(0, 0, 0, 0.6)", color: "rgba(206, 3, 3, 0.6)", borderRadius: 12, marginBottom: 6 };

  const filterText = `Displaying data for ${filters.month !== "All" ? monthMap[filters.month] : "all months"} ${filters.year}, ` +
    `${filters.officer !== "All" ? `Officer: ${filters.officer}, ` : ""}` +
    `${filters.line !== "All" ? `Line: ${filters.line}` : ""}`.trim();

  return (



    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">

        <div key={`filters-${filters.year}-${filters.officer}`}>
          <Card bordered={false} style={{ ...cardStyle }}>
            <Row gutter={[16, 16]}>
              <Col md={1}>
                <Button
                  icon={<ReloadOutlined />}
                  danger
                  type="primary"
                  block
                  onClick={() => setFilters({ year: "2025", month: "All", officer: "All", line: "All" })}
                >

                </Button>
              </Col>





              <Col md={2}>
                <Select
                  className="year-select"
                  value={filters.year}
                  onChange={val => setFilters(f => ({ ...f, year: val, month: "All" }))}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#fff"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="2024">2024</Option>
                  <Option value="2025">2025</Option>
                </Select>
              </Col>


              {uniqueOfficers.filter(o => o !== "All").map(o => (
                <Col xs={8} sm={4} md={3} key={o}>
                  <Button
                    type={filters.officer === o ? "primary" : "default"}
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        officer: o,
                        line: o === "Malinduwa" ? "M" : "All",
                        month: "All"
                      }))
                    }
                    style={{
                      width: "100%",
                      background: filters.officer === o ? "#1890ff" : "#000",
                      color: "#fff",
                      borderColor: "#333"
                    }}
                  >
                    {o}
                  </Button>
                </Col>
              ))}

              <Col md={2}>
                <Select
                  showSearch
                  className="line-select"
                  placeholder="Select Line"
                  value={filters.line}
                  onChange={val => {
                    const officerMatch = Object.entries(officerLineMap).find(
                      ([officer, lines]) => lines.includes(val)
                    );
                    const matchedOfficer = officerMatch ? officerMatch[0] : "All";
                    setFilters(f => ({
                      ...f,
                      line: val,
                      officer: matchedOfficer,
                      month: "All"
                    }));
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    cursor: "pointer"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allLines.map(line => (
                    <Option key={line} value={line}>{line}</Option>
                  ))}
                </Select>
              </Col>

            </Row>
          </Card>
        </div>

        {/* Line filter */}
        {filters.line !== "M" && filters.officer !== "All" && (
          <div key={`line-${filters.officer}`}>
            <Card bordered={false} className="fade-in" style={cardStyle}>
              <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                {filteredLines.filter(l => l !== "All").map(line => (
                  <Col xs={8} sm={4} md={4} key={line}>
                    <Button
                      type={filters.line === line ? "primary" : "default"}
                      onClick={() => setFilters(prev => ({ ...prev, line, month: "All" }))}
                      style={{ width: "100%", background: filters.line === line ? "#1890ff" : "#000", color: "#fff", borderColor: "#333" }}
                    >
                      {line}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        )}

        {/* Month filter */}
        {filters.line !== "All" && (
          <div key={`month-${filters.line}`}>
            <Card bordered={false} className="fade-in" style={cardStyle}>
              <Row gutter={[12, 12]}>
                {uniqueMonths.filter(m => m !== "All").sort().map(m => (
                  <Col xs={8} sm={4} md={4} key={m}>
                    <Button
                      type={filters.month === m ? "primary" : "default"}
                      onClick={() => setFilters(prev => ({ ...prev, month: m }))}
                      style={{ width: "100%", background: filters.month === m ? "#1890ff" : "#000", color: "#fff", borderColor: "#333" }}
                    >
                      {monthMap[m]}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        )}


        <Card bordered={false} style={cardStyle}>


          <Text strong style={{ color: "#fff", fontSize: 20 }}>{filterText}</Text>
        </Card>

        <Row gutter={[16, 16]}>
          {[
            { label: "Total Target", value: totalTarget },
            { label: "Target Achievement", value: totalAchieved },
            { label: "Super Leaf Target", value: totalTarget * 0.5 },
            { label: "Super Leaf Achievement", value: totalAchievedSuper }
          ].map((stat, i) => (
            <Col key={i} md={6}>
              <Card bordered={false} style={cardStyle}>
                <Text strong style={{ color: "#fff", fontSize: 20 }}>{stat.label}</Text>
                <Title level={5} style={{ color: "#fff", margin: 0, fontSize: 20 }}>
                  <CountUp end={stat.value} duration={1.5} separator="," />
                </Title>
              </Card>
            </Col>

          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col md={12}>
            <Card bordered={false} style={cardStyle}>
              <Text strong style={{ color: "#fff", fontSize: 20 }}>Overall Progress</Text>
              <Progress
                percent={parseFloat(achievementRate)}
                strokeColor="#52c41a"
                strokeWidth={16}
                format={(percent) => (
                  <span style={{ fontSize: 30, color: "#fff" }}>
                    <CountUp end={percent} suffix="%" />
                  </span>
                )}
              />
            </Card>
          </Col>

          <Col md={12}>
            <Card bordered={false} style={cardStyle}>
              <Text strong style={{ color: "#fff", fontSize: 20 }}>Super Leaf Progress</Text>
              <Progress
                percent={parseFloat(((totalAchievedSuper / (totalTarget * 2)) * 100).toFixed(2))}
                strokeColor="#faad14"
                strokeWidth={16}
                format={(percent) => (
                  <span style={{ fontSize: 30, color: "#fff" }}>
                    <CountUp end={percent} suffix="%" />
                  </span>
                )}
              />
            </Card>
          </Col>
        </Row>




        <Row gutter={[16, 16]}>



          <Col md={24}>
            <Card bordered={false} style={cardStyle}>
              <Text strong style={{ color: "#fff", fontSize: 20 }}>Overall Progress
              </Text>
              <div style={{ height: 300 }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card>
          </Col>



        </Row>
        <style>
          {`
              .custom-placeholder::placeholder,
              .custom-placeholder input::placeholder,
              .ant-picker-input input::placeholder {
                color: #444 !important;
                opacity: 0.8 !important;
              }

              .ant-picker-input input {
                color: #111 !important;
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .fade-in {
                animation: fadeIn 0.6s ease-in-out;
              }
            `}
        </style>

      </div>


    </div>

  )
};

export default FactoryTargetAchievements;
