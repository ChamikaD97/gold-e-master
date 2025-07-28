import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Row,
  Input,
  Col,
  DatePicker,
  Button,
  Table,
  message
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { SearchRounded } from "@mui/icons-material";
import dayjs from "dayjs";
import CircularLoader from "../components/CircularLoader";
import lineIdCodeMap from "../data/lineIdCodeMap.json";
import bankIdCodes from "../data/bankIdCodes.json";
import { API_KEY } from "../api/api";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { toast } from 'react-toastify';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const SupplierInfo = () => {
  const [supplier, setSupplier] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs()
  ]);
  const [filters, setFilters] = useState({
    searchById: "",
  });
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const supplierId = useSelector((state) => state.commonData?.selectedSupplierId);

  const { isLoading } = useSelector((state) => state.loader);

  const [totals, setTotals] = useState({ super: 0, normal: 0 });

  const fetchSupplierDataFromId = async (supId) => {
    const id = supId?.toString().trim().padStart(5, "0");

    if (!id || id.length !== 5) {
      toast.warning("⚠️ Please enter a valid 5-digit Supplier ID");
      return;
    }

    dispatch(showLoader());
    dispatch(setSelectedSupplier(id));
    setSupplier(null);
    setData([]);

    const url = `/quiX/ControllerV1/supdata?k=${API_KEY}&s=${id}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch supplier data");

      const result = await response.json();
      const supplierData = Array.isArray(result) ? result[0] : result;

      if (supplierData) {
        setSupplier(supplierData);
        toast.success(`Supplier ID ${id} loaded successfully`);
      } else {
        toast.warning(`No supplier data found for ID ${id}`);
      }
    } catch (err) {
      toast.error("Failed to load supplier data");
      setSupplier(null);
    } finally {
      dispatch(hideLoader());
    }
  };


  useEffect(() => {
    if (supplierId && supplierId.length === 5) {
      dispatch(showLoader());
      setFilters({ searchById: supplierId });  // Set the search input to the supplier ID
      fetchSupplierDataFromId(supplierId);  // Fetch supplier data when component mounts or supplierId changes    
      dispatch(hideLoader());

    }
  }, []);



  const lineIdToCodeMap = (id) => {
    const record = lineIdCodeMap.find(item => parseInt(item.lineId) === id);
    return record?.lineCode || "Unknown";
  };

  const bankIdToCode = (id) => {
    const record = bankIdCodes.find(item => parseInt(item.Bank) === id);
    return record?.Name || "Unknown";
  };

  const getLeafRecordsByDates = async (supId, range) => {
    dispatch(showLoader())
    const id = supId?.toString().padStart(5, "0").trim();
    const formattedDates = range.map(date => dayjs(date).format("YYYY-MM-DD"));
    const dd = `${formattedDates[0]}~${formattedDates[1]}`;
    const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&s=${id}&d=${dd}`;
    setData([]);
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

      // ✅ Calculate total Normal and Super leaf net_kg
      const totals = transformed.reduce(
        (acc, item) => {
          if (item.leaf_type === "Super") acc.super += item.net_kg;
          else acc.normal += item.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );
      const calculatedTotals = transformed.reduce(
        (acc, item) => {
          if (item.leaf_type === "Super") acc.super += item.net_kg;
          else acc.normal += item.net_kg;
          return acc;
        },
        { super: 0, normal: 0 }
      );
      setTotals(calculatedTotals);
      if (transformed.lenth == 0) {
        toast.warning(`⚠️ No  leaf records data found for ID`);
      }
      setData(transformed);
    } catch (err) {
      message.error("❌ Failed to load leaf records");
      setData([]);
    } finally {
      dispatch(hideLoader());
    }
  };


  const cardStyle = {
    background: "rgba(0, 0, 0, 0.65)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  };

  const labelStyle = { fontWeight: 600, color: "#bbb", width: 130 };
  const valueStyle = { color: "#fff" };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} className="fade-in">
      {/* Search Bar */}
      <Row gutter={[8, 8]} justify="center">
        <Col md={12}>
          <Card bordered={false} style={cardStyle}>
            <Row gutter={[8, 8]} align="middle">
              <Col md={6}>
                <Text style={{ color: "#fff" }}>Search By Id</Text>
              </Col>
              <Col span={14}>
                <Input
                  value={filters.searchById}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchById: e.target.value }))
                  }
                  onPressEnter={() => fetchSupplierDataFromId(filters.searchById)}
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
              <Col span={2}>

                <Button
                  icon={<SearchRounded />}
                  type="primary"
                  onClick={() => fetchSupplierDataFromId(filters.searchById)}
                />
              </Col>
              <Col md={2}>
                <Button
                  icon={<ReloadOutlined />}
                  danger
                  type="primary"
                  block
                  onClick={() => {
                    setSupplier(null)
                    setData([]);
                    setFilters({ searchById: "" });
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Supplier Info */}
      {!isLoading && supplier && (
        <>
          <Row gutter={[16, 8]} justify="space-evenly">
            <Col md={3}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>Id</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{supplier["Supplier Id"]}</Text>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>Line</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{lineIdToCodeMap(supplier["Route"])}</Text>
                </div>
              </Card>
            </Col>
            <Col md={6}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>Supplier Name</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{supplier["Supplier Name"]}</Text>
                </div>
              </Card>
            </Col>
            <Col md={4}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>NIC</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{supplier["NIC"]}</Text>
                </div>
              </Card>
            </Col>
            <Col md={4}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>Contact</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{supplier["Contact"]}</Text>
                </div>
              </Card>
            </Col>
            <Col md={4}>
              <Card bordered={false} style={cardStyle}>
                <Text style={labelStyle}>Joined Date</Text>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Text style={valueStyle}>{dayjs(supplier["Joined Date"]).format("YYYY-MM-DD")}</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {supplier["Pay"] === 2 && (
            <Row gutter={[16, 8]} style={{ marginTop: 16 }}>
              <Col md={8}>
                <Card bordered={false} style={cardStyle}>
                  <Text style={labelStyle}>Bank</Text>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Text style={valueStyle}>{bankIdToCode(supplier["Bank"])}</Text>
                  </div>
                </Card>
              </Col>
              <Col md={8}>
                <Card bordered={false} style={cardStyle}>
                  <Text style={labelStyle}>Bank A/C</Text>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Text style={valueStyle}>{supplier["Bank AC"]}</Text>
                  </div>
                </Card>
              </Col>
              <Col md={8}>
                <Card bordered={false} style={cardStyle}>
                  <Text style={labelStyle}>Pay Mode</Text>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Text style={valueStyle}>{supplier["Pay"] === 1 ? "Cash" : "Bank"}</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          )}


        </>
      )}

      {/* Leaf Data Table */}
      {supplier && !isLoading > 0 && (


        <Card bordered={false} style={cardStyle}>          <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card bordered={false} style={cardStyle}>
              <Text style={{ color: "#ccc" }}>Select From - To Dates</Text>
              <RangePicker
                style={{ marginTop: 8, width: "100%" }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                allowClear
              />
              <Button
                type="primary"
                block
                style={{ marginTop: 16 }}
                onClick={() => {
                  if (dateRange.length === 2) {
                    getLeafRecordsByDates(filters.searchById, dateRange);
                  }
                }}
                disabled={dateRange.length !== 2}
              >
                Get Leaf Records
              </Button>
            </Card>
          </Col>
        </Row>


          {!isLoading && data.length > 0
            &&
            (
              <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Card bordered={false} style={cardStyle}>
                    {/* Summary Header */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                      <Col>
                        <Text style={{ color: "#ccc", fontSize: 18, fontWeight: 600 }}>
                          Leaf Records Summary
                        </Text>
                        <div>
                          <Text style={{ color: "#bbb", fontSize: 15 }}>
                            Date Range:&nbsp;
                            <strong>{dayjs(dateRange[0]).format("YYYY-MM-DD")}</strong> to&nbsp;
                            <strong>{dayjs(dateRange[1]).format("YYYY-MM-DD")}</strong>
                          </Text>
                        </div>
                      </Col>
                      <Col>
                        <Card bordered={false} style={cardStyle}>
                          <Text style={{ fontSize: 16, color: "#fff" }}>
                            <span
                              style={{
                                backgroundColor: "#ffa347",
                                padding: "4px 8px",
                                borderRadius: 6, color: "#000",
                                fontWeight: "bold",
                                marginRight: 8,
                                display: "inline-block",
                              }}
                            >
                              Super Total: {totals.super.toFixed(0)} kg
                            </span>

                            <span
                              style={{
                                backgroundColor: "#47a3ff", // Blue for normal
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontWeight: "bold",
                                marginRight: 8,
                                display: "inline-block", color: "#000",
                              }}
                            >
                              Normal Total: {totals.normal.toFixed(0)} kg
                            </span>

                            <span
                              style={{
                                backgroundColor: "#28a745", // Orange for combined total
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontWeight: "bold", color: "#000",
                                display: "inline-block",
                              }}
                            >
                              Total: {(totals.super + totals.normal).toFixed(0)} kg
                            </span>
                          </Text>
                        </Card>
                      </Col>

                    </Row>

                    {/* Table */}

                    {!isLoading && data.length > 0
                      && <Table
                        className="sup-bordered-table"
                        dataSource={data}
                        columns={[
                          { title: "Leaf Date", dataIndex: "date", key: "date" },
                          {
                            title: "Leaf Type",
                            dataIndex: "leaf_type",
                            key: "leaf_type",
                            render: (val) => (
                              <span
                                style={{
                                  background: val === "Super" ? "#ffa347" : "#1890ff", // gold for Super, blue for Normal
                                  fontWeight: "bold",
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
                              >

                                {val === "Super" ? "Super" : "Normal"}
                              </span>
                            )
                          }
                          ,
                          { title: "Net KG", dataIndex: "net_kg", key: "net_kg" },
                          { title: "Gross Weight", dataIndex: "gross_weight", key: "gross_weight" },
                          { title: "Full Weight", dataIndex: "full_weight", key: "full_weight" },
                          { title: "Bag Count", dataIndex: "bag_count", key: "bag_count" },
                          { title: "Bag Weight", dataIndex: "bag_weight", key: "bag_weight" },
                          { title: "Trp Add", dataIndex: "trp_add", key: "trp_add" },
                          { title: "Trp Ded", dataIndex: "trp_ded", key: "trp_ded" },
                          { title: "Total Ded", dataIndex: "total_ded", key: "total_ded" },
                        ]}
                        rowKey={(record, index) => index}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: true }}
                      />


                    }


                    {isLoading
                      && <CircularLoader />



                    }
                  </Card>
                </Col>
              </Row>)

          }


        </Card>


      )}

      {isLoading
        && <CircularLoader />}
    </div>
  );
};

export default SupplierInfo;
