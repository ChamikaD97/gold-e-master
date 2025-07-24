import React, { useEffect } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setAutomaticalyInactive,
  setLeafRound,
  setNotificationsVisible,
  clearMarkers,
  setdateRangeMonths,
} from "../redux/commonDataSlice";

const SettingsModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const state = useSelector((state) => state.commonData);

  const {
    leafRound,
    automaticalyInactive,
    dateRangeMonths,
    week1Target,
    week2Target,
    week3Target,
    week4Target,
    notificationsVisible,
  } = state;

  const dispatch = useDispatch();

  const handleFinish = (values) => {
    dispatch(setLeafRound(values.leafRound));
    dispatch(setAutomaticalyInactive(values.automaticalyInactive));
    dispatch(setNotificationsVisible(values.notifications));
    dispatch(setdateRangeMonths(values.dateRangeMonths));
    onClose();
  };

  const inputStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    borderColor: "#555",
    width: "100%",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .dark-modal-form .ant-form-item-label > label {
        color: #fff !important;
      }

      .dark-modal-form .ant-input-number input {
        color: #fff !important;
        background-color: rgba(255,255,255,0.05) !important;
        border-color: #555 !important;
      }

      .dark-modal-form h4 {
        color: #fff !important;
      }

      .dark-modal-form .ant-btn {
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      bodyStyle={{
        backgroundColor: "#222",
        borderRadius: 10,
      }}
    >
      <div
        className="dark-modal-form"
        style={{
          margin: "16px 0",
          borderRadius: 10,
          backgroundColor: "#222",
          padding: 10,
          color: "#fff",
          fontWeight: "normal",
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 16 }}
          wrapperCol={{ span: 8 }}
          onFinish={handleFinish}
          labelAlign="left"
          initialValues={{
            notifications: true,
            leafRound,
            automaticalyInactive,
            dateRangeMonths,
            week1Target,
            week2Target,
            week3Target,
            week4Target,
          }}
        >
          <Form.Item wrapperCol={{ span: 24 }}>
            <div style={{ borderTop: "1px solid #444", marginBottom: 8 }} />
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: "normal", marginBottom: 12 }}>
              Settings
            </h4>

          </Form.Item>

          <Form.Item label="Leaf Round" name="leafRound">
            <InputNumber min={1} style={inputStyle} />
          </Form.Item>

          <Form.Item label="Missing Range (Months)" name="dateRangeMonths">
            <InputNumber min={1} style={inputStyle} />
          </Form.Item>

          <Form.Item label="Automatically Inactive (days)" name="automaticalyInactive">
            <InputNumber min={1} style={inputStyle} />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div style={{ borderTop: "1px solid #444", marginBottom: 8 }} />
            <h4>Weekly Targets</h4>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Week 1 Target" name="week1Target">
                <InputNumber min={week1Target} style={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Week 2 Target" name="week2Target">
                <InputNumber min={week2Target} style={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Week 3 Target" name="week3Target">
                <InputNumber min={week3Target} style={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Week 4 Target" name="week4Target">
                <InputNumber min={week4Target} style={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div style={{ borderTop: "1px solid #444", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  backgroundColor: "#00b96b",
                  borderColor: "#00b96b",
                }}
              >
                Save
              </Button>

              <Button
                type="primary"
                block
                onClick={() => {
                  dispatch(clearMarkers());
                  setTimeout(() => {
                    form.setFieldsValue({
                      notifications: notificationsVisible,
                      leafRound,
                      automaticalyInactive,
                    });
                  }, 50);
                }}
                style={{
                  backgroundColor: "#1677ff",
                  borderColor: "#1677ff",
                }}
              >
                Reset
              </Button>

              <Button
                danger
                type="primary"
                block
                onClick={() =>
                  form.setFieldsValue({
                    notifications: false,
                    leafRound: null,
                    automaticalyInactive: null,
                  })
                }
              >
                Clear
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SettingsModal;
