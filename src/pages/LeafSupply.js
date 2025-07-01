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

const LeafSupply = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [supplyData, setSupplyData] = useState([]);
  const [pageSize, setPageSize] = useState(10); // Add this state for page size

  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { loading } = useSelector((state) => state.auth);

  const API_URL = "http://192.168.1.4:8080";
  const fetchTripCards = async () => {
    try {
      // const token = await AsyncStorage.getItem("token");
      // if (!token) return navigation.navigate("Login");
      dispatch(isLoading(true));
      const deliveries = await axios.get(`${API_URL}/api/leafSupply`);
      console.log(deliveries.data);

      setSupplyData(deliveries.data);
      setFilteredData(deliveries.data);

      setTimeout(() => {
        dispatch(isLoading(false));
      }, 500);
    } catch (error) {
      console.error("Error fetching trip Cards:", error.message);
    }
    dispatch(isLoading(false));
  };
  useEffect(() => {
    fetchTripCards();
  }, []);
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

  const columns = [
    {
      title: "Reported Date",
      dataIndex: "recordedAt",
      key: "recordedAt",
      render: (recordedAt) => formatDate(recordedAt),
    },
    {
      title: "Supplier",
      dataIndex: "supplierId",
      key: "supplierId",
    },
    {
      title: "L/Ty",
      dataIndex: "lorryType",
      key: "lorryType",
      sorter: (a, b) => a.lorryType.localeCompare(b.lorryType), // Add sorting for L/Ty
    },
    {
      title: "Full(kg)",
      dataIndex: "fullWeightKg",
      key: "fullWeightKg",
      sorter: (a, b) => a.fullWeightKg - b.fullWeightKg, // Numeric sorting for Full(kg)
    },
    {
      title: "Gross",
      dataIndex: "grossWeight",
      key: "grossWeight",
    },
    {
      title: "Net (kg)",
      dataIndex: "netWeightKg",
      key: "netWeightKg",
      sorter: (a, b) => a.netWeightKg - b.netWeightKg, // Numeric sorting for Net (kg)
    },
    {
      title: "C",
      dataIndex: "c",
      key: "c",
    },
    {
      title: "Bag",
      dataIndex: "bagCount",
      key: "bagCount",
    },
    {
      title: "Bag (kg)",
      dataIndex: "bagWeightKg",
      key: "bagWeightKg",
    },
    {
      title: "Next Date",
      dataIndex: "recordedAt",
      key: "recordedAt",
      render: (recordedAt) => add7Days(recordedAt),
    },
    {
      title: "Count Down",
      dataIndex: "recordedAt",
      key: "countdown",
      render: (recordedAt) => {
        const diff = getDateDifference(dayjs(), add7Days(recordedAt));
        let tagText = "";
        if (diff < 0) {
          tagText = `Late by ${Math.abs(diff)} days`;
        } else if (diff === 0) {
          tagText = "Today";
        } else {
          tagText = `${diff} days left`;
        }
        return (
          <Tag
            color={diff < 0 ? "#9c2222" : diff === 0 ? "#f50" : "#007f2d"}
            style={{ fontSize: "12px" }}
          >
            {tagText}
          </Tag>
        );
      },
    },
  ];
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    if (!value) {
      setFilteredData(supplyData);
      return;
    }
    const filtered = filteredData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleRowClick = (record) => {
    console.log(record);

    navigate(`/supplier/${record.supplierId}`);
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
              onClick={fetchTripCards}
              type="rgba(145, 0, 0, 0.78)"
            />
          </div>

          <h2
            style={{ margin: 0 }}
            onClick={() => setFilteredData(filteredData)}
          >
            Leaf Supply Records
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
              bordered={true}
              style={{
                width: "300px",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid black",
              }}
              allowClear={true}
            />
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
            rowKey="_id"
            dataSource={filteredData}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
              },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: true }}
            bordered
            loading={false}
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
              <strong>Date:</strong> {selectedRow.createdAt || "N/A"}
            </p>
            <p>
              <strong>Engine:</strong> {selectedRow.engine || "N/A"}
            </p>
            <p>
              <strong>Driver:</strong> {selectedRow.driverComNum || "N/A"}
            </p>

            <p>
              <strong>Train Number :</strong> {selectedRow.trainNumber || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeafSupply;
