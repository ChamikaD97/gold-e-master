import React, { useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Progress, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, fetchMonthlyTargets, getMonthDateRangeFromParts } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import CountUp from "react-countup";
const { Option } = Select;
const Targets = () => {

  const dispatch = useDispatch();
  const [routeSummary, setRouteSummary] = useState([]);





  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const targetsN = useRef();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);



  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);





  const targetColumns = [
    {
      title: "Line Code",
      dataIndex: "lineCode",
      key: "lineCode",
    },
    {
      title: "Target (Kg)",
      dataIndex: "target",
      key: "target",
      align: "right",
    },

  ];


  const getOfficerByLineCode = (lineCode) => {
    const entry = lineIdCodeMap.find(item => item.lineCode === lineCode);
    return entry?.officer || "Unknown";
  };

  const getMergedMap = () => {
    const map = {};
    lineIdCodeMap.forEach(item => {
      const mergedCode = item.lineCode;
      const lineIds = item.lineId.split(",").map(id => id.trim());
      lineIds.forEach(id => {
        map[id] = mergedCode;
      });
    });
    return map;
  };

  const getMergeDisplayMap = () => {
    const displayMap = {};
    lineIdCodeMap.forEach(item => {
      const ids = item.lineId.split(",");
      if (ids.length > 1) {
        ids.forEach(id => {
          displayMap[item.lineCode] = item.lineCode + " (" + item.lineId + ")";
        });
      }
    });
    return displayMap;
  };

  const getTargetByLineCode = (lineCode, target) => {
    const entry = target.find(item => item.lineCode === lineCode);
    return entry ? entry.target : "";
  };




  const getTargets = async () => {
    try {
      dispatch(showLoader());
      setLoading(true)
      const data = await fetchMonthlyTargets(filters.year, filters.month);

      if (Array.isArray(data)) {
        targetsN.current = data;
        toast.success("✅ Targets loaded successfully");
      } else {
        targetsN.current = [];
        toast.warn("⚠️ Target data is not in expected format");
      }

    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("❌ Failed to fetch target data");
    } finally {
      setLoading(false)
      dispatch(hideLoader());
    }
  };





  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
        <Card bordered={false} style={cardStyle}>
          <Row justify="space-between" gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={1}>
                  <Button
                    icon={<ReloadOutlined />}
                    type="primary"
                    block
                    danger
                    onClick={


                      () => {



                        setFilters({ year: "Select Year", month: "Select Month", officer: "All", line: "Select Line", lineCode: '', officer: '' })
                      }

                    }
                  >

                  </Button>
                </Col>
                <Col md={3}>
                  <Select showSearch
                    style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}

                    value={filters.year}
                    bordered={false} onChange={val => setFilters(f => ({ ...f, year: val, month: "Select Month" }))}>

                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      );
                    })}



                  </Select>
                </Col>
                <Col md={3}>
                  <Select
                    showSearch
                    value={filters.month}
                    onChange={val => setFilters(prev => ({ ...prev, month: val }))}
                    style={{ width: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#000", border: "1px solid #333", borderRadius: 6 }}
                    bordered={false}
                  >
                    {filteredMonths.map(m => (
                      <Option key={m} value={m}>{monthMap[m]}</Option>
                    ))}
                  </Select>
                </Col>
                <Col md={3}>

                  <Button
                    icon={<SearchRounded />}
                    type="primary"
                    onClick={() => getTargets()}
                  />
                </Col>


              </Row>
            </Col>
          </Row>
        </Card>

        {loading && <CircularLoader />}
        {Array.isArray(targetsN.current) && targetsN.current.length > 0 && (
          <Card


            style={{ marginTop: 20, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 10 }}
            headStyle={{ color: "#fff" }}
          >
            <Table
              className="sup-bordered-table"
              dataSource={targetsN.current.map((item, index) => ({ ...item, key: index }))}
              columns={targetColumns}
              pagination={false}
              bordered
              size="middle"

            />
          </Card>
        )}


      </div>
    </div>
  );
};

export default Targets;