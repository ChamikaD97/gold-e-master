import React, { useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Input, Table, InputNumber } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { deleteLeafCount, createOrUpdateLeafCount, getAllLeafCounts, getLeafCountByLineMonthYear, getLeafCountsByMonthYear } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import CountUp from "react-countup";
const { Option } = Select;
const LeafCount = () => {

  const dispatch = useDispatch();





  const [loading, setLoading] = useState(false);
  const lineLeafCounts = useRef();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

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
            background: "#009600ff",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "16px",
            fontWeight: 400,
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
            fontWeight: 400,
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
            fontWeight: 400,
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

  const exportToPDF = () => {
    const doc = new jsPDF();

    // ===== Header =====
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 12, 196, 12);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 22, 196, 22);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, Rotumba.nayakapura", 14, 30);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 35);
    doc.line(14, 39, 196, 39);

    // ===== Title =====
    const title = `${filters.year}-${monthMap[filters.month] || filters.month}`;
    doc.setFontSize(11);
    doc.text(`Leaf Count Summary: ${title}`, 14, 46);
    doc.line(14, 50, 196, 50);

    let startY = 56;

    // ===== Table Data =====
    const tableData = (lineLeafCounts.current || []).map((row) => {
      return [
        row.lineCode,
        `${row.B}%`,
        `${row.BB}%`,
        `${row.P}%`
      ];
    });

    // ===== Table =====
    autoTable(doc, {
      startY: startY,
      head: [["Line", "B (%)", "BB (%)", "P (%)"]],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [255, 255, 153],
        textColor: 0, // Default white
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
      },
      didParseCell: (data) => {
        const { column, cell, row, section } = data;
        const columnIndex = column.index;
        const rowIndex = row.index;

        // ✅ Header: make "Line" header text black
        if (section === 'head' && columnIndex === 0) {
          cell.styles.textColor = [0, 0, 0];
        }

        // 🟨 Highlight Line column body cells
        if (section === 'body' && columnIndex === 0) {
          cell.styles.fillColor = [255, 255, 153];
        }

        // 🎯 B / BB / P column coloring based on % value
        if (section === 'body' && columnIndex > 0) {
          const percent = parseFloat(cell.raw.replace('%', ''));
          if (percent >= 80) {
            cell.styles.fillColor = [102, 255, 153]; // green
          } else if (percent >= 50) {
            cell.styles.fillColor = [255, 255, 153]; // yellow
          } else {
            cell.styles.fillColor = [255, 153, 153]; // red
          }
          cell.styles.textColor = [0, 0, 0];
          cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: 14, right: 14 },
    });


    // ===== Footer =====
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(5);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

    // ===== Save File =====
    doc.save(`Leaf_Count_Summary_${filters.year}_${filters.month}.pdf`);
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
                  <Col md={4}>
                    <Button
                      type="primary"
                      onClick={() => exportToPDF()}
                      style={{ marginLeft: 8 }}
                    >
                      Download
                    </Button>
                  </Col>

                </Row>
              </Col>
            </Row>

          </Card>
          {Array.isArray(lineLeafCounts.current) && lineLeafCounts.current.length > 0 && (
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
                size="middle"

              />
            </Card>
          )}


        </div>
      </div> </>
  );
};

export default LeafCount;