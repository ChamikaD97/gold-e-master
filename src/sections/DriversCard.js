// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import axios, { Axios } from "axios";
const DriversCard = () => {

  const API_URL = "http://13.61.26.58:5000";
  const navigate = useNavigate();
  const dispatch = useDispatch();
const [users, setUserData] = useState([]);
  const fetchTripCards = async () => {
    try {

      const users = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: "token" },
      });
      setUserData(users.data.length);


    } catch (error) {
      console.error("Error fetching trip Cards:", error.message);
    }
  };
  useEffect(() => {
    fetchTripCards();
  }, []);

  const handleOnClick = () => {
    dispatch(setSelectedKey("6"));
    navigate("/users");
  };

  return (
    <div>
      <CardComponent
        val={users}
        onCardClick={handleOnClick}
        title={"Drivers"}
      ></CardComponent>
    </div>
  );
};

export default DriversCard;
