// CardComponent.js
import React from "react";
import { Card } from "antd";
import "../App.css"; // Import the CSS file
import CardComponent from "../components/CardComponet";

const { Meta } = Card;

const DashboardTrackCard = () => {
  return (
    <div>
      <CardComponent

        title="New Track Caustions"
        description="This is a description of card 2."
        imageUrl="https://via.placeholder.com/240"
        buttonText="Click Me"
      />
    </div>
  );
};

export default DashboardTrackCard;
