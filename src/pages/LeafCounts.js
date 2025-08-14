import React, { useRef, useState, useMemo } from "react";
import { Card, Col, Row, Button, Select, Input, Table, InputNumber } from "antd";
import { DatePicker } from "antd";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { deleteLeafCount, createOrUpdateLeafCount, getAllLeafCounts, getLeafCountByLineMonthYear, getLeafCountsByMonthYear } from "../api/api";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SearchRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import { Modal } from "antd";
import CustomConfirmationModal from "../components/CustomConfirmationModal";
const { confirm } = Modal;
const { Option } = Select;
const LeafCount = () => {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const lineLeafCounts = useRef();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const lineIdCodeMap = useSelector((state) => state.officerLine.allLines);

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", search: '', officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);

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
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record, index) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setDeleteRowIndex(index);
            handleDeleteClick(index)
          }}
        >
          Delete
        </Button>
      ),
    }
  ];


  const [newDate, setNewDate] = useState(currentDate); // 🆕 added

  const handleDeleteRow = async (index) => {
    const deletedItem = lineLeafCounts.current[index];
    try {
      dispatch(showLoader());
      setLoading(true);
      await deleteLeafCount(
        deletedItem.lineCode,
        filters.year,
        filters.month
      );
      const updated = [...lineLeafCounts.current];
      updated.splice(index, 1);
      lineLeafCounts.current = updated;
      toast.success(`Deleted entry for line ${deletedItem.lineCode}`);
      await getLeafCount();
    } catch (error) {
      toast.error("Failed to delete row");
    } finally {
      setLoading(false);
      dispatch(hideLoader());
    }
  };


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
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 30);
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


  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newYear, setNewYear] = useState(currentYear);
  const [newMonth, setNewMonth] = useState(currentMonth);
  // state
  const [search, setSearch] = useState("");
  // { [lineCode]: { b, bb, p } }
  const [leafCounts, setLeafCounts] = useState({});

  // filter lines by search
  const filteredLines = useMemo(() => {
    const q = search.trim().toLowerCase();


    if (!q) return lineIdCodeMap;

    return lineIdCodeMap.filter(l =>
      l.lineCode.toLowerCase().includes(q)
    );
  }, [search, lineIdCodeMap]);


  const clearLeafCounts = () => {
    setLeafCounts({});
  };



  // set value helper
  const setLineValue = (lineCode, field, val) => {
    setLeafCounts(prev => {
      const prevLine = prev[lineCode] || { b: 0, bb: 0, p: 0 };

      // Copy existing
      let updatedLine = { ...prevLine, [field]: val };

      // Auto-calc P if B or BB changes
      if (field === "b" || field === "bb") {
        const bVal = field === "b" ? val : prevLine.b ?? 0;
        const bbVal = field === "bb" ? val : prevLine.bb ?? 0;
        updatedLine.p = Math.max(0, 100 - (Number(bVal) || 0) - (Number(bbVal) || 0));
      }

      return {
        ...prev,
        [lineCode]: updatedLine
      };
    });
  };

  const [confirmOpen, setConfirmOpen] = useState(false);


  const [deleteRowIndex, setDeleteRowIndex] = useState();



  const handleDeleteClick = (index) => {
    setDeleteRowIndex(index);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {

    handleDeleteRow(deleteRowIndex);
    setConfirmOpen(false);
    getLeafCount()
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const ensureValidBeforeSubmit = () => {
    if (!newDate) {
      toast.error("Please select a date first.");
      return false;
    }
    return true;
  };

  const handleSubmitLeafCounts = async () => {
    try {
      dispatch(showLoader());


      Object.entries(leafCounts).forEach(async ([lineCode, { b, bb, p }]) => {
        const lineInfo = lineIdCodeMap.find(l => l.lineCode === lineCode);
        const lineId = lineInfo?.lineId || null;


        await createOrUpdateLeafCount({
          year: newYear,
          month: newMonth,
          lineCode,
          B: b,
          BB: bb,
          P: p
        });


      });




      toast.success("Values logged successfully.");
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to log values");
    } finally {
      clearLeafCounts()
      dispatch(hideLoader());
    }
  };


  return (
    <>
      <CustomConfirmationModal
        open={confirmOpen}
        title="Delete Leaf Record"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Modal
        title="Add Leaf Counts"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => {
          if (!ensureValidBeforeSubmit()) return;
          handleSubmitLeafCounts(); // your existing submit
        }}
        okText="Submit"
        cancelText="Cancel"
        width={600}
      >
        <Row gutter={24} style={{ marginBottom: 16 }}>

          <Col span={12}>
            <DatePicker
              value={newDate ? dayjs(newDate) : null}
              onChange={(date) => setNewDate(date ? date.format("YYYY-MM-DD") : null)}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              placeholder="Select Date"
            />
          </Col>

          <Col span={12}>
            <Input
              placeholder="Search line code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              bordered
              style={{
                width: "100%",
                height: 40,
                borderRadius: 10,
                border: "1px solid black",
              }}
            />
          </Col>
        </Row>
        <Row gutter={24} style={{ marginBottom: 16 }}>




          <Col span={6}>
            <span
              style={{
                background: "#ffffffff",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 24,
                fontWeight: 500,
                fontSize: 14,
                display: "inline-block",
                minWidth: 60,
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(255, 255, 255, 0.15)",
              }}

            >


            </span>
          </Col>

          <Col span={6}>
            <span
              style={{
                background: "#002c6dff",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 24,
                fontWeight: 300,
                fontSize: 14,
                minWidth: 60,
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(255, 255, 255, 0.15)",
              }}

            >

              B %
            </span>
          </Col>

          <Col span={6}>

            <span
              style={{
                background: "#002c6dff",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 24,
                fontWeight: 300,
                fontSize: 14,
                minWidth: 60,
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(255, 255, 255, 0.15)",
              }}

            >

              BB %
            </span>
          </Col>

          <Col span={6}>
            <span
              style={{
                background: "#ff0000b7",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 24,
                fontWeight: 300,
                fontSize: 14,
                minWidth: 60,
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(255, 255, 255, 0.15)",
              }}

            >

              P %
            </span>

          </Col>

        </Row>
        <Row gutter={[16, 16]}>


          {filteredLines.map((line, key) => {
            const target = leafCounts[line.lineCode] || {};
            return (
              <React.Fragment key={key}>
                <Col span={6}>
                  <span
                    style={{
                      background: "#00461fff",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 24,
                      fontWeight: 500,
                      fontSize: 14,
                      display: "inline-block",
                      minWidth: 60,
                      textAlign: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                    }}
                    title={line.lineName || ""}
                  >
                    {line.lineCode} {line.lineName ? `- ${line.lineName}` : ""}
                  </span>
                </Col>

                <Col span={6}>
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="B (%)"
                    style={{
                      width: "100%",
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "1px solid #333",
                      borderRadius: 6,
                    }}
                    value={target.b ?? null}
                    onChange={(val) => setLineValue(line.lineCode, "b", val)}
                    controls={false}
                  />
                </Col>

                <Col span={6}>
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="BB (%)"
                    style={{
                      width: "100%",
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "1px solid #333",
                      borderRadius: 6,
                    }}
                    value={target.bb ?? null}
                    onChange={(val) => setLineValue(line.lineCode, "bb", val)}
                    controls={false}
                  />
                </Col>

                <Col span={6}>
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="P (%)"
                    style={{
                      width: "100%",
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "1px solid #333",
                      borderRadius: 6,
                    }}
                    value={target.p ?? null}
                    onChange={(val) => setLineValue(line.lineCode, "p", val)}
                    controls={false}
                  />
                </Col>
              </React.Fragment>
            );
          })}
        </Row>
      </Modal>




      <div style={{ height: "100%", display: "flex", flexDirection: "column" }} className="fade-in">
        <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
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

                  <Col md={4}>
                    <Button
                      type="primary"
                      onClick={() => setAddModalOpen(true)}

                    >
                      Add New
                    </Button>

                  </Col>
                </Row>
              </Col>
            </Row>

          </Card>
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }} className="fade-in">

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
          </div>            <div />

        </div>
      </div> </>
  );
};

export default LeafCount;