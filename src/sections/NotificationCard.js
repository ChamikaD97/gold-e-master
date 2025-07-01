// CardComponent.js
import React, { useEffect, useState } from "react";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

const NotificationCard = () => {

  const API_URL = "http://13.61.26.58:5000";

  

  return (
    <div>
      <CardComponent
        val={0}
      
        title={"Notifications"}
      ></CardComponent>
    </div>
  );
};

export default NotificationCard;
