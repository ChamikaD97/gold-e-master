import React, { useEffect, useState, useMemo } from "react";
import { Card, Col, Row, Button, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import officerLineMap from "../data/officerLineMap.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY } from "../api/api";
import dayjs from "dayjs";

const Summary = () => {
  const dispatch = useDispatch();
  const [totals, setTotals] = useState({ super: 0, normal: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeSummary, setRouteSummary] = useState([]);

  const getLineCodeByLineId = (targetId) => {
    const target = String(targetId).trim();
    for (const item of lineIdCodeMap) {
      const ids = item.lineId.split(",").map(id => id.trim());
      if (ids.includes(target)) return item.lineCode;
    }
    return null;
  };

  

  const getLeafRecordsByDates = async (day) => {
    const fromDate = day.startOf("month").format("YYYY-MM-DD");
    const toDate = day.format("YYYY-MM-DD");
    const dateRange = `${fromDate}~${toDate}`;

    const id = Array.from({ length: 160 }, (_, i) => i + 1).join(",");
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${id}&d=${dateRange}`;

    dispatch(showLoader());

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaf records");

      const result = await response.json();

      const transformed = result.map(item => ({
        supplier_id: item["Supplier Id"],
        date: item["Leaf Date"],
        leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
        lineId: parseInt(item["Route"]),
        lineCode: getLineCodeByLineId(parseInt(item["Route"])),
        net_kg: parseFloat(item["Net"]),
      }));

      const getOfficerByRouteCode = (code) => {
        for (const [officer, lines] of Object.entries(officerLineMap)) {
          if (lines.some(line => line.code === code)) return officer;
        }
        return "Unknown";
      };

      const totalsByRoute = transformed.reduce((acc, item) => {
        const route = item.lineCode || "Unknown";
        const officer = getOfficerByRouteCode(route);

        if (!acc[route]) {
          acc[route] = { super: 0, normal: 0, total: 0, officer };
        }

        if (item.leaf_type === "Super") acc[route].super += item.net_kg;
        else acc[route].normal += item.net_kg;

        acc[route].total += item.net_kg;
        return acc;
      }, {});

      const officerOrder = ["Ajith", "Chamod", "Udara", "Gamini", "Udayanga"];
      const grouped = {};

      // Group by officer
      Object.entries(totalsByRoute).forEach(([lineCode, values]) => {
        const officer = values.officer;
        if (!grouped[officer]) grouped[officer] = [];
        grouped[officer].push({
          officer,
          line: lineCode,
          super: values.super,  lineCode: lineCode, // ← Add this

          target: "", // Placeholder
          total: values.total,
          difference: values.super,
        });
      });

      // Flatten with rowSpan and total rows
      const tableData = [];
      let keyCounter = 0;

      officerOrder.forEach(officer => {
        const group = grouped[officer] || [];

        group.forEach((entry, index) => {
          tableData.push({
            key: keyCounter++,
            ...entry,
            officerRowSpan: index === 0 ? group.length + 1 : 0, // +1 for total row
            isTotal: false,
          });
        });

        const officerTotal = group.reduce(
          (acc, item) => {
            acc.super += item.super;
            acc.total += item.total;
            acc.difference += item.difference;
            return acc;
          },
          { super: 0, total: 0, difference: 0 }
        );

        tableData.push({
          key: keyCounter++,
          officer,
          line: "Total",
          super: officerTotal.super,
          target: "",
          total: officerTotal.total,
          difference: officerTotal.difference,
          officerRowSpan: 0,
          isTotal: true,
        });
      });

      setRouteSummary(tableData);
    } catch (err) {
      console.error(err);
      setTotals({ super: 0, normal: 0 });
      setError(err.message);
    } finally {
      dispatch(hideLoader());
    }
  };


  useEffect(() => {
    getLeafRecordsByDates(dayjs().subtract(1, "day"));
  }, []);

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
            <Col span={12}>
              <Row gutter={[8, 8]}>
                <Col md={2}>
                  <Button
                    icon={<ReloadOutlined />}
                    danger
                    type="primary"
                    block
                    onClick={() => getLeafRecordsByDates(dayjs().subtract(1, "day"))}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        {loading && <CircularLoader />}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        <Card bordered={false} style={cardStyle}>

          <Table
            columns={[
              {
                title: "Officer",
                dataIndex: "officer",
                key: "officer",
                render: (text, row) => {
                  if (row.isTotal) {
                    return {
                      children: <strong style={{ color: "orange" }}>{text}</strong>,
                      props: { colSpan: 1, rowSpan: 1 }
                    };
                  }
                  return {
                    children: text,
                    props: {
                      rowSpan: row.officerRowSpan,
                    },
                  };
                },
              },{
  title: "Line Code",
  dataIndex: "lineCode",
  key: "lineCode",
  render: (text, row) => {
    if (row.isTotal) return null;
    return <span>{text}</span>;
  },
},

              {
                title: "Line",
                dataIndex: "line",
                key: "line",
                render: (text, row) => {
                  if (row.isTotal) {
                    return <strong style={{ color: "orange" }}>Total</strong>;
                  }
                  return text;
                },
              },

              { title: "Super", dataIndex: "super", key: "super" },
              { title: "Target", dataIndex: "target", key: "target" },
              { title: "Total", dataIndex: "total", key: "total" },
              {
                title: "Difference",
                dataIndex: "difference",
                key: "difference",
                render: (value) => (
                  <span style={{ color: value >= 0 ? "lime" : "red" }}>{value}</span>
                ),
              }
            ]}

            className="sup-bordered-table"
            dataSource={routeSummary}
            pagination={false}
            bordered

          />

        </Card>



      </div>
    </div>
  );
};

export default Summary;
