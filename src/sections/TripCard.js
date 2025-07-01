// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedKey } from "../redux/authSlice";
import axios, { Axios } from "axios";
const TripCard = () => {

  const API_URL = "http://13.61.26.58:5000";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tripsCount, setTrips] = useState(0);

  const fetchTripCards = async () => {
    try {

      const trips = await axios.get(`${API_URL}/api/tripCards`, {
        headers: { Authorization: "token" },
      });
      setTrips(trips.data.length);


    } catch (error) {
      console.error("Error fetching trip Cards:", error.message);
    }
  };
  useEffect(() => {
    fetchTripCards();
  }, []);

  const handleOnClick = () => {
    dispatch(setSelectedKey("5"));
  };

  return (
    <div>
      <CardComponent
        val={tripsCount}
        onCardClick={handleOnClick}
        title={"Trips"}
      ></CardComponent>
    </div>
  );
};

export default TripCard;
