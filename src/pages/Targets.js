import React, { useRef, useState } from "react";
import { Card, Col, Row, Button, Select, Input, Table, Modal, InputNumber } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMap from "../data/SummeryData.json";
import CircularLoader from "../components/CircularLoader";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { API_KEY, deleteTarget, fetchMonthlyTargets, getMonthDateRangeFromParts, updateTarget } from "../api/api";
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTargets, setNewTargets] = useState([{ lineCode: "", target: 0 }]);
  const [newYear, setNewYear] = useState(currentYear);
  const [newMonth, setNewMonth] = useState(currentMonth);

  const [filters, setFilters] = useState({ year: "Select Year", month: "Select Month", search: '', officer: "All", line: "Select Line", lineCode: '', officer: '' });
  const monthMap = useSelector((state) => state.commonData?.monthMap);
  const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);
  const allMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const filteredData = Array.isArray(targetsN.current)
    ? targetsN.current
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

  const handleEditRow = (index) => {
    const record = targetsN.current[index];
    setEditingRecord({ ...record, index });
    setNewTargetValue(record.target);
    setIsModalOpen(true);
  }; const handleDeleteRow = async (record) => {
    Modal.confirm({
      title: `Are you sure you want to delete target for ${record.lineCode}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          dispatch(showLoader());

          // ✅ Delete from backend
          await deleteTarget(record.lineCode, record.year, record.month);

          // ✅ Remove from local memory
          const updated = targetsN.current.filter(t =>
            t.lineCode !== record.lineCode ||
            t.year !== record.year ||
            t.month !== record.month
          );

          targetsN.current = updated;
          toast.success(`Deleted target for ${record.lineCode}`);
        } catch (error) {
          console.error("Delete failed", error);
          toast.error("❌ Failed to delete target");
        } finally {
          dispatch(hideLoader());
        }
      },
    });
  };



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
      title: "Target (Kg)",
      dataIndex: "target",
      key: "target",
      align: "center",
      render: text => (
        <span
          style={{

            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 18,
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
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record, index) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button
            type="primary"
            onClick={() => handleEditRow(index)}
            style={{
              padding: "0 10px",
              fontWeight: "normal",
              backgroundColor: "#096dd9",
              borderColor: "#096dd9",
            }}
          >
            Edit
          </Button>
          <Button
            danger
            type="primary"

            style={{
              padding: "0 10px",
              fontWeight: "normal",
            }}
            onClick={() => handleDeleteRow(record)}
          >
            Delete
          </Button>
        </div>
      ),
    }

  ];


  const [totalTarget, setTotalTarget] = useState(0);
  const [malinduwa, setMalinduwa] = useState(0);

  const handleSaveTarget = async () => {
    const { lineCode, year, month, index } = editingRecord;

    try {
      dispatch(showLoader());
      await updateTarget(lineCode, year, month, parseFloat(newTargetValue));

      const updated = [...targetsN.current];
      updated[index].target = parseFloat(newTargetValue);
      targetsN.current = updated;

      toast.success(`✅ Updated target for ${lineCode}`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update target");
    } finally {
      dispatch(hideLoader());
    }
  };





  const getTargets = async () => {
    try {
      dispatch(showLoader());
      setLoading(true)
      const data = await fetchMonthlyTargets(filters.year, filters.month);

      if (Array.isArray(data)) {
        const malinduwaData = data.filter(item => item.lineCode === "Malinduwa");

        const malinduwaTotal = malinduwaData.reduce(
          (sum, item) => sum + parseFloat(item.target || 0),
          0
        );

        targetsN.current = data;
        const total = data.reduce((sum, item) => sum + parseFloat(item.target || 0), 0);
        setTotalTarget(total - malinduwaTotal);
        setMalinduwa(malinduwaTotal

        )

      } else {
        targetsN.current = [];
        toast.warn("Target data is not in expected format");
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
  const handleSubmitNewTargets = async () => {
    try {
      dispatch(showLoader());

      for (let row of newTargets) {
        if (!row.lineCode || row.target == null) continue;

        await updateTarget(row.lineCode, newYear, newMonth, parseFloat(row.target));
      }

      toast.success("✅ Targets successfully added.");
      setAddModalOpen(false);
      getTargets(); // refresh main table
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add targets");
    } finally {
      dispatch(hideLoader());
    }
  };

  return (



    <>

      <Modal
        title={`Edit Target - ${editingRecord?.lineCode}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveTarget}
        okText="Update"
        cancelText="Cancel"
      >
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
            marginRight: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {editingRecord?.lineCode}
        </span>
        <span
          style={{
            background: "#000000ff",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 15,
            display: "inline-block",
            minWidth: "60px", marginRight: "5px",

            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {filters.year}
        </span>
        <span
          style={{
            background: "#000000ff",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 15,
            display: "inline-block",
            minWidth: "60px", marginRight: "10px",

            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {monthMap[filters.month] || filters.month}
        </span>

        <span
          style={{
            background: "#00792eff",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 15,
            display: "inline-block",
            minWidth: "60px", marginRight: "10px",

            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          Current Target - {editingRecord?.target}
        </span>        <p>
          <strong>Target (Kg):</strong>
          <InputNumber
            min={0}
            style={{ width: "100%", marginTop: 5 }}
            value={newTargetValue}
            onChange={setNewTargetValue}
          />
        </p>
      </Modal>
      <Modal
        title="Add New Monthly Targets"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleSubmitNewTargets}
        okText="Submit"
        cancelText="Cancel"
        width={600}
      >
        {/* Year & Month Selection */}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={10}>
            <Select
              value={newYear}
              onChange={(val) => setNewYear(val)}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              bordered={false}
            >
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

          <Col span={14}>
            <Select
              value={newMonth}
              bordered={false}
              onChange={(val) => setNewMonth(val)}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 6,
              }}
              placeholder="Select Month"
            >
              {allMonths.map((m) => (
                <Option key={m} value={m}>
                  {monthMap[m]}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>


        <Row gutter={24} style={{ marginBottom: 16 }}>
          {lineIdCodeMap.map((line, idx) => (
            <>
              <Col span={6} style={{ marginBottom: 16 }}>
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


                >
                  {line.lineCode} {line.lineName ? `- ${line.lineName}` : ""}
                </span>

              </Col>
              <Col span={6}>
                <InputNumber
                  min={0}
                  placeholder="Target (Kg)"
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid #333",
                    borderRadius: 6,
                  }}
                  value={newTargets.find((t) => t.lineCode === line.lineCode)?.target || null}
                  onChange={(val) => {
                    const updated = [...newTargets];
                    const existingIndex = updated.findIndex(
                      (t) => t.lineCode === line.lineCode
                    );
                    if (existingIndex !== -1) {
                      updated[existingIndex].target = val;
                    } else {
                      updated.push({ lineCode: line.lineCode, target: val });
                    }
                    setNewTargets(updated);
                  }}
                />
              </Col>
            </>
          ))}

        </Row>




      </Modal>

      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">

  <Row gutter={[8, 8]} justify="center">
        <Col md={12}>
           <Card bordered={false} style={cardStyle}>
            <Row justify="space-evenly" gutter={[16, 16]}>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col md={2}>
                    <Button
                      icon={<ReloadOutlined />}
                      type="primary"
                      block
                      danger
                      onClick={() => {
                        targetsN.current = [];
                        setTotalTarget(0);
                        setNewTargets([{ lineCode: "", target: 0 }])
                        setMalinduwa(0); setFilters({
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
                  <Col md={6}>
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
                  <Col md={6}>
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
                  <Col md={2}>

                    <Button
                      icon={<SearchRounded />}
                      type="primary"
                      onClick={() => getTargets()}
                    />
                  </Col>

                  <Col md={4}>
                    <Input
                      className="custom-supplier-input"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                      onClick={() => setAddModalOpen(true)}
                  
                    >
                      Add New
                    </Button>

                  </Col>
                </Row>
              </Col>
            </Row>

          </Card>
        
        </Col>
       </Row>
       
          {totalTarget > 0 && (
            <Card bordered={false} style={cardStyle}>
              <Row justify="space-evenly" gutter={[16, 16]}>
                <Col span={24}>
                  <Row gutter={[16, 16]}>


                    <Col md={12}>
                      <div style={{ fontWeight: 'normal', fontSize: 20 }}>
                        Targets for {filters.year} {monthMap[filters.month] || filters.month}    {totalTarget} - {malinduwa}
                      </div>
                    </Col>




                  </Row>
                </Col>
              </Row>

            </Card>
          )}



          {loading && <CircularLoader />}
          {Array.isArray(targetsN.current) && targetsN.current.length > 0 && (
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

export default Targets;