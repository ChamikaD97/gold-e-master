import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";
import axios from "axios";
import "../styles/FailureChart.css";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const API_URL = "http://13.61.26.58:5000";

const FailureChart = () => {
  const [failures, setFailures] = useState({ labels: [], data: [] });

  useEffect(() => {
    fetchFailures();
  }, []);

  const fetchFailures = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/engineFailures`, {
        headers: { Authorization: "token" },
      });
      const failures = response.data;

      // Process the failure data
      const { labels, data } = processFailureData(failures);

      // Update the state with the processed data
      setFailures({ labels, data });
    } catch (error) {
      console.error("Error fetching failures:", error.message);
    }
  };

  const processFailureData = (failures) => {
    console.log(failures);

    const statusCounts = {
      pending: 0,
      inProgress: 0,
      done: 0,
    };

    failures.forEach((failure) => {
      if (failure.status === "pending") {
        statusCounts.pending++;
      } else if (failure.status === "inProgress") {
        statusCounts.inProgress++;
      } else if (failure.status === "completed") {
        statusCounts.done++;
      }
    });

    return {
      labels: ["Pending", "In Progress", "Done"],
      data: [statusCounts.pending, statusCounts.inProgress, statusCounts.done],
    };
  };

  const chartData = {
    labels: failures.labels,
    datasets: [
      {
        label: "Failure Status",
        data: failures.data,
        backgroundColor: [
          "rgb(196, 0, 0)", // Red for Pending
          "rgb(0, 0, 110)", // Blue for In Progress
          "rgb(0, 105, 0)", // Green for Done
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)", // Red for Pending
          "rgba(54, 162, 235, 1)", // Blue for In Progress
          "rgba(75, 192, 192, 1)", // Green for Done
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Failure Status Distribution",
        font: {
          size: 20, // Font size
          weight: "bold", // Font weight
          family: "Arial", // Font family
        },
        color: "#333", // Font color
        padding: {
          bottom: 10,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Removes grid lines on X-axis
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Removes grid lines on Y-axis
        },
      },
    },
  };
  
  return (
    <div>
      <div className="container">
        <div className="chart-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default FailureChart;
