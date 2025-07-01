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
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAutomaticalyInactive, setLeafRound, setNotificationsVisible, clearMarkers } from "../redux/commonDataSlice";

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
  const notificationDate = useSelector((state) => state.commonData?.notificationDate);
  const automaticalyInactive = useSelector((state) => state.commonData?.automaticalyInactive);
  const dispatch = useDispatch();
  const handleFinish = (values) => {

    dispatch(setLeafRound(values.leafRound));
    dispatch(setAutomaticalyInactive(values.automaticalyInactive));
    dispatch(setNotificationsVisible(values.notifications));

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
      title="Settings"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      bodyStyle={{
        padding: 10,
        borderRadius: 10,
      }}
    >
      {/* ✅ Summary Section in Card */}
      <div style={{ display: "flex", gap: 16, marginBottom: 5 }}>
        {/* Card 1 */}
        {/* <Card style={{ ...cardStyle, flex: 1, minHeight: 120 }} bordered={false}>
    <div style={{ color: "#fff", padding: 8, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
      <div><strong>Notification Date (days)</strong></div>
      <div style={{ fontSize: 20 }}>{notificationDate ?? "N/A"}</div>
    </div>
  </Card> */}

        {/* Card 2 */}
        <Card style={{ ...cardStyle, flex: 1, minHeight: 120 }} bordered={false}>
          <div style={{ color: "#fff", padding: 8, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
            <div><strong>Leaf Round (days)</strong></div>
            <div style={{ fontSize: 20 }}>{leafRound ?? "N/A"}</div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card style={{ ...cardStyle, flex: 1, minHeight: 120 }} bordered={false}>
          <div style={{ color: "#fff", padding: 8, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
            <div><strong>Inactive (days)</strong></div>
            <div style={{ fontSize: 20 }}>{automaticalyInactive ?? "N/A"}</div>
          </div>
        </Card>
      </div>


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

          }}
        >


          <Form.Item
            label="Enable Notifications"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>


          <Form.Item label="Leaf Round" name="leafRound">
            <InputNumber min={1} style={{ ...inputStyle, width: "100%" }} />
          </Form.Item>

          <Form.Item label="Automatically Inactive (days)" name="automaticalyInactive">
            <InputNumber min={1} style={{ ...inputStyle, width: "100%" }} />
          </Form.Item>




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
