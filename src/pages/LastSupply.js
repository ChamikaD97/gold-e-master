import React, { useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select, Table, Input
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import CircularLoader from "../components/CircularLoader";
import { API_KEY } from "../api/api";
import { showLoader, hideLoader } from "../redux/loaderSlice";

const LastSupply = () => {
  const { Option } = Select;
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({ line: "All" });
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { isLoading } = useSelector((state) => state.loader);
  const lineIdCodeMapForAll = useSelector((state) => state.officerLine.allLines);

  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];

  const isInactiveOverMonths = (lastDateStr, months = 3) => {
    if (!lastDateStr || lastDateStr === "-") return true;
    const lastDate = dayjs(lastDateStr);
    return dayjs().diff(lastDate, "month") >= months;
  };

  const getLeafRecordsByRoutes = async () => {
    dispatch(showLoader());

    const startDate = dayjs().subtract(5, 'year').startOf('year');
    const endDate = dayjs().endOf("month");
    const dateRange = `${startDate.format("YYYY-MM-DD")}~${endDate.format("YYYY-MM-DD")}`;

    const glfUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${filters.line}&d=${dateRange}`;
    const supUrl = `/quiX/ControllerV1/supdata?k=${API_KEY}&r=${filters.line}`;

    try {
      const [glfRes, supRes] = await Promise.all([fetch(glfUrl), fetch(supUrl)]);
      if (!glfRes.ok || !supRes.ok) throw new Error("Failed to fetch data");

      const result = await glfRes.json();
      const allSuppliersRaw = await supRes.json();

      const supplierLastDateMap = {};
      const supplierTotalKgMap = {};

      result.forEach(item => {
        const sid = item["Supplier Id"];
        const date = item["Leaf Date"];
        const net = parseFloat(item["Net"] || 0);

        if (!supplierLastDateMap[sid] || new Date(date) > new Date(supplierLastDateMap[sid])) {
          supplierLastDateMap[sid] = date;
        }

        if (!supplierTotalKgMap[sid]) supplierTotalKgMap[sid] = 0;
        supplierTotalKgMap[sid] += net;
      });

      const enrichedSuppliers = allSuppliersRaw.map(supplier => {
        const sid = supplier["Supplier Id"];
        return {
          ...supplier,
          last_supply_date: supplierLastDateMap[sid] || "-",
          total_supplied_kg: supplierTotalKgMap[sid]?.toFixed(0) || "0.00"
        };
      });

      setAllSuppliers(enrichedSuppliers);
    } catch (err) {
      toast.error("❌ Failed to load leaf collection or supplier data");
    } finally {
      dispatch(hideLoader());
    }
  };

  const lastSupplyColumns = [
    {
      title: "Supplier ID",
      dataIndex: "Supplier Id",
      key: "Supplier Id",
      render: text => (
        <span style={{
          background: "#8b5400ff", color: "#fff", padding: "6px 12px",
          borderRadius: "24px", fontWeight: 600, fontSize: 13, display: "inline-block",
          minWidth: "60px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
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
      dataIndex: "Supplier Name",
      key: "Supplier Name",
      sorter: (a, b) => a["Supplier Name"].localeCompare(b["Supplier Name"]),
      filters: Array.from(new Set(allSuppliers.map(s => s["Supplier Name"])))
        .sort()
        .map(name => ({ text: name, value: name })),
      onFilter: (value, record) =>
        record["Supplier Name"]?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Mobile",
      dataIndex: "Contact",
      key: "Contact",
    },
    {
      title: "Last Supplied On",
      dataIndex: "last_supply_date",
      key: "last_supply_date",
      sorter: (a, b) =>
        new Date(a.last_supply_date) - new Date(b.last_supply_date),
    },
    {
      title: "Total Supplied (kg)",
      dataIndex: "total_supplied_kg",
      key: "total_supplied_kg",
      align: "center",
      sorter: (a, b) => parseFloat(a.total_supplied_kg) - parseFloat(b.total_supplied_kg),
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#ffffffff" }}>
          {parseFloat(text).toFixed(0)}
        </span>
      )
    },
    {
      title: "Inactive For",
      key: "inactive_for",
      render: (_, record) => {
        if (!record.last_supply_date || record.last_supply_date === "-") return "-";

        const lastDate = dayjs(record.last_supply_date);
        const now = dayjs();

        const years = now.diff(lastDate, "year");
        const months = now.diff(lastDate.add(years, "year"), "month");
        const days = now.diff(lastDate.add(years, "year").add(months, "month"), "day");

        const parts = [];
        if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
        if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
        if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

        return parts.length > 0 ? parts.join(" ") : "0 days";
      },
      sorter: (a, b) => {
        const getTotalDays = (d) => (!d || d === "-") ? -1 : dayjs().diff(dayjs(d), "day");
        return getTotalDays(a.last_supply_date) - getTotalDays(b.last_supply_date);
      }
    }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} className="fade-in">
      <Card bordered={false} style={{ background: "rgba(0, 0, 0, 0.6)", color: "#fff", borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col md={1}>
            <Button
              icon={<ReloadOutlined />}
              danger
              type="primary"
              block
              onClick={() => {
                setFilters({ line: "All" });
                setAllSuppliers([]);
              }}
            />
          </Col>

          <Col md={4}>
            <Select
              showSearch
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
            <Button type="primary" block onClick={getLeafRecordsByRoutes}>
              Get Supplier History
            </Button>
          </Col>

          <Col md={4}>
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search by ID or Name"
              style={{
                width: "100%",
                backgroundColor: "rgb(0, 0, 0)",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {!isLoading && allSuppliers.length > 0 && (
        <Card size="small" style={{ marginTop: 12, background: "rgba(0, 0, 0, 0.6)", borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            className="sup-bordered-table"
            columns={lastSupplyColumns}
            dataSource={allSuppliers.filter(s =>
              s["Supplier Name"]?.toLowerCase().includes(searchText.toLowerCase()) ||
              s["Supplier Id"]?.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey={record => record["Supplier Id"]}
            pagination={{ pageSize: 10000 }}
            rowClassName={(record) =>
              isInactiveOverMonths(record.last_supply_date) ? "inactive-row" : ""
            }
          />
        </Card>
      )}

      {isLoading && <CircularLoader />}
    </div>
  );
};

export default LastSupply;
