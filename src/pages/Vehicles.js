import React, { useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  DatePicker,
  Popconfirm,
  Row,
  Form,
  Col,
  Card,
  Tag
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import VehicleStepperModal from "../components/VehicleStepperModal";
import vehicleData from './data/vehiclesData.json';

const Vehicles = () => {
  const [form] = Form.useForm();
  const [vehicles, setVehicles] = useState(vehicleData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

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
    const updated = vehicles.filter((_, i) => i !== index);
    setVehicles(updated);
  };

  const handleFinalSubmit = () => {
    form.validateFields().then((values) => {
      console.log("✅ All form data submitted:", values);

      if (values.image_upload && values.image_upload.length > 0) {
        const file = values.image_upload[0].originFileObj;
        console.log("📦 Uploaded file object:", file);
      }
    }).catch((errorInfo) => {
      console.warn("⚠️ Validation failed:", errorInfo);
    });

    setTimeout(() => {
      setModalVisible(false);
      form.resetFields();
    }, 1500);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    return (
      vehicle.reg_no?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.chassis_no?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns = [
    { title: "Reg No", dataIndex: "reg_no", align: "center" },
    { title: "Chassis No", dataIndex: "chassis_no", align: "center" },
    { title: "Model", dataIndex: "model", align: "center" },
    { title: "Fuel", dataIndex: "fuel", align: "center" },
    { title: "Type", dataIndex: "type", align: "center" },
    {
      title: "Actions",
      align: "center",
      render: (_, record, index) => (
        <Space>
          <Button onClick={() => showEditModal(record, index)}>Edit</Button>
          <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(index)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
        <Card bordered={false} style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: 12, marginBottom: 6 }}>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12} md={2}>
              <Button
                icon={<ReloadOutlined />}
                danger
                type="primary"
                block
                onClick={() => setSearch("")}
              >
                Reset
              </Button>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Input
                className="custom-placeholder"
                placeholder="Search by Reg No or Chassis No"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 8 }}
              />
            </Col>

            <Col xs={24} sm={12} md={2}>
              <Button type="primary" onClick={showAddModal} block>
                Add
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }} className="fade-in hide-scrollbar">
        <Card bordered={false} style={{ background: "rgba(0, 0, 0, 0.6)" }}>
          <Table
            dataSource={filteredVehicles}
            columns={columns}
            rowKey={(record, index) => index}
            locale={{
              emptyText: (
                <div style={{ padding: "20px", fontSize: "16px", color: "#888", textAlign: "center" }}>
                  No vehicles found.
                </div>
              )
            }}
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vehicles`
            }}
            tableLayout="fixed"
          />
        </Card>
      </div>

      <VehicleStepperModal
        open={modalVisible}
        isEditMode={isEditMode}
        onCancel={() => {
          setCurrentStep(0);
          setModalVisible(false);
        }}
        onSubmit={handleFinalSubmit}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        form={form}
      />
    </div>
  );
};

export default Vehicles;