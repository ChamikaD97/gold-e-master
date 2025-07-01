import React, { useState } from "react";
import { Table, Modal, Input, Card, Tag } from "antd";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // Import dayjs
import {
  engineFailures,
  pendingEngineFailures,
  completedEngineFailures,
  inProgressEngineFailures,
} from "../redux/failureSlice";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import { isLoading } from "../redux/authSlice";
import {
  ReloadOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons"; // Import the icon
//
const Failures = () => {
  const {
    engineFailuresData,
    completedEngineFailureData,
    inProgressEngineFailureData,
    pendingEngineFailureData,
  } = useSelector((state) => state.engFail);
  const [filteredData, setFilteredData] = useState(engineFailuresData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [name, setName] = useState("LOCO FAILURES");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const API_URL =  "http://13.61.26.58:5000";
  const fetchEngineFailures = async () => {
    try {
      // const token = await AsyncStorage.getItem("token");
      // if (!token) return navigation.navigate("Login");

      const efDta = await axios.get(`${API_URL}/api/engineFailures`, {
        headers: { Authorization: "token" },
      });

      dispatch(engineFailures(efDta.data));
      setFilteredData(engineFailuresData);
      dispatch(
        pendingEngineFailures(efDta.data.filter((s) => s.status == "pending"))
      );
      dispatch(
        inProgressEngineFailures(
          efDta.data.filter((s) => s.status == "inProgress")
        )
      );
      dispatch(
        completedEngineFailures(
          efDta.data.filter((s) => s.status == "completed")
        )
      );
      setTimeout(() => {
        dispatch(isLoading(false));
      }, 500);
    } catch (error) {
      console.error("Error fetching engineFailures:", error.message);
    }
  };
  const getStatusTagColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "inprogress":
        return "orange";
      case "pending":
        return "blue";
      default:
        return "gray";
    }
  };
  const formatDate = (date) => {
    if (date) {
      return dayjs(date).format("DD/MM/YYYY"); // Format date as needed (e.g., 'DD/MM/YYYY')
    }
  };
  const getDateDifference = (reportedDate, completedDate) => {
    if (reportedDate && completedDate) {
      const diffInDays = dayjs(completedDate).diff(dayjs(reportedDate), "day");
      return diffInDays; // Returns the difference in days
    }
    return 0;
  };
  const columns = [
    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },
    {
      title: "Driver",
      dataIndex: "drivcerComNum",
      key: "drivcerComNum",
    },
    {
      title: "Reported Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Failure",
      dataIndex: "failure",
      key: "failure",
    },

    // {
    //   title: "Comments",
    //   dataIndex: "comments",
    //   key: "comments",
    // },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusTagColor(status)} style={{ fontWeight: "bold" }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Started Date",
      dataIndex: "startedOn",
      key: "startedOn",
      render: (startedOn) => formatDate(startedOn),
    },
    {
      title: "Completed Date",
      dataIndex: "completedOn",
      key: "completedOn",
      render: (completedOn) => formatDate(completedOn), // Use the formatDate function here
    },
    {
      title: "LFC",
      dataIndex: "LFCComNum",
      key: "LFCComNum",
    },
    {
      title: "Assigned LF",
      dataIndex: "assingedTo",
      key: "assingedTo",
    },
    {
      title: "Days to Complete", // Add new column for days difference
      dataIndex: "dateDiff",
      key: "dateDiff",
      render: (_, record) => {
        const diff = getDateDifference(record.date, record.completedOn);
        return diff ? `${diff} days` : "N/A";
      },
    },
  ];

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    if (!value) {
      return;
    }
    const filtered = engineFailuresData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleRowClick = (record) => {
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRow(null);
  };

  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomColor: "black",
            borderBottom: "0.5px solid",
            paddingBottom: "3px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CustomButton
              text="Refresh"
              icon={<ReloadOutlined />}
              onClick={fetchEngineFailures}
              type="rgba(145, 0, 0, 0.78)"
            />
          </div>
          <h2
            style={{ margin: 0 }}
            onClick={() => setFilteredData(filteredData)}
          >
            {name}
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search..."
              onChange={handleSearch}
              style={{ width: "300px", height: "40px", borderRadius: "15px" }}
            />
            <CustomButton text="Downlaod" type="rgba(0, 15, 145, 0.79)" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            paddingBottom: "3px",
            paddingTop: "3px",
            borderBottomColor: "black",
            borderBottom: "1px solid",
          }}
        >
          <CustomButton
            text={"ENGINE FAILURES - " + engineFailuresData?.length}
            onClick={() => {
              setFilteredData(engineFailuresData);
              setName("LOCO FAILURES");
            }}
            type="rgb(0, 0, 0)"
          />
          <CustomButton
            text={"PENDING - " + pendingEngineFailureData?.length}
            onClick={() => {
              setFilteredData(pendingEngineFailureData);
              setName("PENDING FAILURES");
              setFilteredData(pendingEngineFailureData);
            }}
            type="rgba(0, 0, 145, 0.78)"
          />
          <CustomButton
            text={"IN PROGRESS  - " + inProgressEngineFailureData?.length}
            onClick={() => {
              setFilteredData(inProgressEngineFailureData);
              setName("IN PROGRESS FAILURES");
              setFilteredData(inProgressEngineFailureData);
            }}
            type="rgba(145, 99, 0, 0.78)"
          />
          <CustomButton
            text={"COMPLETED  - " + completedEngineFailureData?.length}
            onClick={() => {
              setFilteredData(completedEngineFailureData);
              setName("COMPLETED FAILURES");
            }}
            type="rgba(0, 145, 0, 0.78)"
          />
        </div>

        <div
          style={{
            maxHeight: "calc(100vh - 200px)", // Adjust height to fit window
            overflowY: "auto", // Enable vertical scrolling for the table only
            borderRadius: "15px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            padding: "10px",
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            pagination={true} // Enable pagination
            scroll={{ x: true }}
            bordered
            loading={loading}
          />
        </div>
      </Card>
      <Modal
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        bodyStyle={{ padding: "20px", fontSize: "16px" }}
      >
        {selectedRow && (
          <div>
            <p>
              <strong>Engine:</strong> {selectedRow.engine || "N/A"}
            </p>
            <p>
              <strong>Driver:</strong> {selectedRow.drivcerComNum || "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {selectedRow.date || "N/A"}
            </p>
            <p>
              <strong>Failure:</strong> {selectedRow.failure || "N/A"}
            </p>
            <p>
              <strong>Comments:</strong> {selectedRow.comments || "N/A"}
            </p>
           
            <p>
              <strong>Status: </strong>
              <Tag
                color={getStatusTagColor(selectedRow.status)}
                style={{ fontWeight: "bold" }}
              >
                {selectedRow.status.toUpperCase()}
              </Tag>
            </p>
            <p>
              <strong>LFC:</strong> {selectedRow.LFCComNum || "N/A"}
            </p>
            <p>
              <strong>Assigned LF:</strong> {selectedRow.assingedTo || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Failures;
