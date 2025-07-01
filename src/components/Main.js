// CardComponent.js
import React, { useState } from "react";
import { Card, Button } from "antd";
import "../App.css"; // Import the CSS file
import CardComponent from "../componets/CardComponet";
import { Row, Col, Modal, Badge } from "antd";
import DashboardSupplierCard from "../sections/DashboardCard";
import DashboardTrackCard from "../sections/DashboardTrackCard";
const { Meta } = Card;

const Main = () => {
  const [isHovering, setIsHovering] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  return (
    <div>
      <div style={{ minHeight: 360, zIndex: 2, position: "relative" }}>
        <Row gutter={25} style={{ marginBottom: 15 }}>
          <Col span={8}>
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <DashboardSupplierCard />
            </div>
          </Col>
          <Col span={8}>
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <DashboardTrackCard />
            </div>
          </Col>
          <Col span={8}>
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <CardComponent
                title="New Track Caustions"
                description="This is a description of card 2."
                imageUrl="https://via.placeholder.com/240"
                buttonText="Click Me"
              />
            </div>
          </Col>
        </Row>
        
      </div>
    </div>
  );
};

export default Main;
