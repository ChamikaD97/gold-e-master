import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Input,
  Form,
  Button,
  Card,
  Select,
  notification,
} from "antd";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setOfficers, setOfficerLines, setSearch } from "../redux/officerSlice";

import { isLoading, setSelectedKey } from "../redux/authSlice";
import ReactCountryFlag from "react-country-flag";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ReloadOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons"; // Import the icon
import { CleanHands, CleanHandsOutlined, TrainOutlined } from "@mui/icons-material";
const { Option } = Select;
const { TextArea } = Input;

const TeaLine = () => {
  const { officerData, search } = useSelector((state) => state.eng);
  const { loading, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title) => {
    api[type]({
      message: title,
    });
  };
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState(officerData);
  const navigate = useNavigate();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAddNew = () => {
    setIsAddModalVisible(true);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };
  const API_URL =  "http://13.61.26.58:5000";
  const handleSubmit = async (values) => {
    try {
      dispatch(isLoading(true));
      // Send the data to the API
      await axios.post(`${API_URL}/api/engines`, values, {
        headers: { Authorization: "token" },
      });

      openNotificationWithIcon("success", "Engine Added Successfully");

      notification.success({
        message: "Engine Added",
        description: "The new engine data has been successfully added!",
      });
      dispatch(isLoading(false));
      closeAddModal(); // Close modal after success
    } catch (error) {
      dispatch(isLoading(false));
      openNotificationWithIcon("error", "Failed to Add Engine");
      console.error("Error adding engine:", error.message);
    }
  };
  const columns = [
    {
      title: "Route",
      dataIndex: "routes",
      key: "routes",
    },
    {
      title: "Route Code",
      dataIndex: "routesCode",
      key: "routesCode",
    },
    {
      title: "Line man",
      dataIndex: "lineman",
      key: "lineman",
    },
    {
      title: "Contact",
      dataIndex: "tel",
      key: "tel",
    },
    {
      title: "Suppliers",
      dataIndex: "suppliers",
      key: "suppliers",
    },
    
  ];

  const handleRowClick = (record) => {
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRow(null);
  };

  const exportToPDF = (data, columns, fileName) => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [columns],
      body: data.map((item) => columns.map((col) => item[col.key])),
    });
    doc.save(`${fileName}.pdf`);
  };
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    if (!value) {
      return;
    }
    const filtered = officerData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const fetchSuppliers = async () => {
    dispatch(setSearch());
    try {
      // // const token = await AsyncStorage.getItem("token");
      // // if (!token) return     navigate('/dashboard');
      // dispatch(isLoading(true));
      // const engineRes = await axios.get(`${API_URL}/api/engines`, {
      //   headers: { Authorization: "token" },
      // });

      // dispatch(engines(engineRes.data));
      setFilteredData(officerData);

      setTimeout(() => {
        dispatch(isLoading(false));
      }, 500);
    } catch (error) {
      console.error("Error fetching engines:", error.message);
    }
  };

  const handelMore = () => {
    navigate(`/engine/${selectedRow.subClass}`);
  };
  useEffect(() => {
    if (!search) {
      setFilteredData(officerData);
      return;
    }

    const filtered = officerData.filter((item) =>
      item.class?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(filtered);
  }, []);
  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {contextHolder}

            <CustomButton
              text="Refresh"
              onClick={fetchSuppliers}
              icon={<ReloadOutlined />}
              type="rgba(145, 0, 0, 0.64)"
            />
      
          </div>
          
          <h2 style={{ margin: 0 }} onClick={() => setFilteredData(officerData)}>
          Routes
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search"
              onClear={()=>setFilteredData(officerData)}
              onChange={handleSearch}
              allowClear={true}
              style={{
                width: "200px",
                height: "40px",
                borderRadius: "15px",
                marginRight: "10px",
              }}
            />
            
            <CustomButton
              text="Downlaod"
              icon={<DownloadOutlined />}
              onClick={() => exportToPDF(filteredData, columns, "TableData")}
              type="rgba(0, 15, 145, 0.79)"
            />
            <CustomButton
              text="Add New"
              icon={<PlusCircleOutlined />}
              onClick={() => handleAddNew()}
              type="rgba(21, 155, 0, 0.79)"
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
            dataSource={filteredData}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            pagination={true} // Disable pagination to show full data with scrolling
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
              <strong>Class:</strong> {selectedRow.class || "N/A"}
            </p>
            <p>
              <strong>Sub Class:</strong> {selectedRow.subClass || "N/A"}
            </p>
            <p>
              <strong>Power (Hp):</strong> {selectedRow["power(Hp)"] || "N/A"}
            </p>
            <p>
              <strong>Axle Structure:</strong>{" "}
              {selectedRow.axleStructure || "N/A"}
            </p>
            <p>
              <strong>Power Engine:</strong> {selectedRow.powerEngine || "N/A"}
            </p>
            <p>
              <strong>Year:</strong> {selectedRow.year || "N/A"}
            </p>

            <p>
              <strong>Axle Load(Weight/axcels):</strong>{" "}
              {selectedRow.powerEngine || "N/A"}
            </p>
            <p>
              <strong>Year:</strong> {selectedRow.year || "N/A"}
            </p>
            <p>
              <div></div>
              <strong>Country: </strong>
              <ReactCountryFlag
                svg
                style={{
                  width: "8em",
                  height: "5em",
                }}
                countryCode={selectedRow.country}
              />
            </p>
            <p>
              <strong>Company:</strong> {selectedRow.company || "N/A"}
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
                type="rgba(155, 119, 0, 0.79)"
              />
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title="Add New Engine"
        visible={isAddModalVisible}
        onCancel={closeAddModal}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onReset={closeAddModal}
          initialValues={{ country: "US" }} // Default values if needed
        >
          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please enter the class!" }]}
          >
            <Input placeholder="Enter class" />
          </Form.Item>

          <Form.Item
            label="Sub Class"
            name="subClass"
            rules={[{ required: true, message: "Please enter the sub-class!" }]}
          >
            <Input placeholder="Enter sub-class" />
          </Form.Item>

          <Form.Item
            label="Power (Hp)"
            name="powerHp"
            rules={[{ required: false, message: "Please enter power (Hp)!" }]}
          >
            <Input placeholder="Enter power (Hp)" />
          </Form.Item>

          <Form.Item
            label="Axle Structure"
            name="axleStructure"
            rules={[
              { required: false, message: "Please enter axle structure!" },
            ]}
          >
            <Input placeholder="Enter axle structure" />
          </Form.Item>

          <Form.Item
            label="Power Engine"
            name="powerEngine"
            rules={[{ required: false, message: "Please enter power engine!" }]}
          >
            <Input placeholder="Enter power engine" />
          </Form.Item>

          <Form.Item
            label="Year"
            name="year"
            rules={[
              {
                required: false,
                message: "Please enter the manufacturing year!",
              },
            ]}
          >
            <Input type="number" placeholder="Enter year" />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: false, message: "Please enter the country!" }]}
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item
            label="Company"
            name="company"
            rules={[
              { required: false, message: "Please enter the company name!" },
            ]}
          >
            <Input placeholder="Enter company" />
          </Form.Item>
          <Form.Item
            label="Condition"
            name="condition"
            rules={[
              { required: true, message: "Please select the condition!" },
            ]}
          >
            <Select placeholder="Select condition">
              <Option value="working">Working</Option>
              <Option value="not-working">Not Working</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Shed"
            name="shed"
            rules={[{ required: true, message: "Please enter the shed!" }]}
          >
            <Input placeholder="Enter Shed" />
          </Form.Item>
          <Form.Item
            label="Specifications"
            name="specifications"
            rules={[
              { required: false, message: "Please input specifications!" },
            ]}
          >
            <TextArea placeholder="Enter detailed specifications" rows={4} />
          </Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Form.Item>
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(21, 155, 0, 0.79)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  marginRight: "10px",

                  cursor: "pointer",
                  borderRadius: "12px",
                  color: "#fff",
                  border: "none",
                  outline: "none",
                }}
              >
                Submit
              </button>
            </Form.Item>{" "}
            <Form.Item>
              <button
                type="reset"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(155, 0, 0, 0.79)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  marginRight: "10px",

                  cursor: "pointer",
                  borderRadius: "12px",
                  color: "#fff",
                  border: "none",
                  outline: "none",
                }}
              >
                Reset
              </button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TeaLine;
