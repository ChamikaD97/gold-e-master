import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Steps,
  Button,
  Result,
  Row,
  Col,
  Upload
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Step } = Steps;
const { Option } = Select;

const VehicleStepperModal = ({ open, onCancel, onSubmit, form, currentStep, setCurrentStep }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const next = () => {
    form.validateFields().then(() => setCurrentStep((prev) => prev + 1));
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

  const steps = [
    {
      title: "Basic Info",
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="reg_no" label="Registration Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="chassis_no" label="Chassis Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="engine_no" label="Engine Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="cc" label="Engine CC"><InputNumber style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="Vehicle Type"><Select><Option value="bike">Bike</Option><Option value="car">Car</Option><Option value="truck">Truck</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="fuel" label="Fuel Type"><Select><Option value="petrol">Petrol</Option><Option value="diesel">Diesel</Option><Option value="electric">Electric</Option></Select></Form.Item></Col>
          </Row>
        </>
      )
    },
    {
      title: "Ownership & Details",
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="model" label="Model"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="year" label="Year"><InputNumber style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="country" label="Country of Origin"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="current_owner" label="Current Owner"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="date_of_first_reg" label="Date of First Registration"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="old_owners" label="Previous Owners"><InputNumber style={{ width: "100%" }} min={0} /></Form.Item></Col>
          </Row>
        </>
      )
    },
    {
      title: "License & Inspection",
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="insurance_date" label="Insurance Expiry Date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="eco_test" label="Eco Test Status"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="license" label="License Validity"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="specs" label="Specifications / Notes"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </>
      )
    },
    {
      title: "Inspection Items",
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="head_light" label="Head Light"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="brake_light" label="Brake Light"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="parking_light" label="Parking Light"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="turn_light" label="Turn Signal Light"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="tyres" label="Tyres Condition"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tube_type" label="Tube/Tubeless"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="suspension" label="Suspension"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="battery" label="Battery Condition"><Input /></Form.Item></Col>
          </Row>
        </>
      )
    },
    {
      title: "Attachments & Notes",
      content: (
        <>
          <Form.Item
            name="attachments"
            label="Upload Documents"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Select Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="description" label="Additional Notes">
            <Input.TextArea rows={3} placeholder="Enter description or extra details" />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <Modal
      title="Add New Vehicle"
      open={open}
      footer={null}
      destroyOnClose
      onCancel={() => {
        setCurrentStep(0);
        setSubmitted(false);
        form.resetFields();
        onCancel();
      }}
    >
      {!submitted && (
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      )}

      {submitted ? (
        <Result status="success" title="Vehicle Added Successfully!" />
      ) : (
        <Form layout="vertical" form={form}>
          {steps[currentStep].content}

          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
            {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
            {currentStep < steps.length - 1 && <Button type="primary" onClick={next}>Next</Button>}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                loading={submitting}
                onClick={() => {
                  form.validateFields().then((values) => {
                    setSubmitting(true);
                    console.log("✅ Final Vehicle Data:", values);
                    setTimeout(() => {
                      setSubmitting(false);
                      setSubmitted(true);
                      onSubmit(values);
                    }, 1500);
                  });
                }}
              >
                Submit
              </Button>
            )}
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default VehicleStepperModal;