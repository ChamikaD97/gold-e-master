import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Table,
  Modal,
  Input,
  Form,
  Button,
  Card,
  Select,
  DatePicker,
  notification,
} from "antd";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";

import {
  ReloadOutlined,
  DownloadOutlined,
  PlusCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons"; // Import the icon
const { Option } = Select;
const { TextArea } = Input;
const AddAchievement = () => {
  const [officers, setOfficers] = useState([]);

  const [achievements, setIsAchievements] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState();
  const [selectedDate, setSelectedDate] = useState("");
  const [monthlyTargets, setMonthlyTargets] = useState([]);

  const [total, setTotal] = useState("");
  const [selectedLine, setSelectedLine] = useState("");
  const [target, setTarget] = useState("");
  const [monthlyValue, setMonthlyValue] = useState();

  const tot = useRef();
  const handleSearch = (officer) => {
    setSelectedOfficer(officer);
    if (!officer) {
      setFilteredData(achievements);
      return;
    }

    const filtered = achievements.filter(
      (item) => item.officer_id === officer.id
    );
    let totalValue = 0;
    totalValue = achievements.reduce((sum, item) => sum + item.value, 0);
    tot.current = totalValue;
    setTotal(totalValue);
    totalValue = 0;
    setFilteredData(filtered);
  };
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/officers")
      .then((res) => setOfficers(res.data));

    axios.get("http://localhost:5000/api/achievements").then((res) => {
      setFilteredData(res.data);
      setIsAchievements(res.data);
    });
  }, []);
  const months = [
    { id: "jan", name: "January" },
    { id: "feb", name: "February" },
    { id: "mar", name: "March" },
    { id: "apr", name: "April" },
    { id: "may", name: "May" },
    { id: "jun", name: "June" },
    { id: "jul", name: "July" },
    { id: "aug", name: "August" },
    { id: "sep", name: "September" },
    { id: "oct", name: "October" },
    { id: "nov", name: "November" },
    { id: "dece", name: "December" }, // matches your key: 'dece'
  ];
  const [selectedRow, setSelectedRow] = useState(null);
  const [isAchievementModalVisible, setIsAchievementModalVisible] =
    useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [achievementForm] = Form.useForm();

  const handleAddNew = () => {
    setIsAchievementModalVisible(true);
  };

  const closeAchievementModal = () => {
    setIsAchievementModalVisible(false);
    achievementForm.resetFields();
  };
  const handleAchievementSubmit = async (values) => {
    console.log("12367817812", values);

    const date = new Date(values.date);
    const month = date
      .toLocaleString("default", { month: "short" })
      .toLowerCase();
    const year = date.getFullYear();
    const data = {
      officer_id: values.officer,
      date: values.date,
      month,
      year,
      line: values.line,
      gold_leaf: values.gold_leaf,
      value: parseFloat(values.target),
    };
    console.log(data);

    await axios.post("http://localhost:5000/api/achievements", data);
    closeAchievementModal();
  };
  const columns = [
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
      width: 120,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      width: 120,
    },
    {
      title: "Officer ID",
      dataIndex: "officer_id",
      key: "officer_id",
      width: 120,
    },
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
      filters: [
        { text: "Line 1", value: "Line 1" },
        { text: "Line 2", value: "Line 2" },
      ],
      onFilter: (value, record) => record.line.includes(value),
      width: 100,
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      sorter: (a, b) => a.month - b.month,
      width: 100,
    },
    {
      title: "Recieved (kg)",
      dataIndex: "value",
      key: "value",
      sorter: (a, b) => a.value - b.value,
      width: 100,
    },

    {
      title: "Gold Leaf",
      dataIndex: "gold_leaf",
      key: "gold_leaf",
      sorter: (a, b) => a.value - b.value,
      width: 100,
    },

    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
      width: 100,
    },
  ];

  const getMonthData = (value) => {
    
    console.log(value);

    const filtered = filteredData.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value.id)
    );
    setFilteredData(filtered);
  };
  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid black",

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
              type="rgba(145, 0, 0, 0.78)"
            />
          </div>

          <h2 style={{ margin: 0 }}>Achievements</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* <Input
              placeholder="Search..."
              style={{
                width: "300px",
                height: "40px",
                borderRadius: "10px",
              }}
              allowClear={true}
            /> */}
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
            borderBottom: "1px solid black",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // Distribute buttons evenly
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "10px",
              marginTop: "10px",
              width: "100%",
            }}
          >
            {months.map((month) => (
              <CustomButton
                key={month.id}
                text={month.name}
                onClick={() => getMonthData(month)} // ✅ Pass the month id
                type="rgba(0, 0, 0, 0.78)"
              />
            ))}
          </div>
        </div>
        <div
         style={{
          display: "flex",
          justifyContent: "space-between", // Distribute buttons evenly
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "10px",
          marginTop: "10px",
          width: "100%",        borderBottom: "1px solid black",
          paddingBottom: "10px",
        }}
      >
          <CustomButton
            text="All"
            onClick={() => {
              setSelectedOfficer();

              setFilteredData(achievements);
            }}
            type="rgba(21, 155, 0, 0.79)"
          />
          {officers.map((off) => (
            <CustomButton
              onClick={() => handleSearch(off)}
              text={off.id + "-" + off.name}
              type="rgba(0, 10, 145, 0.78)"
            />
          ))}{" "}
          <CustomButton
            text="MALIDUWA"
            onClick={() => handleSearch({ id: 6 })}
            type="rgba(0, 0, 0, 0.79)"
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
            onRow={(record) => ({})}
            pagination={true} // Disable pagination to show full data with scrolling
            scroll={{ x: true }}
            bordered
          />
        </div>
      </Card>

      <Modal
        title="Add Achievement"
        visible={isAchievementModalVisible}
        onCancel={closeAchievementModal}
        footer={null}
        centered
      >
        <Form
          layout="vertical"
          form={achievementForm}
          onFinish={handleAchievementSubmit}
          onReset={closeAchievementModal}
        >
          <Form.Item
            label="Officer"
            name="officer"
            rules={[{ required: true, message: "Please select an officer!" }]}
          >
            <Select placeholder="Select Officer">
              {officers.map((off) => (
                <Option key={off.id} value={off.id}>
                  {off.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please pick a date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Line"
            name="line"
            rules={[{ required: true, message: "Please enter the line!" }]}
          >
            <Input placeholder="Enter line name" />
          </Form.Item>

          <Form.Item
            label="Fullfilled"
            name="target"
            rules={[
              { required: true, message: "Please enter the target value!" },
            ]}
          >
            <Input
              bordered={true}
              type="number"
              placeholder="Enter target value"
            />
          </Form.Item>
          <Form.Item
            label="Gold leaf"
            name="gold_leaf"
            rules={[
              { required: true, message: "Please enter the target value!" },
            ]}
          >
            <Input
              bordered={true}
              type="number"
              placeholder="Enter target value"
            />
          </Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
            <Form.Item>
              <Button danger type="default" htmlType="reset">
                Cancel
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AddAchievement;
