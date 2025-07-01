// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import axios from "axios";

const DashboardFullTarget = (val) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [officers, setOfficers] = useState([]);

  const [monthlyTargets, setMonthlyTargets] = useState([]);
  const fetchOfficers = () => {
    axios
      .get("http://localhost:5000/api/officers")
      .then((res) => setOfficers(res.data));
  };

  const fetchMonthlyTargets = () => {
    axios.get("http://localhost:5000/api/monthly-target").then((res) => {
    
      setMonthlyTargets(res.data);
    });
  };

  useEffect(() => {
   // fetchOfficers();
   // fetchMonthlyTargets()
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
      ></CardComponent>
    </div>
  );
};

export default DashboardFullTarget;
