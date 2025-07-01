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
import M2A from "../images/M2A-591.jpg";
import S11 from "../images/S11-900.jpg";

import S13 from "../images/s13-959.jpg";
import def from "../images/default.png";
import dayjs from "dayjs";
import { BackHand } from "@mui/icons-material";
import ReactCountryFlag from "react-country-flag";

const SelectedEngine = () => {
  const navigate = useNavigate();

  const { subClass } = useParams();
  const [engine, setEngine] = useState();
  const [failures, setFailures] = useState([]);

  const API_URL = "http://13.61.26.58:5000";
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState([]);

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
      title: "Drivcer ComNum",
      dataIndex: "drivcerComNum",
      key: "drivcerComNum",
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
    },
  ];

  const formatDate = (date) => {
    if (date) {
      return dayjs(date).format("DD/MM/YYYY"); // Format date as needed (e.g., 'DD/MM/YYYY')
    }
  };
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
      title: "Drivcer ComNum",
      dataIndex: "driverComNum",
      key: "driverComNum",
    },
    {
      title: "Engine",
      dataIndex: "engine",
      key: "engine",
    },
  ];
  const getData = async () => {
    setIsLoading(true);
    console.log("sadfdfadf");

    try {
      const response = await axios.get(
        `${API_URL}/api/engines/engineBySubClass?subClass=${subClass}`,
        {
          headers: { Authorization: "token" },
        }
      );
      const responseTrips = await axios.get(
        `${API_URL}/api/tripCards/tripsByEnginenumber?engine=${subClass}`,
        {
          headers: { Authorization: "token" },
        }
      );

      const responseFailues = await axios.get(
        `${API_URL}/api/engineFailures/engineFailureByEngine?engine=${subClass}`,
        {
          headers: { Authorization: "token" },
        }
      );
      if (responseTrips.status === 200) {
        console.log(responseTrips.data);
        setTrips(responseTrips.data);
      }
      if (response.status === 200) {
        setEngine(response.data);
        console.log(response.data);
      }
      if (responseTrips.status === 200) {
        console.log(responseTrips.data);
        setTrips(responseTrips.data);
      }
      if (responseFailues.status === 200) {
        console.log(responseFailues.data);

        setFailures(responseFailues.data);
      }
    } catch (error) {}
    setIsLoading(false);
  };
  useEffect(() => {

    getData();
  }, []);
  return (
    <>
      {engine ? (
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
                text="Engines"
                icon={<LeftCircleOutlined />}
                onClick={() => navigate(`/engines`)}
                type="rgba(0, 68, 145, 0.78)"
              />
              <CustomButton
                text="Refresh"
                icon={<ReloadOutlined />}
                onClick={getData}
                type="rgba(145, 0, 0, 0.78)"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottomColor: "black",
                borderBottom: "0.5px solid",
                paddingBottom: "3px",
              }}
            >
              <Row
                gutter={10}
                style={{
                  marginBottom: 15,
                  flex: 1,
                }}
              >
                <Col
                  span={8}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    justifyItems: "center",
                    borderRadius: 10,
                  }}
                >
                  <p style={{ marginTop: 5, fontSize: "12px" }}>
                    <Image
                      width={250}
                      preview={false}
                  
                      src={
                        engine.subClass == "M2A-591"
                          ? M2A
                          : engine.subClass == "S13-959"
                          ? S13
                          : engine.subClass == "S11-900"
                          ? S11
                          : def
                      }
                    />
                  </p>
                </Col>
                <Col
                  span={8}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    justifyItems: "start",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "35px" }}>
                    {engine.class}

                    <Tag
                      color={"green-inverse"}
                      style={{
                        fontWeight: "bold",
                        fontSize: "20px",
                        marginLeft: 20,
                      }}
                    >
                      {engine.year}
                    </Tag>
                  </h4>
                  <p style={{ fontSize: "12px" }}>
                    <Tag
                      color={"blue-inverse"}
                      style={{
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {engine.subClass}
                    </Tag>
                  </p>

                  <p style={{ marginTop: 0, fontSize: "12px" }}>
                    <Tag
                      color={"purple-inverse"}
                      style={{ fontWeight: "bold", fontSize: "15px" }}
                    >
                      Trips - {trips.length}
                    </Tag>
                    <Tag
                      color={"red-inverse"}
                      style={{ fontWeight: "bold", fontSize: "15px" }}
                    >
                      Failures - {failures.length}
                    </Tag>{" "}
                  </p>
                </Col>

                <Col
                  span={8}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    justifyItems: "start",
                  }}
                >
                  {" "}
                  <p style={{ fontSize: "15px", marginLeft: 10 }}>
                    Made In
                    <ReactCountryFlag
                      svg
                      style={{
                        borderColor: "black",
                        border: "0.5px solid",
                        width: "4em",
                        height: "3em",
                        marginLeft: 6,
                      }}
                      countryCode={engine.country}
                    />
                  </p>
                  <p style={{ fontSize: "15px", marginLeft: 10 }}>
                    Company - {engine.company}
                  </p>
                  <p style={{ marginTop: 1, fontSize: "15px", marginLeft: 10 }}>
                    Axle Structure - {engine.axleStructure}
                  </p>
                  <p style={{ marginTop: 1, fontSize: "15px", marginLeft: 10 }}>
                    Power Engine - {engine.powerEngine}
                  </p>
                </Col>
              </Row>
            </div>

            {engine?.specs?.length  ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottomColor: "black",
                  borderBottom: "0.5px solid",
                  paddingBottom: "3px",
                }}
              >
                <Row
                  gutter={10}
                  style={{
                    flex: 1,
                  }}
                >
                  <p style={{ marginTop: 1, fontSize: "18px", marginLeft: 10 }}>
                    {engine.specs}
                  </p>
                </Row>
              </div>
            ) : (
              <></>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
             
                paddingBottom: "3px",
              }}
            >
              <Row
                gutter={10}
                style={{
                  flex: 1,
                }}
              >
               
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
                      dataSource={trips}
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
                      dataSource={failures}
                      pagination={true} // Enable pagination
                      scroll={{ x: true }}
                      bordered
                      loading={isLoading}
                    />
                  </div>
                </Col>
              </Row>{" "}
            </div>
          </Card>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default SelectedEngine;
