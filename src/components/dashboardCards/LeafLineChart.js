import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LeafLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip
        contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#555", color: "#fff" }}
        labelStyle={{ color: "#fff" }}
        itemStyle={{ color: "#fff" }}
      />
      <Legend />
      <Line type="monotone" dataKey="Super" stroke="#ffa347" />
      <Line type="monotone" dataKey="Normal" stroke="#47a3ff" />
      <Line type="monotone" dataKey="Total" stroke="#28a745" strokeWidth={2} dot={{ r: 3 }} />
    </LineChart>
  </ResponsiveContainer>
);

export default LeafLineChart;
