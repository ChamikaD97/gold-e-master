// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";
import dayjs from "dayjs"; // Import dayjs

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import { Table } from "antd";
const RecentFailures = () => {
    const { loading } = useSelector((state) => state.auth);
  
  const { officerData } = useSelector((state) => state.eng);
  const {
    engineFailuresData,
    completedEngineFailureData,
    inProgressEngineFailureData,
    pendingEngineFailureData,
  } = useSelector((state) => state.engFail);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatDate = (date) => {
    if (date) {
      return dayjs(date).format("DD/MM/YYYY"); // Format date as needed (e.g., 'DD/MM/YYYY')
    }
  };

  const columns = [
    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },
    {
      title: "Driver",
      dataIndex: "drivcerComNum",
      key: "drivcerComNum",
    },
    {
      title: "Reported Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Failure",
      dataIndex: "failure",
      key: "failure",
    }]
 
  return (
    <div>
      <CardComponent
      
        title={"Recent Failures"}
      >

<div
          style={{
            maxHeight: "calc(100vh - 200px)", // Adjust height to fit window
            overflowY: "auto", // Enable vertical scrolling for the table only
            borderRadius: "15px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            padding: "10px",
          }}
        >
         
        </div>
      </CardComponent>
    </div>
  );
};

export default RecentFailures;
