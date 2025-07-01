import React, { useState, useEffect } from "react";
import { Table, Modal, Input, Card, Tag } from "antd";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // Import dayjs

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import { isLoading } from "../redux/authSlice";
import {
  ReloadOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons"; // Import the icon

const Users = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUserData] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const API_URL = "http://13.61.26.58:5000";

  const fetchUsers = async () => {
    try {
      // const token = await AsyncStorage.getItem("token");
      // if (!token) return navigation.navigate("Login");
      dispatch(isLoading(true));
      const users = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: "token" },
      });
      setUserData(users.data);
      setFilteredData(users.data);

      setTimeout(() => {
        dispatch(isLoading(false));
      }, 500);
    } catch (error) {
      dispatch(isLoading(false));
      console.error("Error fetching users", error.message);
    }
    dispatch(isLoading(false));
  };

  const handelMore = () => {
    navigate(`/user/${selectedRow.comNum}`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
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
      title: "Driver Computer Number",
      dataIndex: "comNum",
      key: "comNum",
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "NIC",
      dataIndex: "nic",
      key: "nic",
    },
    //{ title: "Mobile", dataIndex: "mobile", key: "mobile" },

    //{ title: "Address", dataIndex: "address", key: "address" },
    // {
    //   title: "attempts",
    //   dataIndex: "attempts",
    //   key: "attempts",
    // },
  ];

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    if (!value) {
      setFilteredData(users);
      return;
    }
    const filtered = filteredData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleRowClick = (record) => {
    navigate(`/user/${record.comNum}`);
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
              onClick={fetchUsers}
              type="rgba(145, 0, 0, 0.78)"
            />
          </div>

          <h2
            style={{ margin: 0 }}
            onClick={() => setFilteredData(filteredData)}
          >
            Drivers
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
        bodyStyle={{ padding: "10px", fontSize: "16px" }}
      >
        {selectedRow && (
          <div>
            <p>
              <strong>Driver:</strong> {selectedRow.comNum || "N/A"}
            </p>
            <p>
              <strong>Driver Name:</strong> {selectedRow.name || "N/A"}
            </p>
            <p>
              <strong>NIC:</strong> {selectedRow.nic || "N/A"}
            </p>
            
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <CustomButton
                text="More"
                icon={<MoreOutlined />}
                onClick={() => handelMore()}
                type="rgba(26, 155, 0, 0.79)"
              />
            </div>
          </div>
          
        )}
      </Modal>
    </div>
  );
};

export default Users;
