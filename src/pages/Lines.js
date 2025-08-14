import React, { useRef, useState, useEffect } from "react";
import { Card, Col, Row, Button, Input, Table, Modal, Select, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import CircularLoader from "../components/CircularLoader";
import { fetchLines, createLine, updateLine, deleteLine } from "../api/api"; // you'll create these API functions
import CustomConfirmationModal from "../components/CustomConfirmationModal";
const { Option } = Select;

const Lines = () => {
    const linesRef = useRef([]);
    const [loading, setLoading] = useState(false);
    const [filteredLines, setFilteredLines] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingLine, setEditingLine] = useState(null);

    const cardStyle = {
        background: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        borderRadius: 12,
        marginBottom: 6,
    }; const [officer, setOfficer] = useState("");
    const [lineCode, setLineCode] = useState("");
    const [lineId, setLineId] = useState("");
    const [startedDate, setStartedDate] = useState("");

    // Fetch lines from backend
    const getLines = async () => {
        setLoading(true);
        try {
            const data = await fetchLines();
            linesRef.current = data;
            setFilteredLines(data);
        } catch (err) {
            message.error("Failed to fetch lines");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLines();
    }, []);

    // Filter lines by search term
    useEffect(() => {
        const filtered = linesRef.current.filter(line =>
            line.lineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            line.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            line.officer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLines(filtered);
    }, [searchTerm]);

    // Reset form fields
    const resetForm = () => {
        setOfficer("");
        setLineCode("");
        setLineId("");
        setStartedDate("");
    };

    // Handle add new line
    const handleAddLine = async () => {
        if (!officer || !lineCode || !lineId || !startedDate) {
            message.warning("Please fill all fields");
            return;
        }
        try {
            setLoading(true);
            await createLine({ officer, lineCode, lineId, startedDate });
            message.success("Line added successfully");
            setAddModalOpen(false);
            resetForm();
            getLines();
        } catch (err) {
            message.error("Failed to add line");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Open edit modal and populate form
    const openEditModal = (line) => {
        setEditingLine(line);
        setOfficer(line.officer);
        setLineCode(line.lineCode);
        setLineId(line.lineId);
        setStartedDate(line.startedDate ? line.startedDate.split("T")[0] : "");
        setEditModalOpen(true);
    };

    // Handle update line
    const handleUpdateLine = async () => {
        if (!officer || !lineCode || !lineId || !startedDate) {
            message.warning("Please fill all fields");
            return;
        }
        console.log({ editingLine, officer, lineCode, lineId, startedDate });

        try {
            setLoading(true);
            await updateLine(lineCode, lineId, { officer, lineCode, lineId, startedDate });
            message.success("Line updated successfully");
            setEditModalOpen(false);
            setEditingLine(null);
            resetForm();
            getLines();
        } catch (err) {
            message.error("Failed to update line");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const [confirmOpen, setConfirmOpen] = useState(false);


    const [deleteRowIndex, setDeleteRowIndex] = useState();



    const handleDeleteClick = (index) => {
        setDeleteRowIndex(index);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {

        handleDeleteLine(deleteRowIndex);
        setConfirmOpen(false);
        getLines()
    };

    const handleCancel = () => {
        setConfirmOpen(false);
    };

    // Handle delete line
    const handleDeleteLine = async (id) => {
        console.log(id);

        try {
            setLoading(true);
            await deleteLine(id.lineCode, id.lineId);
            message.success("Line deleted");
            getLines();
        } catch (err) {
            message.error("Failed to delete line");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Table columns
    const columns = [
        {
            title: "Officer",
            dataIndex: "officer",
            key: "officer",render: text => (
        <span
          style={{
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
          Mr. {text}
        </span>
      )
        },
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
            title: "Line ID",
            dataIndex: "lineId",
            key: "lineId",render: text => (
        <span
          style={{
            background: "#005f8bff",
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
          {text}
        </span>
      )
        },
        // {
        //     title: "Started Date",
        //     dataIndex: "startedDate",
        //     key: "startedDate",
        //     render: (date) => (date ? new Date(date).toLocaleDateString() : ""),
        // },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Row justify="center" gutter={8}>
                    <Col>
                        <Button type="primary" onClick={() => openEditModal(record)}>
                            Edit
                        </Button>
                    </Col>
                    <Col>
                        <Button danger type="primary" onClick={() => handleDeleteClick(record)}>
                            Delete
                        </Button>
                    </Col>
                </Row>
            ),
        },
    ];

    return (

        <>

            <CustomConfirmationModal
                open={confirmOpen}
                title="Delete Record"
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />

            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>




                <Row gutter={[8, 8]} justify="center">
                    <Col md={12}>
                        <Card bordered={false} style={cardStyle}>
                            <Row justify="space-evenly" gutter={[16, 16]}>
                                <Col span={24}>

                                    <Row gutter={8} align="middle">
                                        <Col md={2}>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                type="primary"
                                                onClick={() => {
                                                    resetForm();
                                                    setSearchTerm("");
                                                    getLines();
                                                }}
                                                block
                                                danger
                                            >

                                            </Button>
                                        </Col>

                                        <Col span={14}>
                                            <Input
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                onPressEnter={e => setSearchTerm(e.target.value)}

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

                                        <Col>
                                            <Button type="primary" onClick={() => setAddModalOpen(true)}>
                                                Add New Line
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                        </Card>

                    </Col>
                </Row>



                <Card



                    style={cardStyle}
                    headStyle={{ color: "#fff" }}
                >
                    <Table
                        className="sup-bordered-table"
                        dataSource={filteredLines}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>

                <Modal
                    title="Add New Line"
                    open={isAddModalOpen}
                    onCancel={() => {
                        setAddModalOpen(false);
                        resetForm();
                    }}
                    onOk={handleAddLine}
                    okText="Add"
                    cancelText="Cancel"
                >
                    <Input
                        placeholder="Officer"
                        value={officer}
                        onChange={e => setOfficer(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        placeholder="Line Code"
                        value={lineCode}
                        onChange={e => setLineCode(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        placeholder="Line ID"
                        value={lineId}
                        onChange={e => setLineId(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        type="date"
                        placeholder="Started Date"
                        value={startedDate}
                        onChange={e => setStartedDate(e.target.value)}
                    />
                </Modal>

                {/* Edit Modal */}
                <Modal
                    title={`Edit Line - ${editingLine?.lineCode || ""}`}
                    open={isEditModalOpen}
                    onCancel={() => {
                        setEditModalOpen(false);
                        setEditingLine(null);
                        resetForm();
                    }}
                    onOk={handleUpdateLine}
                    okText="Update"
                    cancelText="Cancel"
                >
                    <Input
                        placeholder="Officer"
                        value={officer}
                        onChange={e => setOfficer(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        placeholder="Line Code"
                        value={lineCode}
                        onChange={e => setLineCode(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        placeholder="Line ID"
                        value={lineId}
                        onChange={e => setLineId(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Input
                        type="date"
                        placeholder="Started Date"
                        value={startedDate}
                        onChange={e => setStartedDate(e.target.value)}
                    />
                </Modal>
            </div>

        </>
    );
};

export default Lines;
