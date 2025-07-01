// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import axios from "axios";

const DailyData = () => {
  const [failuresCount, setFailures] = useState(0);
  const API_URL = "http://13.61.26.58:5000";

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchEngineFailures = async () => {
    try {
      const efData = await axios.get(`${API_URL}/api/engineFailures`, {
        headers: { Authorization: 'token' },
      });
      setFailures(efData.data.length);
    } catch (error) {
      console.error("Error fetching engineFailures:", error.message);
    }
  };
  useEffect(() => {
    fetchEngineFailures();
  }, []);
  const handleOnClick = () => {
    dispatch(setSelectedKey("4"));
    navigate("/failures");
  };

  return (
    <div>
      <CardComponent
        onCardClick={handleOnClick}
        title={"Daily"}
        val={failuresCount}
      ></CardComponent>
    </div>
  );
};

export default DailyData;
