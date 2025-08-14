import React, { useRef, useState, useEffect } from "react";
import { Card, Col, Row, Button, Input, Table, Modal, Select, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import CircularLoader from "../components/CircularLoader";
import { fetchOfficers, createOfficer, updateOfficer, deleteOfficer } from "../api/api"; // you'll create these API functions
import CustomConfirmationModal from "../components/CustomConfirmationModal";
const { Option } = Select;

const Officers = () => {
  const officerRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  }; const [officer, setOfficer] = useState("");


  const [nic, setOfficerNIC] = useState("");
  const [joinedDate, setjoinedDate] = useState("");

  // Fetch lines from backend
  const getOfficers = async () => {
    setLoading(true);
    try {
      const data = await fetchOfficers();
      officerRef.current = data;
      console.log("Fetched Officers:", data);
      
      setFilteredOfficers(data);
    } catch (err) {
      message.error("Failed to fetch lines");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOfficers();
  }, []);

  // Filter lines by search term
  useEffect(() => {
    const filtered = officerRef.current.filter(line =>
      line.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.officer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOfficers(filtered);
  }, [searchTerm]);

  // Reset form fields
  const resetForm = () => {
    setOfficer("");
    setOfficerNIC("");

    setjoinedDate("");
  };

  // Handle add new line
  const handleAddOfficer = async () => {
    if (!officer || !nic || !joinedDate) {
      message.warning("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      console.log({ officer, nic, joinedDate });

      await createOfficer({ officer, nic, joinedDate });
      message.success("Officer added successfully");
      setAddModalOpen(false);
      resetForm();
      getOfficers();
    } catch (err) {
      message.error("Failed to add Officer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and populate form
  const openEditModal = (line) => {
    setEditingOfficer(line);
    setOfficer(line.officer);
    setOfficerNIC(line.nic);

    setjoinedDate(line.joinedDate ? line.joinedDate.split("T")[0] : "");
    setEditModalOpen(true);
  };

  // Handle update line
  const handleUpdateOfficer = async () => {

    if (!officer || !nic || !joinedDate) {
      message.warning("Please fill all fields");
      return;
    }
    console.log({ editingOfficer, officer, nic, joinedDate });

    try {
      setLoading(true);
      await updateOfficer(editingOfficer.id,{officer, nic, joinedDate });
      message.success("Officer updated successfully");
      setEditModalOpen(false);
      setEditingOfficer(null);
      resetForm();
      getOfficers();
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

    handleDeleteOfficer(deleteRowIndex);
    setConfirmOpen(false);
    getOfficers()
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  // Handle delete line
  const handleDeleteOfficer = async (id) => {
    console.log(id);

    try {
      setLoading(true);
      await deleteOfficer(id);
      message.success("Officer deleted");
      getOfficers();
    } catch (err) {
      message.error("Failed to delete officer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Officer",
      dataIndex: "name",
      key: "name", render: text => (
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
        {text}
        </span>
      )
    },
    {
      title: "Officer NIC",
      dataIndex: "nic",
      key: "nic",
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
                          getOfficers();
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
                        Add New Officer
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
            dataSource={filteredOfficers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="Add New Officer"
          open={isAddModalOpen}
          onCancel={() => {
            setAddModalOpen(false);
            resetForm();
          }}
          onOk={handleAddOfficer}
          okText="Add"
          cancelText="Cancel"
        >
          <Input
            placeholder="OfficerName"
            value={officer}
            onChange={e => setOfficer(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Input
            placeholder="NIC"
            value={nic}
            onChange={e => setOfficerNIC(e.target.value)}
            style={{ marginBottom: 10 }}
          />


          <Input
            type="date"
            placeholder="Joinned Date"
            value={joinedDate}
            onChange={e => setjoinedDate(e.target.value)}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={`Edit Officer - ${editingOfficer?.name || ""}`}
          open={isEditModalOpen}
          onCancel={() => {
            setEditModalOpen(false);
            setEditingOfficer(null);
            resetForm();
          }}
          onOk={handleUpdateOfficer}
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
            placeholder="Officer Code"
            value={nic}
            onChange={e => setOfficerNIC(e.target.value)}
            style={{ marginBottom: 10 }}
          />


          <Input
            type="date"
            placeholder="Joinned Date"
            value={joinedDate}
            onChange={e => setjoinedDate(e.target.value)}
          />
        </Modal>
      </div>

    </>
  );
};

export default Officers;
