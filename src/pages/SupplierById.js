import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Col,
  Row,
  Select,
  notification,
  Typography,
} from "antd";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSupplierSummaryByDateRange } from "../pages/utils/dashboardMetrics";
import supplier_list from "./data/supplier_list.json";

const { Option } = Select;
const { Text } = Typography;

const SupplierById = () => {
  const { id } = useParams();
  const dailyLeafCount = useSelector((state) => state.dailyLeafCount.dailyLeafCount);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title) => {
    api[type]({ message: title });
  };

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.65)",
    color: "#eee",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    marginBottom: 16,
  };

  const selectStyle = {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: 6,
    cursor: "pointer"
  };

  const [filters, setFilters] = useState({
    fromYear: "2025",
    toYear: "2025",
    fromMonth: "01",
    toMonth: "12",
  });

  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
    isValid: true,
  });

  const [dailyCountSummeryBySupplierId, setDailyCountSummeryBySupplierId] = useState({});
  const [selectedSuplier, setSelectedSuplier] = useState({});

  const monthMap = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
  };

  const allMonthKeys = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  useEffect(() => {
    const supplier = supplier_list.find((s) => s.supplierId === id);
    if (supplier) {
      setSelectedSuplier(supplier);
    } else {
      openNotificationWithIcon("error", "Supplier not found");
    }
  }, [id]);

  useEffect(() => {
    const fromDate = `${filters.fromYear}-${filters.fromMonth}-01`;
    const toDate = new Date(
      parseInt(filters.toYear),
      parseInt(filters.toMonth),
      0
    ).toISOString().slice(0, 10);

    const isValid = new Date(fromDate) <= new Date(toDate);
    setDateRange({ fromDate, toDate, isValid });

    if (!isValid) {
      openNotificationWithIcon("error", "From date must be before To date");
      setDailyCountSummeryBySupplierId({});
      return;
    }

    const summary = getSupplierSummaryByDateRange(
      dailyLeafCount,
      id,
      fromDate,
      toDate
    );

    setDailyCountSummeryBySupplierId(summary);
  }, [filters, id, dailyLeafCount]);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Leaf Type", dataIndex: "leaf_type", key: "leaf_type" },
    { title: "Full KG", dataIndex: "full_kg", key: "full_kg" },
    { title: "Gross", dataIndex: "gross", key: "gross" },
    { title: "Net KG", dataIndex: "net_kg", key: "net_kg" },
    { title: "Bag KG", dataIndex: "bag_kg", key: "bag_kg" },
    { title: "Line", dataIndex: "line", key: "line" },
  ];

  const supplierInfo = selectedSuplier
    ? [{
      supplier_id: selectedSuplier.supplierId,
      supplier_name: selectedSuplier.name,
      line: selectedSuplier.line,
      contact_number: selectedSuplier.contact,
    }]
    : [];

  return (
    <div>
      {contextHolder}

      {/* Year & Month Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 5 }}>
        <Col xs={24} md={12}>
<Col xs={24} md={12}>


</Col>


          <Card bordered={false} style={cardStyle}>
            <Row gutter={[16, 16]} align="middle" justify="center">
              <Col xs={24} md={4}>
                <Text style={{ color: "#eee", fontSize: 18 }}>From</Text>
              </Col>
              <Col xs={24} md={9}>
                <Select
                  value={filters.fromYear}
                  onChange={(val) => setFilters(prev => ({ ...prev, fromYear: val }))}
                 style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#fff"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="2024">2024</Option>
                  <Option value="2025">2025</Option>
                </Select>
              </Col>
              <Col xs={24} md={9}>
                <Select
                  value={filters.fromMonth}
                  onChange={(val) => setFilters(prev => ({ ...prev, fromMonth: val }))}
                   style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#fff"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allMonthKeys.map((m) => (
                    <Option key={`from-${m}`} value={m}>
                      {monthMap[m]}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>






          <Col xs={24} md={12}>


</Col>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false} style={cardStyle}>
            <Row gutter={[16, 16]} align="middle" justify="center">
              <Col xs={24} md={4}>
                <Text style={{ color: "#eee", fontSize: 18 }}>To</Text>
              </Col>
              <Col xs={24} md={9}>
                <Select
                  value={filters.toYear}
                  onChange={(val) => setFilters(prev => ({ ...prev, toYear: val }))}
                style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#fff"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="2024">2024</Option>
                  <Option value="2025">2025</Option>
                </Select>
              </Col>
              <Col xs={24} md={9}>
                <Select
                  value={filters.toMonth}
                  onChange={(val) => setFilters(prev => ({ ...prev, toMonth: val }))}
                   style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  dropdownStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "#fff"
                  }}
                  bordered={false}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allMonthKeys.map((m) => (
                    <Option key={`to-${m}`} value={m}>
                      {monthMap[m]}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Date Range Summary */}
      <Card bordered={false} style={cardStyle}>
        <Text style={{ color: dateRange.isValid ? "#00ffcc" : "#ff4d4f", fontSize: 16 }}>
          {dailyLeafCount.length} records — Date Range: <b>{dateRange.fromDate}</b> to <b>{dateRange.toDate}</b>
        </Text>
      </Card>

      {/* Leaf Totals Summary */}
      {dailyCountSummeryBySupplierId.filteredData?.length > 0 && (
        <Card bordered={false} style={{ ...cardStyle, background: "#1b2a3a" }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>
            🟢 Normal Leaf Total (Net Kg): <b>{dailyCountSummeryBySupplierId.normalLeafTotalNetKg}</b><br />
            🔵 Super Leaf Total (Net Kg): <b>{dailyCountSummeryBySupplierId.superLeafTotalNetKg}</b>
          </Text>
        </Card>
      )}

      {/* Leaf Collection Table */}
      <Card style={{ ...cardStyle, background: "#fff" }}>
        <Table
          columns={columns}
          dataSource={dailyCountSummeryBySupplierId.filteredData || []}
          pagination={false}
          rowKey="date"
          bordered
        />
      </Card>

      {/* Supplier Info Table */}
      <Card style={{ ...cardStyle, background: "#fff" }}>
        <Table
          columns={[
            { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
            { title: "Name", dataIndex: "supplier_name", key: "supplier_name" },
            { title: "Line", dataIndex: "line", key: "line" },
            { title: "Contact", dataIndex: "contact_number", key: "contact_number" },
          ]}
          dataSource={supplierInfo}
          pagination={false}
          rowKey="supplier_id"
          bordered
        />
      </Card>
    </div>
  );
};

export default SupplierById;
