import React from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  InputNumber,
  Descriptions,
  Card,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAutomaticalyInactive, setLeafRound, setNotificationsVisible, clearMarkers, setdateRangeMonths } from "../redux/commonDataSlice";

/**
 * SettingsModal
 * @param {boolean} open - Whether the modal is visible
 * @param {Function} onClose - Function to close the modal
 */
const SettingsModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const state = useSelector((state) => state.commonData);

  // Redux values
  const leafRound = useSelector((state) => state.commonData?.leafRound);
  const automaticalyInactive = useSelector((state) => state.commonData?.automaticalyInactive);
  const dateRangeMonths = useSelector((state) => state.commonData?.dateRangeMonths);
  const week1Target = useSelector((state) => state.commonData?.week1Target);
  const week2Target = useSelector((state) => state.commonData?.week2Target);
  const week3Target = useSelector((state) => state.commonData?.week3Target);
  const week4Target = useSelector((state) => state.commonData?.week4Target);
  const dispatch = useDispatch();
  const handleFinish = (values) => {

    dispatch(setLeafRound(values.leafRound));
    dispatch(setAutomaticalyInactive(values.automaticalyInactive));
    dispatch(setNotificationsVisible(values.notifications));
    dispatch(setdateRangeMonths(values.dateRangeMonths)); // Reset to default value
    onClose();
  };

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.82)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };
  const inputStyle = {

    borderColor: "#444",
    width: "100%",
  };

  return (
    <Modal

      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      bodyStyle={{

        borderRadius: 10,
      }}
    >



      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 16 }}
          wrapperCol={{ span: 8 }}
          onFinish={handleFinish}
          labelAlign="left"         // 👈 This aligns labels to the left

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
            <div
              style={{
                borderTop: "1px solid",
              }}
            ></div>
            <h4 style={{ color: "#333" }}>Settings</h4>          </Form.Item>

          <Form.Item label="Leaf Round" name="leafRound">
            <InputNumber min={1} style={{ ...inputStyle, width: "100%" }} />
          </Form.Item>

          <Form.Item label="Missing Range" name="dateRangeMonths">
            <InputNumber min={1} style={{ ...inputStyle, width: "100%" }} />
          </Form.Item>
          <Form.Item label="Automatically Inactive (days)" name="automaticalyInactive">
            <InputNumber min={1} style={{ ...inputStyle, width: "100%" }} />
          </Form.Item>

          {/* 🔻 Separator */}
          <Form.Item wrapperCol={{ span: 24 }}>
            <div
              style={{
                borderTop: "1px solid",
              }}
            ></div>
            <h4 style={{ color: "#333" }}>Weekly Targets</h4>
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


          <div
            style={{
              borderTop: "1px solid",
              marginBottom: 16,
            }}
          ></div>
          <Form.Item wrapperCol={{ span: 24 }}>




            <div style={{ display: "flex", gap: 10 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  backgroundColor: "#00b96b", // custom green
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

                  // slight delay to reflect Redux state updates
                  setTimeout(() => {
                    form.setFieldsValue({
                      notifications: state.notificationsVisible,
                      leafRound: state.leafRound,
                      automaticalyInactive: state.automaticalyInactive,
                    });
                  }, 50);
                }}
                style={{
                  backgroundColor: "#1677ff", // custom blue
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


      </Card>

      {/* ✅ Settings Form */}

    </Modal>
  );
};

export default SettingsModal;
