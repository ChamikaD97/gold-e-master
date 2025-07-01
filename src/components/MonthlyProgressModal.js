
// MonthlyProgressModal.js
import React from "react";
import { Modal } from "antd";

const MonthlyProgressModal = ({ visible, onClose }) => {
  return (
    <Modal
      title="This Year Monthly Progress"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <p>Chart or monthly progress data goes here...</p>
    </Modal>
  );
};

export default MonthlyProgressModal;