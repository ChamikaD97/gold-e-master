import React, { useState } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Card
} from "antd";

const EmployeeManagementPage = () => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([
    {
      name: "John Doe",
      nic: "901234567V",
      contact: "0711234567",
      dob: "1990-01-15",
      section: "Factory",
      job_title: "Machine Operator"
    },
    {
      name: "Jane Smith",
      nic: "912345678V",
      contact: "0776543210",
      dob: "1991-06-30",
      section: "Accounts",
      job_title: "Accountant"
    },
    {
      name: "Kamal Perera",
      nic: "880123456V",
      contact: "0729876543",
      dob: "1988-12-05",
      section: "Field Office",
      job_title: "Supervisor"
    },
    {
      name: "Nimal Fernando",
      nic: "930987654V",
      contact: "0761122334",
      dob: "1993-09-22",
      section: "Workshop",
      job_title: "Mechanic"
    }
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");

  const showAddModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setModalVisible(true);
  };

  const showEditModal = (record, index) => {
    form.setFieldsValue({ ...record });
    setEditingIndex(index);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = (index) => {
    const updated = employees.filter((_, i) => i !== index);
    setEmployees(updated);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        const updated = [...employees];
        updated[editingIndex] = values;
        setEmployees(updated);
      } else {
        setEmployees([...employees, values]);
      }
      setModalVisible(false);
      form.resetFields();
    });
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.nic?.toLowerCase().includes(search.toLowerCase())
  );

  const uniqueSections = [...new Set(filteredEmployees.map(emp => emp.section))];

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "NIC", dataIndex: "nic" },
    { title: "Contact", dataIndex: "contact" },
    { title: "DOB", dataIndex: "dob" },
    { title: "Job Title", dataIndex: "job_title" },
    {
      title: "Actions",
      render: (_, record, index) => (
        <Space>
          <Button onClick={() => showEditModal(record, index)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(index)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "64px 24px 24px", width: "100%" }}>
      <h2>Employee Management</h2>

      {/* Top bar: filters + add button */}
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={16} md={18}>
            <Input
              placeholder="Search by name or NIC"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", maxWidth: 300 }}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={showAddModal}>
              Add Employee
            </Button>
          </Col>
        </Row>
      </div>

      {/* Employee Cards grouped by section */}
      <Row gutter={[16, 16]}>
        {uniqueSections.map((section) => (
          <Col xs={24} md={12} key={section}>
            <Card
              title={`👤 ${section} Section`}
              bordered
              style={{ height: "100%" }}
            >
              <Table
                dataSource={filteredEmployees.filter(
                  (emp) => emp.section === section
                )}
                columns={columns}
                rowKey={(record, index) => index}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for Add/Edit */}
      <Modal
        title={isEditMode ? "Edit Employee" : "Add Employee"}
        open={modalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setModalVisible(false)}
        okText={isEditMode ? "Update" : "Add"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="nic" label="NIC" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="contact" label="Contact">
            <Input />
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="section" label="Section">
            <Input />
          </Form.Item>

          <Form.Item name="job_title" label="Job Title">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagementPage;
