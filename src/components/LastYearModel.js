// LastYearModel.js
import React from "react";
import { Modal } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const summaryData = [
  { month: "Jan", target: 1200, achieved: 1000, superLeaf: 60 },
  { month: "Feb", target: 1100, achieved: 900, superLeaf: 50 },
  { month: "Mar", target: 1300, achieved: 1100, superLeaf: 70 },
  { month: "Apr", target: 1400, achieved: 1350, superLeaf: 80 },
  { month: "May", target: 1500, achieved: 1450, superLeaf: 75 },
  { month: "Jun", target: 1600, achieved: 1500, superLeaf: 85 },
  { month: "Jul", target: 1700, achieved: 1550, superLeaf: 90 },
  { month: "Aug", target: 1800, achieved: 1750, superLeaf: 88 },
  { month: "Sep", target: 1900, achieved: 1850, superLeaf: 89 },
  { month: "Oct", target: 2000, achieved: 1950, superLeaf: 91 },
  { month: "Nov", target: 2100, achieved: 2050, superLeaf: 93 },
  { month: "Dec", target: 2200, achieved: 2150, superLeaf: 95 },
];

const LastYearModel = ({ visible, onClose }) => {
  return (
    <Modal
      title="Last Year Progress"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <h3>Target vs Achievements</h3>
      <LineChart
        width={900}
        height={300}
        data={summaryData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="target" stroke="#8884d8" />
        <Line type="monotone" dataKey="achieved" stroke="#82ca9d" />
      </LineChart>

      <h3>Super Leaf %</h3>
      <BarChart width={900} height={300} data={summaryData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="superLeaf" fill="#ffc658" name="Super Leaf %" />
      </BarChart>
    </Modal>
  );
};

export default LastYearModel;