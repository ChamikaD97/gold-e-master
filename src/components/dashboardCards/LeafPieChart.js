import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#ffa347', '#47a3ff'];

const LeafPieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#555", color: "#fff" }}
        labelStyle={{ color: "#fff" }}
        itemStyle={{ color: "#fff" }}
      />
      <Legend wrapperStyle={{ color: "#fff" }} />
    </PieChart>
  </ResponsiveContainer>
);

export default LeafPieChart;
