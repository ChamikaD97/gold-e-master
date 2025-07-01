import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import "../styles/TripChart.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = "http://13.61.26.58:5000";

const TripChart = () => {
  const [trips, setTrips] = useState({ labels: [], data: [] });

  useEffect(() => {
    fetchTripCards();
  }, []);

  const fetchTripCards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tripCards`, {
        headers: { Authorization: "token" },
      });
      const trips = response.data;
      console.log("trips");
      // Process the trip data
      const { labels, data } = processTripData(trips);

      // Update the state with the processed data
      setTrips({ labels, data });
    } catch (error) {
      console.error("Error fetching trip Cards:", error.message);
    }
  };

  const processTripData = (trips) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const tripsByMonth = {};

    trips.forEach((trip) => {
      const date = new Date(trip.createdAt);
      const month = date.getMonth();

      const monthName = monthNames[month];

      console.log(new Date(trip.createdAt));

      if (tripsByMonth[monthName]) {
        tripsByMonth[monthName]++;
      } else {
        tripsByMonth[monthName] = 1;
      }
    });

    const labels = Object.keys(tripsByMonth);
    const data = Object.values(tripsByMonth);

    return { labels, data };
  };

  const chartData = {
    labels: trips.labels,
    datasets: [
      {
        label: "Number of Trips",
        data: trips.data,
        backgroundColor: "rgba(0, 21, 41, 0.911)",
        borderColor: "rgba(0, 21, 41, 0.911);",
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
        text: "Monthly Trip Count",
        font: {
          size: 25, // Font size
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
    <div className="container">
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TripChart;
