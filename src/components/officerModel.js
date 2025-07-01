import React, { useState, useEffect } from "react";
import {
  Modal,
  Typography,
  Button,
  Table,
  Tag,
  Divider,
  Space,
  Card,
  Col,
  Row,
  Select,
} from "antd";
import { TeamOutlined, RollbackOutlined } from "@ant-design/icons";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

const OfficerModal = ({
  selectedOfficer,
  xSuppliers,
  isVisible,
  data,
  onClose,
  notificationDate,
}) => {
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const dailyLeafCount = useSelector((state) => state.dailyLeafCount.dailyLeafCount);
  const [dailyCountSummeryBySupplierId, setDailyCountSummeryBySupplierId] = useState({});
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const navigate = useNavigate();

  const handleClose = () => {
    setSelectedLine(null);
    setSelectedSupplier(null);
    onClose();
  };

  const groupedByLine =
    selectedOfficer && xSuppliers[selectedOfficer]
      ? xSuppliers[selectedOfficer].reduce((acc, supplier) => {
          const line = supplier.line;
          if (!acc[line]) acc[line] = [];
          acc[line].push(supplier);
          return acc;
        }, {})
      : {};

  const totalSuppliers = Object.values(groupedByLine).reduce(
    (acc, suppliers) => acc + suppliers.length,
    0
  );

  useEffect(() => {
    if (!selectedSupplier?.supplierId) return;

    const fromDate =
      selectedMonth === "All"
        ? `${selectedYear}-01-01`
        : `${selectedYear}-${selectedMonth}-01`;
    const toDate =
      selectedMonth === "All"
        ? `${selectedYear}-12-31`
        : new Date(selectedYear, parseInt(selectedMonth), 0).toISOString().slice(0, 10);

    const summary =[]

    setDailyCountSummeryBySupplierId(summary);
  }, [selectedSupplier, selectedYear, selectedMonth, dailyLeafCount]);

  return (
    <Modal
      title={
        <Space direction="vertical" style={{ width: "100%" }}>
          {!selectedSupplier && (
            <Text strong style={{ color: "#000", fontSize: 20 }}>
              Suppliers that need to supply leaf{" "}
              {notificationDate === 0
                ? "on Today"
                : notificationDate === 1
                ? "on Tomorrow"
                : `in ${notificationDate} Days`}
            </Text>
          )}
        </Space>
      }
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      centered
      width={800}
      bodyStyle={{ padding: 24, backgroundColor: "#fafafa" }}
    >
      {!selectedSupplier && selectedOfficer && Object.keys(groupedByLine).length > 0 ? (
        <>
          {!selectedLine ? (
            <>
              <Card
                style={{
                  marginBottom: 16,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ backgroundColor: "#e6f7ff", borderRadius: 8, textAlign: "center" }}>
                      <Title level={5} style={{ margin: 0, color: "#1890ff" }}>Total Lines</Title>
                      <Text style={{ fontSize: 24, fontWeight: 600, color: "#1890ff" }}>
                        {Object.keys(groupedByLine).length}
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ backgroundColor: "#f6ffed", borderRadius: 8, textAlign: "center" }}>
                      <Title level={5} style={{ margin: 0, color: "#52c41a" }}>Total Suppliers</Title>
                      <Text style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
                        {totalSuppliers}
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Table
                scroll={{ y: 300 }}
                dataSource={Object.entries(groupedByLine)
                  .map(([line, supplierList]) => ({
                    key: line,
                    line,
                    count: supplierList.length,
                  }))
                  .sort((a, b) => b.count - a.count)}
                columns={[
                  {
                    title: "Line",
                    dataIndex: "line",
                    key: "line",
                    sorter: (a, b) => a.line.localeCompare(b.line),
                    render: (line) => <Text strong>{line}</Text>,
                  },
                  {
                    title: "Total Suppliers",
                    dataIndex: "count",
                    key: "count",
                    sorter: (a, b) => a.count - b.count,
                    defaultSortOrder: "descend",
                    render: (count) => (
                      <Tag icon={<TeamOutlined />} color={count > 10 ? "red" : count > 5 ? "gold" : "green"}>
                        {count} supplier{count > 1 ? "s" : ""}
                      </Tag>
                    ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, record) => (
                      <Button type="primary" onClick={() => setSelectedLine(record.line)}>
                        View
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
                bordered
              />
            </>
          ) : (
            <>
              <Button type="primary" style={{ marginBottom: 6 }} onClick={() => setSelectedLine(null)}>
                Back to Lines
              </Button>

              <Card style={{ marginBottom: 6, borderRadius: 10, backgroundColor: "#fff", border: "1px solid #f0f0f0" }}>
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ backgroundColor: "#f9f0ff", borderRadius: 8, textAlign: "center" }}>
                      <Title level={5} style={{ margin: 0, color: "#722ed1" }}>Selected Line</Title>
                      <Text style={{ fontSize: 24, fontWeight: 600, color: "#722ed1" }}>{selectedLine}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} style={{ backgroundColor: "#f6ffed", borderRadius: 8, textAlign: "center" }}>
                      <Title level={5} style={{ margin: 0, color: "#52c41a" }}>Suppliers</Title>
                      <Text style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
                        {groupedByLine[selectedLine].length}
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Table
                dataSource={groupedByLine[selectedLine].map((s, index) => ({
                  key: index,
                  supplierId: s.supplierId,
                  contactNumber: s.contactNumber || "N/A",
                  ...s,
                }))}
                columns={[
                  {
                    title: "Supplier ID",
                    dataIndex: "supplierId",
                    key: "supplierId",
                  },
                  {
                    title: "Contact Number",
                    dataIndex: "contactNumber",
                    key: "contactNumber",
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, record) => (
                      <Button type="primary" onClick={() =>navigate(`/supplier/${record.supplierId}`)}>
                        View
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
                bordered
                scroll={{ y: 300 }}
              />
            </>
          )}
        </>
      ) : (
        dailyCountSummeryBySupplierId &&
        selectedOfficer &&
        Object.keys(groupedByLine).length > 0 && (
          <>
            <Card
              title={
                <span>
                  🧾 <strong>Supplier Summary</strong> – ID:{" "}
                  <Tag color="blue">{dailyCountSummeryBySupplierId.filteredData?.[0]?.supplier_id || "N/A"}</Tag>
                </span>
              }
              style={{
                marginTop: 16,
                borderRadius: 10,
                backgroundColor: "#fffbe6",
                border: "1px solid #ffe58f",
              }}
            >
              <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col>
                  <Text strong>Year:</Text>{" "}
                  <Select value={selectedYear} onChange={(val) => setSelectedYear(val)} style={{ width: 100 }}>
                    <Option value="2025">2025</Option>
                    <Option value="2024">2024</Option>
                  </Select>
                </Col>
                <Col>
                  <Text strong>Month:</Text>{" "}
                  <Select value={selectedMonth} onChange={(val) => setSelectedMonth(val)} style={{ width: 120 }}>
                    <Option value="All">All</Option>
                    <Option value="01">January</Option>
                    <Option value="02">February</Option>
                    <Option value="03">March</Option>
                    <Option value="04">April</Option>
                    <Option value="05">May</Option>
                    <Option value="06">June</Option>
                    <Option value="07">July</Option>
                    <Option value="08">August</Option>
                    <Option value="09">September</Option>
                    <Option value="10">October</Option>
                    <Option value="11">November</Option>
                    <Option value="12">December</Option>
                  </Select>
                </Col>
              </Row>

              {dailyCountSummeryBySupplierId.filteredData?.length > 0 && (
                <Table
                  dataSource={dailyCountSummeryBySupplierId.filteredData.map((entry, index) => ({
                    key: index,
                    date: entry.date,
                    leaf_type: entry.leaf_type,
                    full_kg: entry.full_kg,
                    gross: entry.gross,
                    net_kg: entry.net_kg,
                    bag_kg: entry.bag_kg,
                  }))}
                  columns={[
                    { title: "Date", dataIndex: "date", key: "date" },
                    {
                      title: "Leaf Type",
                      dataIndex: "leaf_type",
                      key: "leaf_type",
                      render: (type) => (
                        <Tag color={type === "Super" ? "purple" : "green"}>{type}</Tag>
                      ),
                    },
                    { title: "Full (kg)", dataIndex: "full_kg", key: "full_kg" },
                    { title: "Gross", dataIndex: "gross", key: "gross" },
                    { title: "Net (kg)", dataIndex: "net_kg", key: "net_kg" },
                    { title: "Bag (kg)", dataIndex: "bag_kg", key: "bag_kg" },
                  ]}
                  bordered
                  pagination={false}
                  scroll={{ y: 300 }}
                  summary={(pageData) => {
                    const totalNet = pageData.reduce(
                      (sum, row) => sum + (parseFloat(row.net_kg) || 0),
                      0
                    );
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={4}>
                          <Text strong>Total Net Weight</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell>
                          <Tag color="gold" style={{ fontSize: 16 }}>
                            {totalNet.toFixed(2)} kg
                          </Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell />
                      </Table.Summary.Row>
                    );
                  }}
                />
              )}

              <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
                <Text>
                  <strong>Line:</strong>{" "}
                  <Tag color="geekblue">
                    {dailyCountSummeryBySupplierId.filteredData?.[0]?.line || "N/A"}
                  </Tag>
                </Text>

                <Divider style={{ margin: "8px 0" }} />

                <Text>
                  <strong>🟢 Normal Leaf Total (net_kg):</strong>{" "}
                  <Tag color="green">
                    {dailyCountSummeryBySupplierId.normalLeafTotalNetKg}
                  </Tag>
                </Text>
                <Text>
                  <strong>🟣 Super Leaf Total (net_kg):</strong>{" "}
                  <Tag color="purple">
                    {dailyCountSummeryBySupplierId.superLeafTotalNetKg}
                  </Tag>
                </Text>
              </Space>
            </Card>
          </>
        )
      )}
    </Modal>
  );
};

export default OfficerModal;
