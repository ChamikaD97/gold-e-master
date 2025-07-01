import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Image,
  Flex,
  Space,
  Tag,
  Row,
  Col,
  Table,
} from "antd";
import { useDispatch } from "react-redux";
import { login, userToken } from "../redux/authSlice";
import CustomButton from "../components/CustomButton";
import { ToastContainer, toast } from "react-toastify";

import {
  LeftCircleFilled,
  LeftCircleOutlined,
  LockFilled,
  LockOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DashboardSupplierCard from "../sections/DashboardSupplierCard";
import DailyData from "../sections/DailyData";
import DashboardFieldOfficersCard from "../sections/DashboardFieldOfficersCard";
import TripCard from "../sections/TripCard";
import Driver from "../images/Driver.jpg"; // Adjust the path accordingly
import dayjs from "dayjs";
import { BackHand } from "@mui/icons-material";

const SelectedUser = () => {
  const { comNum } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleRegister = () => {
    navigate("/register");
  };
  const [isLoading, setIsLoading] = useState(false);
  const [driver, setSelectedDriver] = useState([]);
  const [driverTrips, setSelectedDriverTrips] = useState([]);

  const [driverFailures, setSelectedDriverFailures] = useState([]);
  const API_URL =  "http://13.61.26.58:5000";

  const formatDate = (date) => {
    if (date) {
      return dayjs(date).format("DD/MM/YYYY"); // Format date as needed (e.g., 'DD/MM/YYYY')
    }
  };
 
  const columnFailure = [
    {
      title: "Reported Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },

    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
    },
  ];

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },

    {
      title: "Train Number",
      dataIndex: "trainNumber",
      key: "trainNumber",
    },

    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },
  ];

  const getUserData = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/user/driverByDrivcerComNum?comNum=${comNum}`,
        {
          headers: { Authorization: "token" },
        }
      );
      const responseTrips = await axios.get(
        `${API_URL}/api/tripCards/tripsByDriverComnumber?driverComNum=${comNum}`,
        {
          headers: { Authorization: "token" },
        }
      );

      const responseFailues = await axios.get(
        `${API_URL}/api/engineFailures/engineFailuresByDrivcerComNum?drivcerComNum=${comNum}`,
        {
          headers: { Authorization: "token" },
        }
      );

      if (response.status === 200) {
        setSelectedDriver(response.data);
        if (responseTrips.status === 200) {
          setSelectedDriverTrips(responseTrips.data);
        }
        if (responseFailues.status === 200) {
          setSelectedDriverFailures(responseFailues.data);
        }
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getUserData();
    console.log(driver);
  }, []);
  return (
    <>
      {!isLoading ? (
        <>
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",

                paddingBottom: "10wpx",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <CustomButton
                text="Drivers"
                icon={<LeftCircleOutlined />}
                onClick={() => navigate(`/users`)}
                type="rgba(0, 68, 145, 0.78)"
              />
              <CustomButton
                text="Refresh"
                icon={<ReloadOutlined />}
                onClick={getUserData}
                type="rgba(145, 0, 0, 0.78)"
              />
            </div>
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
              <Row
                gutter={10}
                style={{
                  marginTop: 15,
                  marginBottom: 15,
                  flex: 1,
                  justifyItems: "center",
                }}
              >
                <Col
                  span={6}
                  style={{
                    flex: 1,

                    marginLeft: 75,
                    justifyItems: "center",
                  }}
                >
                  <Image
                    width={250}
                    style={{
                      border: "solid",
                      borderWidth: 1,
                      borderRadius: 150,
                    }}
                    preview={false}
                    src={Driver}
                  />
                </Col>
                <Col
                  span={18}
                  style={{
                    flex: 1,
                    justifyItems: "start",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "35px" }}>
                  Mr.   {driver.name}

                    <Tag
                      color={"blue-inverse"}
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        marginLeft: 10,
                      }}
                    >
                      {comNum}
                    </Tag>
                  </h4>
                  <p style={{ marginTop: 5, fontSize: "12px" }}>
                    <Tag
                      color={"purple-inverse"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Trips - {driverTrips.length}
                    </Tag>
                    <Tag
                      color={"orange-inverse"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Failures - {driverFailures.length}
                    </Tag>{" "}
                    <Tag
                      color={"red-inverse"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Accidents
                    </Tag>{" "}
                  </p>
                  <p style={{ marginTop: 5, fontSize: "12px" }}>
                    <Tag
                      color={"red-inverse"}
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        marginTop: 5,
                      }}
                    >
                      Blood Group
                    </Tag>
                    <Tag
                      color={"green-inverse"}
                      style={{ fontWeight: "bolder", fontSize: "12px" }}
                    >
                      Driver Grade
                    </Tag>
                    <Tag
                      color={"geekblue-inverse"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Joinned Date
                    </Tag>
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    <Tag
                      color={"green"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      {driver.nic}
                    </Tag>
                    <Tag
                      color={"green"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      DOB
                    </Tag>{" "}
                    <Tag
                      color={"green"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Mobile
                    </Tag>{" "}
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    <Tag
                      color={"green"}
                      style={{ fontWeight: "bold", fontSize: "12px" }}
                    >
                      Address
                    </Tag>
                  </p>{" "}
                </Col>
              </Row>
            </div>
            <div>
              <Row
                gutter={10}
                style={{
                  marginBottom: 15,
                  flex: 1,
                }}
              >
                <Col span={8}>
                  <h4 style={{ margin: 10, fontSize: "25px" }}>Trips</h4>
                  <div
                    style={{
                      maxHeight: "calc(100vh - 520px)", // Adjust height to fit window
                      overflowY: "auto", // Enable vertical scrolling for the table only
                      borderRadius: "15px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                      padding: "10px",
                    }}
                  >
                    <Table
                      columns={columns}
                      dataSource={driverTrips}
                      pagination={true} // Enable pagination
                      scroll={{ x: true }}
                      bordered
                      loading={isLoading}
                    />
                  </div>
                </Col>
                <Col span={16}>
                  <h4 style={{ margin: 10, fontSize: "25px" }}>Failures</h4>
                  <div
                    style={{
                      maxHeight: "calc(100vh - 520px)", // Adjust height to fit window
                      overflowY: "auto", // Enable vertical scrolling for the table only
                      borderRadius: "15px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                      padding: "10px",
                    }}
                  >
                    <Table
                      columns={columnFailure}
                      dataSource={driverFailures}
                      pagination={true} // Enable pagination
                      scroll={{ x: true }}
                      bordered
                      loading={isLoading}
                    />
                  </div>
                </Col>
              </Row>{" "}
            </div>

            <ToastContainer />
          </Card>
        </>
      ) : (
        <> </>
      )}
    </>
  );
};

export default SelectedUser;
