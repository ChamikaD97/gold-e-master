import React, { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Spin, notification, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import CustomButton from "../components/CustomButton";
import { LeftCircleOutlined, DeleteFilled } from "@ant-design/icons";
import "./SingleTrip.css"; // Assuming you will create a separate CSS file
import { Alert } from "antd";

const SingleTrip = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = "http://13.61.26.58:5000"
  //   const [alertShow, showAlert] = useState(false);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/tripCards/tripCardById?Id=${Id}`,
        {
          headers: { Authorization: "token" },
        }
      );
      setTrip(response.data);
    } catch (error) {
      console.error("Error fetching trip:", error.message);
      notification.error({
        message: "Error",
        description: "Failed to fetch trip details.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Call showConfirm() when you need to display the confirmation popup.

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/tripCards/tripCardById?Id=${Id}`, {
        headers: { Authorization: "token" },
      });
      notification.success({
        message: "Success",
        description: "Trip deleted successfully.",
      });
      
      setTimeout(() => {
      
        navigate("/trips"); // Redirect to trips page after deletion
      }, 1000);
    } catch (error) {
      console.error("Failed to delete trip:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while deleting the trip.",
      });
    }
  };

  // Format date using dayjs
  const formatDate = (date) => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "N/A";
  };

  // Fetch trip details on component mount
  useEffect(() => {
    fetchTrip();
  }, [Id]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  }

  // Render trip details
  return (
    <>
     
      {trip ? (
        <Card>
          <Row gutter={10}>
            <Col span={12}>
              <h4 style={{ margin: 0, fontSize: "20px" }}>
                {trip.trainNumber}
              </h4>
              <h4 style={{ margin: 0, fontSize: "20px" }}>{trip.engine}</h4>
              <Tag
                color={"green-inverse"}
                style={{ fontWeight: "bold", fontSize: "15px" }}
              >
                {formatDate(trip.createdAt)}
              </Tag>
              <p style={{ fontSize: "15px" }}>
                {trip.driverName} ({trip.driverComNum})
              </p>
            </Col>
            <Col span={12}>
              <h4 style={{ margin: 0, fontSize: "20px" }}>Reported Failures</h4>
              <Tag
                color={"green-inverse"}
                style={{ fontWeight: "bold", fontSize: "15px" }}
              >
                {formatDate(trip.createdAt)}
              </Tag>
              <p style={{ fontSize: "15px" }}>{trip.driverName}</p>
            </Col>
          </Row>
          <CustomButton
                text="Engines"
                icon={<LeftCircleOutlined />}
                onClick={() => handleDelete()}
                type="rgba(0, 68, 145, 0.78)"
              />
        </Card>
      ) : (
        <p>No trip data found.</p>
      )}
    </>
  );
};

export default SingleTrip;
