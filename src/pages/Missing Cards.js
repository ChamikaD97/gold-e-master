import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select,
  Typography, DatePicker, Table
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import dayjs from "dayjs";

const MissingCards = () => {
  const { Option } = Select;
  const dispatch = useDispatch();

  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [filters, setFilters] = useState({ line: "All" });
  const [suppliers, setSuppliers] = useState([]);
  const [allSupplierList, setAllSupplierList] = useState([]);
  const [supplierWithDataList, setSupplierWithDataList] = useState([]);
  const [missingSupplierList, setMissingSupplierList] = useState([]);
  const [error, setError] = useState(null);

  const apiKey = "quix717244";

  const lineIdToCodeMap = useMemo(() => {
    const map = {};
    lineIdCodeMap.forEach(item => {
      map[item.lineId] = item.lineCode;
    });
    return map;
  }, []);

  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMap
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];

  const getMissingCards = async () => {
    if (filters.line === "All") {
      setError("Please select a specific line to check for missing cards.");
      return;
    }

    dispatch(showLoader());
    const from = dateRange[0].format("YYYY-MM-DD");
    const to = dateRange[1].format("YYYY-MM-DD");
    const rangeParam = `${from}~${to}`;

    try {
      const supUrl = `/quiX/ControllerV1/supdata?k=${apiKey}&r=${filters.line}`;
      const supRes = await fetch(supUrl);
      const allSuppliers = await supRes.json();

      const leafUrl = `/quiX/ControllerV1/glfdata?k=${apiKey}&r=${filters.line}&d=${rangeParam}`;
      const leafRes = await fetch(leafUrl);
      const leafRecords = await leafRes.json();

      const suppliersWithData = new Set(leafRecords.map(r => r["Supplier Id"]));

      const withData = Array.from(suppliersWithData)
        .map(id => {
          const found = allSuppliers.find(s => s["Supplier Id"] === id);
          return found ? { id: found["Supplier Id"], name: found["Supplier Name"] } : null;
        })
        .filter(Boolean);

      const missing = allSuppliers
        .filter(s => !suppliersWithData.has(s["Supplier Id"]))
        .map(s => ({ id: s["Supplier Id"], name: s["Supplier Name"] }));

      setAllSupplierList(allSuppliers.map(s => ({ id: s["Supplier Id"], name: s["Supplier Name"] })));
      setSupplierWithDataList(withData);
      setMissingSupplierList(missing);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch missing cards");
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

  const columns = [
    {
      title: "Supplier ID",
      dataIndex: "id",
      key: "id",
      width: 100
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name"
    }
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={cardStyle}>
        <Row gutter={[16, 16]}>
          <Col md={1}>
            <Button
              icon={<ReloadOutlined />}
              danger
              type="primary"
              block
              onClick={() => {
                setFilters({ line: "All" });
                setAllSupplierList([]);
                setSupplierWithDataList([]);
                setMissingSupplierList([]);
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
          <Col md={8}>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(range) => setDateRange(range)}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </Col>
          <Col md={4}>
            <Button type="primary" block onClick={getMissingCards}>
              Get Missing Cards
            </Button>
          </Col>
        </Row>
      </Card>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Row gutter={16}>
        <Col span={8}>
          <Card title={allSupplierList?.length} size="small">
            <Table
              dataSource={allSupplierList}
              columns={columns}
              size="small"
              pagination={{ pageSize: 8 }}
              rowKey="id"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={supplierWithDataList?.length} size="small">
            <Table
              dataSource={supplierWithDataList}
              columns={columns}
              size="small"
              pagination={{ pageSize: 8 }}
              rowKey="id"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={missingSupplierList?.length} size="small">
            <Table
              dataSource={missingSupplierList}
              columns={columns}
              size="small"
              pagination={{ pageSize: 8 }}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MissingCards;
