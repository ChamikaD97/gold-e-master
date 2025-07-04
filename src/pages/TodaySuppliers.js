import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Select,
  Typography, DatePicker, Table
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import dayjs from "dayjs";
import { API_KEY } from "../api/api";
import '../App.css';

const TodaySuppliers = () => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const leafRound = useSelector((state) => state.commonData?.leafRound);

  const [filters, setFilters] = useState({ line: "All" });
  const [supplierWithDataList, setSupplierWithDataList] = useState([]);



  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMap
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];
  const getTodaySuppliers = async () => {
    if (!leafRound || isNaN(leafRound)) {
      return;
    }
    dispatch(showLoader());
    try {
      const today = dayjs();
      const startDate = today.subtract(leafRound, "day").format("YYYY-MM-DD");
      const dateRange = `${startDate}`;
      const lineId = filters.line;

      // 1. Fetch leaf records
      const leafDataUrl = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${lineId}&d=${dateRange}`;
      const response = await fetch(leafDataUrl);

      if (!response.ok) throw new Error("Failed to fetch leaf records");
      const result = await response.json();
      console.log(result);

      // 2. Group by supplier and calculate total super/normal
      const leafMap = {};
      result.forEach(item => {
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

        if (isSuper) {
          leafMap[supId].super_kg += net;
        } else {
          leafMap[supId].normal_kg += net;
        }

        // Update latest date if newer
        const current = dayjs(item["Leaf Date"]);
        const existing = dayjs(leafMap[supId].lastDate);
        if (current.isAfter(existing)) {
          leafMap[supId].lastDate = item["Leaf Date"];
        }
      });

      const supplierIdsWithData = Object.keys(leafMap);

      // 3. Fetch all suppliers
      const allSuppliersUrl = `/quiX/ControllerV1/supdata?k=${API_KEY}&r=${lineId}`;
      const allResponse = await fetch(allSuppliersUrl);
      if (!allResponse.ok) throw new Error("Failed to fetch supplier list");

      const allSuppliersData = await allResponse.json();
      const allSuppliers = allSuppliersData.map(sup => ({
        id: sup["Supplier Id"],
        name: sup["Supplier Name"],
        address: sup["Address"],
        tel: sup["Contact"],
        lineCode: filters.lineCode || ""
      }));

      // 4. Filter and combine leaf data
      const withData = allSuppliers
        .filter(sup => supplierIdsWithData.includes(sup.id))
        .map(sup => ({
          ...sup,
          ...leafMap[sup.id]  // merge super_kg, normal_kg, lastDate
        }));

      console.log("Suppliers with Leaf Data:", withData);
      setSupplierWithDataList(withData);
    } catch (err) {
      console.error("Error fetching today suppliers:", err);
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
    }, {
      title: "Super (kg)",
      dataIndex: "super_kg",
      key: "super_kg",
      align: "center",
      width: 110,
      render: text => (
        <span
          style={{
            background: "#ffa347",
            color: "#000",
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
          {text} kg
        </span>
      )
    },
    {
      title: "Normal (kg)",
      dataIndex: "normal_kg",
      key: "normal_kg",
      align: "center",
      width: 110,
      render: text => (
        <span
          style={{
            background: "#47a3ff",
            color: "#000",
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
          {text} kg
        </span>
      )
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
            background: "linear-gradient(135deg, #C6F6D5,rgb(0, 255, 55))",
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

    ,//Supplier ID	Super (kg)	Normal (kg)	Total (kg)
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
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

                setSupplierWithDataList([]);
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

          <Col md={4}>
            <Button type="primary" block onClick={getTodaySuppliers}>
              Today
            </Button>
          </Col>


        </Row>


      </Card>
      <Card bordered={false} style={cardStyle}>
                      {(
                        <Table
                          className="red-bordered-table"
                         dataSource={supplierWithDataList}
                columns={columns}
                          pagination={false}
                          scroll={{ x: "max-content", y: 400 }} // ✅ vertical scroll to fix header
                          bordered
                          size="small"
                          rowKey="supplier_id"
                        />
      
                      )}
                    </Card>
      <Card bordered={false} style={cardStyle}>
        <Row gutter={16}>


          <Col md={18}>
            <Card size="small">
              <Table
                dataSource={supplierWithDataList}
                columns={columns}
                size="small"
                pagination={{ pageSize: 8 }}
                rowKey="id"
                className="red-bordered-table"
                bordered
              />
            </Card>
          </Col>


        </Row>

      </Card>

    </div>
  );
};

export default TodaySuppliers;
