import React, { useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Input, Table, InputNumber } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { deleteLeafCount, createOrUpdateLeafCount,getAllLeafCounts,getLeafCountByLineMonthYear, getLeafCountsByMonthYear } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import CountUp from "react-countup";
const { Option } = Select;
const LeafCount = () => {

  const dispatch = useDispatch();
  const [routeSummary, setRouteSummary] = useState([]);





  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lineLeafCounts = useRef();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTargets, setNewTargets] = useState([{ lineCode: "", target: null }]);
  const [newYear, setNewYear] = useState(currentYear);
  const [newMonth, setNewMonth] = useState(currentMonth);

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", search: '', officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);
  const allMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const filteredData = Array.isArray(lineLeafCounts.current)
    ? lineLeafCounts.current
      .filter(item => {
        const search = filters.search?.toLowerCase() || "";
        return (
          item.lineCode?.toLowerCase().includes(search)

        );
      })
      .map((item, index) => ({ ...item, key: index }))
    : [];



  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newTargetValue, setNewTargetValue] = useState(null);

 const targetColumns = [
  {
    title: "Line Code",
    dataIndex: "lineCode",
    key: "lineCode",
    render: text => (
      <span
        style={{
          background: "#8b5400ff",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "24px",
          fontWeight: 400,
          fontSize: 15,
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
    title: "B (%)",
    dataIndex: "B",
    key: "B",
    align: "center",
    render: text => (
      <span
        style={{
          background: "#005b96",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "16px",
          fontWeight: 500,
          fontSize: 15,
          display: "inline-block",
          minWidth: "50px",
          textAlign: "center",
        }}
      >
        {text}%
      </span>
    )
  },
  {
    title: "BB (%)",
    dataIndex: "BB",
    key: "BB",
    align: "center",
    render: text => (
      <span
        style={{
          background: "#008b8b",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "16px",
          fontWeight: 500,
          fontSize: 15,
          display: "inline-block",
          minWidth: "50px",
          textAlign: "center",
        }}
      >
        {text}%
      </span>
    )
  },
  {
    title: "P (%)",
    dataIndex: "P",
    key: "P",
    align: "center",
    render: text => (
      <span
        style={{
          background: "#a52a2a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "16px",
          fontWeight: 500,
          fontSize: 15,
          display: "inline-block",
          minWidth: "50px",
          textAlign: "center",
        }}
      >
        {text}%
      </span>
    )
  }
];





 

  


  const getLeafCount = async () => {
    try {
      dispatch(showLoader());
      setLoading(true)
      const data = await getLeafCountsByMonthYear(filters.year, filters.month);

      if (Array.isArray(data)) {

        

        lineLeafCounts.current = data;


      } else {
        lineLeafCounts.current = [];
        toast.warn("Leaf Count data is not in expected format");
      }

    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("❌ Failed to fetch leaf data");
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



    <>

 
 



      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">

          <Col>

          </Col>
          <Card bordered={false} style={cardStyle}>
            <Row justify="space-evenly" gutter={[16, 16]}>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8} md={1}>
                    <Button
                      icon={<ReloadOutlined />}
                      type="primary"
                      block
                      danger
                      onClick={() => {
                        lineLeafCounts.current = [];
                       
                        
                        setFilters({
                          year: "Select Year",
                          month: "Select Month",
                          officer: "All",
                          line: "Select Line",
                          lineCode: '',
                          officer: '',
                          search: '', // 🔥 add this
                        });
                      }}

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
                      {allMonths.map(m => (
                        <Option key={m} value={m}>{monthMap[m]}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col md={3}>

                    <Button
                      icon={<SearchRounded />}
                      type="primary"
                      onClick={() => getLeafCount()}
                    />
                  </Col>


                  <Col md={4}>
                    <Input
                      className="custom-supplier-input"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}


                      placeholder="Search by ID or Name"
                      style={{
                        width: "100%",
                        backgroundColor: "rgb(0, 0, 0)",
                        color: "#fff",
                        border: "1px solid #333",
                        borderRadius: 6
                      }}
                      allowClear
                    />
                  </Col>

                </Row>
              </Col>
            </Row>

          </Card>
          {lineLeafCounts > 0 && (
            <Card bordered={false} style={cardStyle}>
              <Row justify="space-evenly" gutter={[16, 16]}>
                <Col span={24}>
                  <Row gutter={[16, 16]}>


                    <Col md={12}>
                      <div style={{ fontWeight: 'normal', fontSize: 20 }}>
                        Leaf Count for {filters.year} {monthMap[filters.month] || filters.month}
                      </div>
                    </Col>




                  </Row>
                </Col>
              </Row>

            </Card>
          )}



          {loading && <CircularLoader />}
          {Array.isArray(lineLeafCounts.current) && lineLeafCounts.current.length > 0 && (
            <Card



              style={cardStyle}
              headStyle={{ color: "#fff" }}
            >
              <Table
                className="sup-bordered-table"
                dataSource={filteredData}
                columns={targetColumns}
                pagination={false}
                bordered
                size="middle"

              />
            </Card>
          )}


        </div>
      </div> </>
  );
};

export default LeafCount;