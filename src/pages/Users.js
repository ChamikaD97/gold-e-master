import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Select,
  Space,
  Table,
  Modal,
  message,
  Input,
} from "antd";
import CircularLoader from "../components/CircularLoader";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { deleteUser, getUsers, updateUser } from "../api/api";
import { toast } from "react-toastify";

const { Option } = Select;

const Users = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      dispatch(showLoader());

      const res = await getUsers(); // Full list of users

      // ✅ Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

      // ✅ Filter out the current user by username or id
      const filteredUsers = (res || []).filter(
        (user) => user.username !== currentUser?.username
      );

      setUserList(filteredUsers);
    } catch (err) {
      toast.error("Failed to fetch user list.");
    } finally {
      setLoading(false);
      dispatch(hideLoader());
    }
  };



  const editUser = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        username: editingUser.username,
        role: editingUser.role,
        status: editingUser.status,
      });

      message.success("User updated successfully");
      setIsModalVisible(false);
      fetchData(); // Refresh the table
    } catch (err) {
      console.error(err);
      message.error("Failed to update user");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleEdit = (record) => {
    setEditingUser(record);
    setIsModalVisible(true);
  };


  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This will permanently delete the user.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
           await deleteUser(id);
          message.success("User deleted successfully");
          await fetchData(); // Refresh the user list
        } catch (err) {
          console.error(err);
          message.error("Failed to delete user");
        }
      },
    });
  };


  const userColumns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: text => (
        <span
          style={{

            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 16,
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {text}
        </span>
      )
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          style={{
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 14,
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
            transition: "transform 0.2s",

            backgroundColor:
              role === "Admin"
                ? "#e67e22"
                : role === "Super Admin"
                  ? "#288a24ff"
                  : "#2980b9",


          }}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
            fontSize: 14,
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
            transition: "transform 0.2s",

            backgroundColor:
              status
                ? "#288a24ff"

                : "#b92929ff",


          }}
        >
          {status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button danger type="primary" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6,
  };

  return (
    <>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
          {userList.length > 0 && (
            <Card bordered={false} style={cardStyle}>
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                  <div style={{ fontWeight: "normal", fontSize: 20 }}>
                    User Management
                  </div>
                </Col>
                <Col>
                  <Space>

                    <Input
                      className="custom-supplier-input"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}



                      placeholder="Search by ID or Name"
                      style={{
                        width: "100%",
                        backgroundColor: "rgb(0, 0, 0)",
                        color: "#fff",
                        border: "1px solid #333",
                        borderRadius: 6
                      }}
                      allowClear
                    />
                  </Space>
                </Col>
              </Row>

            </Card>
          )}


          {userList.length > 0 && (


            <Table
              className="sup-bordered-table"
              dataSource={
                userList
                  .filter(user =>
                    user.username?.toLowerCase().includes(searchText.toLowerCase())
                  )
                  .map((item, index) => ({ ...item, key: index }))
              }
              columns={userColumns}
              pagination={false}
              size="middle"
            />


          )}

          <Modal
            title="Edit User"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={editUser} // ✅ Submit on OK button
          >
            {editingUser && (
              <>
                <p>
                  <strong>Username:</strong> {editingUser.username}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  <Select
                    value={editingUser.role}
                    onChange={(value) => setEditingUser({ ...editingUser, role: value })}
                    style={{ width: "100%" }}
                  >
                    <Option value="Admin">Admin</Option>
                    <Option value="Super Admin">Super Admin</Option>
                    <Option value="User">User</Option>
                  </Select>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Select
                    value={editingUser.status ? "Active" : "Inactive"}
                    onChange={(value) =>
                      setEditingUser({ ...editingUser, status: value === "Active" })
                    }
                    style={{ width: "100%" }}
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </p>
              </>
            )}
          </Modal>

        </div>          {loading && <CircularLoader />}

      </div>
    </>
  );
};

export default Users;
