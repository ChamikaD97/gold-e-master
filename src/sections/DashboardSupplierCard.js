// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import axios from "axios";

const DashboardSupplierCard = (val) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const API_URL = "http://13.61.26.58:5000";
  const [engines, setEngines] = useState(0);

  const fetchEngines = async () => {

    try {
      const engineRes = await axios.get(`${API_URL}/api/engines`, {
        headers: { Authorization: 'token' },
      });

      setEngines(engineRes.data.length);
    } catch (error) {
      console.error("Error fetching engines:", error.message);
    }
  };

  useEffect(() => {
    fetchEngines();
  }, []);
  const handleLogin = () => {
    dispatch(setSelectedKey("2"));

    navigate("/suppliers");
  };
  return (
    <div>
      <CardComponent
        val={120}
        onCardClick={handleLogin}
        title={"Suppliers"}
      ></CardComponent>
    </div>
  );
};

export default DashboardSupplierCard;
