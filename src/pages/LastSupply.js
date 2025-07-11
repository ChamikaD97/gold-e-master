import React, { useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select, Table,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY } from "../api/api";
import { toast } from 'react-toastify';
import dayjs from "dayjs";
import { Input } from "antd";
import CircularLoader from "../components/CircularLoader";

const LastSupply = () => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({ line: "All" });
  const [data, setData] = useState([]);
  const [remainingSuppliers, setRemainingSuppliers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const startDate = dayjs().startOf("month");
  const endDate = dayjs().endOf("month");
  const { isLoading } = useSelector((state) => state.loader);

  const [searchText, setSearchText] = useState("");


  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMap
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
      result.forEach(item => {
        const sid = item["Supplier Id"];
        const date = item["Leaf Date"];
        if (!supplierLastDateMap[sid] || new Date(date) > new Date(supplierLastDateMap[sid])) {
          supplierLastDateMap[sid] = date;
        }
      });

      const enrichedSuppliers = allSuppliersRaw.map(supplier => ({
        ...supplier,
        last_supply_date: supplierLastDateMap[supplier["Supplier Id"]] || "-"
      }));

      setAllSuppliers(enrichedSuppliers);

      const groupedMap = {};
      result.forEach(item => {
        const leafDate = new Date(item["Leaf Date"]);
        if (leafDate >= startDate.toDate() && leafDate <= endDate.toDate()) {
          const key = `${item["Supplier Id"]}_${item["Leaf Date"]}`;
          if (!groupedMap[key]) {
            groupedMap[key] = {
              supplier_id: item["Supplier Id"],
              date: item["Leaf Date"],
              lineCode: parseInt(item["Route"]),
              super_kg: 0,
              normal_kg: 0,
            };
          }
          const net = parseFloat(item["Net"] || 0);
          item["Leaf Type"] === 2
            ? groupedMap[key].super_kg += net
            : groupedMap[key].normal_kg += net;
        }
      });

      const transformed = Object.values(groupedMap).map(item => {
        const total_kg = item.super_kg + item.normal_kg;
        return {
          ...item,
          leaf_type:
            item.super_kg > 0 && item.normal_kg > 0
              ? "Both"
              : item.super_kg > 0
                ? "Super"
                : "Normal",
          total_kg: total_kg.toFixed(2),
          last_supply_date: supplierLastDateMap[item.supplier_id] || "-"
        };
      });

      const activeSupplierIds = new Set(transformed.map(item => String(item.supplier_id)));
      const remainingSuppliers = enrichedSuppliers.filter(
        sup => !activeSupplierIds.has(String(sup["Supplier Id"]))
      );

      setData(transformed);
      setRemainingSuppliers(remainingSuppliers);
    } catch (err) {
      toast.error("❌ Failed to load leaf collection or supplier data");
      console.error(err);
    } finally {
      dispatch(hideLoader());
    }
  };


  const lastSupplyColumns = [
    {
      title: "Supplier ID",
      dataIndex: "Supplier Id",
      key: "Supplier Id",
      sorter: (a, b) => a["Supplier Id"].localeCompare(b["Supplier Id"]),
    },
    {
      title: "Name",
      dataIndex: "Supplier Name",
      key: "Supplier Name",
      sorter: (a, b) => a["Supplier Name"].localeCompare(b["Supplier Name"]),
      filterSearch: true,
      onFilter: (value, record) =>
        record["Supplier Name"]?.toLowerCase().includes(value.toLowerCase()),
      filters: Array.from(new Set(allSuppliers.map(s => s["Supplier Name"])))
        .sort()
        .map(name => ({ text: name, value: name })),
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
        const getTotalDays = (d) => {
          if (!d || d === "-") return -1;
          return dayjs().diff(dayjs(d), "day");
        };
        return getTotalDays(a.last_supply_date) - getTotalDays(b.last_supply_date);
      },
    }

  ];

  return (
    <div style={{ padding: 16 }}>
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
                setData([]);
                setRemainingSuppliers([]);
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
          <Col flex="60px">
            Search          </Col>
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
        <Card
          size="small"
          bordered={false}
          style={{
            marginTop: 12,
            background: "rgba(0, 0, 0, 0.6)",
            borderRadius: 16
          }}
          bodyStyle={{ padding: 0 }}
        >
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

      {isLoading
        && <CircularLoader />



      }
    </div>
  );
};

export default LastSupply;
