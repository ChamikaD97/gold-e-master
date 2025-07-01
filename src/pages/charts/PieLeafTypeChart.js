
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieLeafTypeChart = ({ ratios }) => {
  const data = {
    labels: ["Super", "Normal"],
    datasets: [
      {
        data: [ratios.Super || 0, ratios.Normal || 0],
        backgroundColor: ["#f2b949", "#003366"],
        color: "#fff",
      },
    ],
  };

  return <Pie data={data} />;
};

export default PieLeafTypeChart;
