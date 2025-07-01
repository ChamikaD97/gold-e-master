import React, { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Spin, notification, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import CustomButton from "../components/CustomButton";
import { LeftCircleOutlined, DeleteFilled } from "@ant-design/icons";
import "./SingleTrip.css"; // Assuming you will create a separate CSS file
import { Alert } from "antd";
import { Iso } from "@mui/icons-material";

const SupplierLeafData = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [diff, setDiff] = useState("");

  const [loading, setLoading] = useState(false);
  const API_URL = "http://192.168.1.4:8080";

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/leafSupply/${Id}`, {
        headers: { Authorization: "token" },
      });
      setData(response.data[0]);
      console.log(response.data[0]);

      const diff = getDateDifference(
        dayjs(),
        add7Days(response.data[0].recordedAt)
      );

      let tagText = "";
      if (diff < 0) {
        tagText = `Late by ${Math.abs(diff)} days`;
      } else if (diff === 0) {
        tagText = "Today";
      } else {
        tagText = `${diff} days left`;
      }
      setDiff(tagText);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      notification.error({
        message: "Error",
        description: "Failed to fetch data details.",
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
    if (date) {
      return dayjs(date).format("YYYY-MM-DD"); // Format date as needed (e.g., 'DD/MM/YYYY')
    }
  };
  const add7Days = (date) => {
    if (date) {
      return dayjs(date).add(7, "day").format("YYYY-MM-DD");
    }
  };

  const getDateDifference = (reportedDate, completedDate) => {
    if (reportedDate && completedDate) {
      const diffInDays = dayjs(completedDate).diff(dayjs(reportedDate), "day");
      return diffInDays; // Returns the difference in days
    }
    return 0;
  };

  // Fetch trip details on component mount
  useEffect(() => {
    fetchData();
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
      {data ? (
        <Card>
          <Row gutter={10}>
            <Col span={12}>
            <Tag
                color={"processing"}
                style={{ fontWeight: "bold", fontSize: "14px" }}
              >
                {formatDate(data.deliveryDate)}
              </Tag>
              <h4 style={{ margin: 0, fontSize: "20px" }}>
                {data.supplierName} - {Id}
              </h4>
              
              <Tag
                color={
                  getDateDifference(dayjs(), add7Days(data.recordedAt)) < 0
                    ? "red"
                    : diff === 0
                    ? "#f50"
                    : "green"
                }
                style={{ fontWeight: "bold",fontSize: "15px" }}
              >
                {diff}
              </Tag>
              <p style={{ fontWeight: "bold", fontSize: "13px" }}>
                Tare {data.d1}
              </p>
              <p style={{ fontWeight: "bold", fontSize: "13px" }}>
                Water {data.d2}
              </p>
              <p style={{ fontWeight: "bold", fontSize: "13px" }}>
                Coarse Leaf {data.d3}
              </p>
              <p style={{ fontWeight: "bold", fontSize: "13px" }}>
                Boiled Leaf {data.d4}
              </p>
            </Col>
            <Col span={12}>
              <p style={{ fontSize: "15px" }}>{data.driverName}</p>
            </Col>
          </Row>
        </Card>
      ) : (
        <p>No data data found.</p>
      )}
    </>
  );
};

export default SupplierLeafData;
