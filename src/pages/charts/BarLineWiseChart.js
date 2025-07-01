
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarLineWiseChart = ({ lineTotals }) => {
  const labels = Object.keys(lineTotals);
  const data = {
    labels,
    datasets: [
      {
        label: "Net KG Collected",
        data: Object.values(lineTotals),
        backgroundColor: "#1890ff",
      },
    ],
  };

  return <Bar data={data} options={{ responsive: true }} />;
};

export default BarLineWiseChart;
