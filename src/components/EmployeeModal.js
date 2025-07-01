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
import { UploadOutlined } from "@mui/icons-material";

const { Step } = Steps;
const { Option } = Select;

const EmployeeStepperModal = ({ open, onCancel, onSubmit, form, currentStep, setCurrentStep }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  const next = () => {
    form.validateFields().then(() => {
      const currentValues = form.getFieldsValue();

      switch (currentStep) {
        case 0:
          console.log("🟦 Basic Info:", {
            name: currentValues.name,
            nic: currentValues.nic,
            dob: currentValues.dob,
            contact: currentValues.contact,
            emergency_contact: currentValues.emergency_contact,
            address: currentValues.address
          });
          break;

        case 1:
          console.log("🟨 Work Info:", {
            emp_id: currentValues.emp_id,
            joined_date: currentValues.joined_date,
            staff: currentValues.staff,
            section: currentValues.section,
            job_title: currentValues.job_title,
            shift: currentValues.shift,
            leaves: currentValues.leaves
          });
          break;

        case 2:
          console.log("🟩 Salary Info:", {
            salary: currentValues.salary,
            salary_method: currentValues.salary_method,
            bank_name: currentValues.bank_name,
            account_number: currentValues.account_number
          });
          break;

        case 3:
          console.log("🟪 Other Info:", {
            image_upload: currentValues.image_upload,
            location: currentValues.location,
            description: currentValues.description
          });
          break;

        default:
          break;
      }

      setCurrentStep((prev) => prev + 1);
    });
  };


  const prev = () => setCurrentStep((prev) => prev - 1);

  const steps = [
    {
      title: "Basic Info",
      content: (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: false, message: "Please enter full name" }]}
                className="custom-input"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="nic"
                label="NIC"
                rules={[{ required: false, message: "Please enter NIC" }]}
                className="custom-input"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                className="custom-input"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact" label="Contact" className="custom-input">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emergency_contact"
                label="Emergency Contact"
                className="custom-input"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address" className="custom-input">
            <Input.TextArea rows={2} />
          </Form.Item>
        </>
      )
    }
    ,
    {
      title: "Work Info",
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emp_id" label="Employee ID" className="custom-input">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="joined_date" label="Joined Date" className="custom-input">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="staff"
                label="Staff Type"
                rules={[{ required: true, message: "Please select staff type" }]}
                className="custom-input"
              >
                <Select placeholder="Select">
                  <Option value="Office Staff">Office Staff</Option>
                  <Option value="Factory Staff">Factory Staff</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="section" label="Section" className="custom-input">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="job_title" label="Job Title" className="custom-input">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shift" label="Shift" className="custom-input">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leaves" label="Leaves" className="custom-input">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )
    }
    ,
    {
      title: "Salary Info",
      content: (
        <>
          <Row gutter={16}>


            <Col span={12}>
              <Form.Item
                name="salary_method"
                label="Salary Method"
                rules={[{ required: true, message: "Please select salary method" }]}
                className="custom-input"
              >
                <Select placeholder="Select">
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank">Bank</Option>
                </Select>
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{ required: true, message: "Please enter the basic salary" }]}
                className="custom-input"
              >
                <InputNumber style={{ width: "100%" }} min={0} prefix="LKR " />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item shouldUpdate={(prev, curr) => prev.salary_method !== curr.salary_method}>
            {({ getFieldValue }) =>
              getFieldValue("salary_method") === "Bank" && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="bank_name"
                      label="Bank Name"
                      rules={[{ required: true, message: "Please enter the bank name" }]}
                      className="custom-input"
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="account_number"
                      label="Bank Account Number"
                      rules={[{ required: true, message: "Please enter the account number" }]}
                      className="custom-input"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              )
            }
          </Form.Item>
        </>
      )
    }
    ,
    {
      title: "Other Info",
      content: (() => {

        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="image_upload"
                  label="Upload Image"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  className="custom-input"
                >
                  <Upload
                    listType="text"
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                    onChange={({ fileList }) => {
                      const preview = document.getElementById("image-preview");

                      if (fileList.length === 0 && preview) {
                        preview.src = "";
                        setHasImage(false); // Hide image
                        return;
                      }

                      const file = fileList?.[0]?.originFileObj;
                      if (file && preview) {
                        const url = URL.createObjectURL(file);
                        preview.src = url;
                        setHasImage(true); // Show image
                      }
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            {/* Image preview shown below only if an image is selected */}
            {hasImage && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <img
                  id="image-preview"
                  src=""
                  alt="Preview"
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid black"
                  }}
                />
              </div>
            )}

            <Form.Item name="location" label="Location" className="custom-input">
              <Input placeholder="Enter work or base location" />
            </Form.Item>

            <Form.Item name="description" label="Description" className="custom-input">
              <Input.TextArea rows={3} placeholder="Enter any additional notes or details" />
            </Form.Item>
          </>
        );
      })()
    }


  ];

  return (
    <Modal
      title="Add New Employee"
      open={open}
      footer={null}
      onCancel={() => {
        setCurrentStep(0);
        setSubmitted(false);
        form.resetFields();
        onCancel();
      }}
      destroyOnClose
    >


      {!submitted && (
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      )}

      {submitted ? (
        <Result
          status="success"
          title="Employee Added Successfully!"

        />
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
           
                 console.log("✅ Final Submitted Data:", values); // ✅ Log all data here
           
                 setTimeout(() => {
                   setSubmitting(false);
                   setSubmitted(true);
                   onSubmit(values); // Keep this to send to parent
                 }, 1500);
           
                 form.resetFields();
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

export default EmployeeStepperModal;
