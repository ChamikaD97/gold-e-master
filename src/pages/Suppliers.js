import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Table,
  Select, Typography, Input,
  Modal, Descriptions,
  Tag
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMapForAll from "../data/lineIdCodeMapForAll.json";
import CircularLoader from "../components/CircularLoader";
import { Pagination } from "antd"; // ✅ make sure to import this
import { useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { useNavigate } from "react-router-dom";
import { showLoader } from "../redux/loaderSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { API_KEY } from "../api/api";

import * as XLSX from 'xlsx';

const Suppliers = () => {

  const { Option } = Select;
  const { Text } = Typography;
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({


    line: "Select Line",
    search: "",
    searchById: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [singleSupplier, setSingleSupplier] = useState([]);

  const navigate = useNavigate();

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Supplier List", 10, 10);

    const headers = [["Supplier ID", "Supplier Name", "Contact"]];
    const rows = filteredData.map(s => [
      s["Supplier Id"],
      s["Supplier Name"],
      s["Contact"],

    ]);

    autoTable(doc, {
      startY: 16,
      head: headers,
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 16, left: 10, right: 10 }
    });

    const selectedLine = filters.line === "Select Line" ? "AllLines" : lineIdToCodeMap[filters.line] || filters.line;
    doc.save(`Supplier_List_${selectedLine}.pdf`);
  };



  const exportAllToExcel = () => {
    const lines = Object.keys(lineIdToCodeMap); // e.g., { "1": "L001", "2": "L002" }

    const delay = 500; // milliseconds between downloads



    const worksheetData = filteredData.map(supplier => ({
      'Supplier ID': supplier['Supplier Id'],
      'Supplier Name': supplier['Supplier Name'],
      'Contact': supplier['Contact']
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    const selectedLine = filters.line === "All" ? "AllLines" : lineIdToCodeMap[filters.line] || filters.line;

    XLSX.writeFile(workbook, `Supplier_List_${selectedLine}.xlsx`);

    lines.forEach((lineId, index) => {
      setTimeout(() => {

      }, index * delay);
    });
  };


  const [loading, setLoading] = useState(false);
  const [showSingleModel, setShowSingleModel] = useState(false);


  const fetchSupplierDataFromAPI = async (lineCode) => {
    const baseUrl = "/quiX/ControllerV1/supdata";
    const params = new URLSearchParams({ k: API_KEY, r: lineCode });
    const url = `${baseUrl}?${params.toString()}`;

    setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch supplier data");

      const data = await response.json();
      setSuppliers(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      toast.error("❌ Failed to load suppliers for the selected line.");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };


  const lineIdToCodeMap = useMemo(() => {
    const map = {};
    lineIdCodeMapForAll.forEach(item => {
      map[item.lineId] = item.lineCode;
    });
    return map;
  }, []);

  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];

  useEffect(() => {
    if (filters.line !== "Select Line") {
      fetchSupplierDataFromAPI(filters.line);
    } else {
      setSuppliers([]);
    }
  }, [filters.line]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredData = suppliers
    .filter(s => {
      const search = (filters.search || "").toLowerCase();
      return (
        s["Supplier Id"]?.toLowerCase().includes(search) ||
        s["Supplier Name"]?.toLowerCase().includes(search)
      );
    })
    .map((s, index) => ({ ...s, key: index }));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleSearchSupplier = (supplierId) => {
    dispatch(showLoader());

    const id = supplierId?.toString().padStart(5, "0").trim();
    dispatch(setSelectedSupplier(id));
    if (id) navigate(`/supplier/info`);
  };
  const columns = [
    {
      title: "Supplier ID",
      dataIndex: "Supplier Id",
      key: "supplierId",
      fixed: "left",             // ✅ make it fixed
      width: 130,                // ✅ width is required when using fixed
      sorter: (a, b) => a["Supplier Id"].localeCompare(b["Supplier Id"]),
      render: text => (
        <span
          style={{
            background: "#ff000e",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 600,
            fontSize: 13,
            display: "inline-block",
            minWidth: "60px",
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}
          onClick={() => handleSearchSupplier(text)}

          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {text}
        </span>
      )
    },

    {
      title: "Name",
      dataIndex: "Supplier Name",
      key: "supplierName",
      sorter: (a, b) => a["Supplier Name"]?.localeCompare(b["Supplier Name"]),
      filterSearch: true,
      render: (text) => <div style={{ fontWeight: "normal", color: "#fff" }}>{text}</div>,
      filters: [...new Set(suppliers.map(s => s["Supplier Name"]))]
        .map(name => ({ text: name, value: name })),
      onFilter: (value, record) => record["Supplier Name"] === value
    },
    {
      title: "Route",
      dataIndex: "Route",
      key: "route",
      sorter: (a, b) => {
        const routeA = lineIdToCodeMap[a.Route] || a.Route;
        const routeB = lineIdToCodeMap[b.Route] || b.Route;
        return routeA.localeCompare(routeB);
      },
      render: (value) => lineIdToCodeMap[value] || value,
      filters: [...new Set(suppliers.map(s => s.Route))]
        .map(r => ({ text: lineIdToCodeMap[r] || r, value: r })),
      onFilter: (value, record) => record.Route === value
    },
    {
      title: "Payemnt",
      dataIndex: "Pay",
      key: "pay",
      sorter: (a, b) => a.Pay - b.Pay,
      filters: [
        { text: "Type 1", value: 1 },
        { text: "Type 2", value: 2 },
        { text: "Type 3", value: 3 }
      ],
      onFilter: (value, record) => record.Pay === value,
      render: (text) => (
        <Tag
          style={{
            color: "#000",
            border: "none",
            fontWeight: "normal"
          }}
        >
          {parseInt(text) == 1 ? 'Cash' : 'Bank'}
        </Tag>
      )
    },

    {
      title: "NIC",
      dataIndex: "NIC",
      key: "nic",
      sorter: (a, b) => a.NIC?.localeCompare(b.NIC)
    },
    {
      title: "Contact",
      dataIndex: "Contact",
      key: "contact",
      sorter: (a, b) => a.Contact?.localeCompare(b.Contact)
    },
    {
      title: "Joined Date",
      dataIndex: "Joined Date",
      key: "joinedDate",
      sorter: (a, b) =>
        new Date(a["Joined Date"] || 0) - new Date(b["Joined Date"] || 0)
    }
  ];


  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 6
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">
        <Card bordered={false} style={cardStyle}>
          <Row justify="space-between" gutter={[16, 16]}>
            {/* Left Side: Reload + Line Filter */}
            <Col span={12}>
              <Row gutter={[8, 8]}>
                <Col md={2}>
                  <Button
                    icon={<ReloadOutlined />}
                    danger
                    type="primary"
                    block
                    onClick={() => setFilters({ line: "Select Line", search: "" })}
                  />
                </Col>
                <Col md={8}>
                  <Select
                    showSearch
                    className="line-select"
                    placeholder="Select Line"
                    value={filters.line}
                    onChange={val => setFilters(prev => ({ ...prev, line: val }))}
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "#fff",
                      border: "1px solid #333",
                      borderRadius: 6
                    }}
                    dropdownStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                    bordered={false}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {uniqueLines.map(line => (
                      <Option key={line.value} value={line.value}>
                        {line.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Col>



            {suppliers.length > 0 && (
              <Col span={12}>
                <Row gutter={[8, 8]} justify="end">



                  <Col md={8}>
                    <Input
                      className="custom-supplier-input"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}

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
                  </Col>

                  <Col>
                    <Button type="primary" onClick={exportAllToExcel}>
                      Download PDF
                    </Button>
                  </Col>
                </Row>
              </Col>
            )}
            {/* Right Side: Search */}



          </Row>

        </Card>

        <Modal
          open={showSingleModel}
          onCancel={() => setShowSingleModel(false)}
          footer={null}
          title="🧾 Supplier Profile"
          style={{ top: 80 }}
          width={600}
        >
          {singleSupplier ? (
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ fontWeight: "bold", width: 200 }}
              contentStyle={{ backgroundColor: "#fefefe" }}
            >
              <Descriptions.Item label="Supplier ID">{singleSupplier["Supplier Id"]}</Descriptions.Item>
              <Descriptions.Item label="Name">{singleSupplier["Supplier Name"]}</Descriptions.Item>
              <Descriptions.Item label="Route">
                <Tag color="blue">{lineIdToCodeMap[singleSupplier["Route"]] || singleSupplier["Route"]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Pay Category">
                <Tag color={
                  singleSupplier["Pay"] === 1 ? "green" :
                    singleSupplier["Pay"] === 2 ? "gold" : "volcano"
                }>
                  Type {singleSupplier["Pay"]}
                </Tag>

                <Descriptions.Item label="Bank">{singleSupplier["Pay"]}</Descriptions.Item></Descriptions.Item>
              <Descriptions.Item label="Bank">{singleSupplier["Bank"]}</Descriptions.Item>
              <Descriptions.Item label="Bank A/C">{singleSupplier["Bank AC"]}</Descriptions.Item>
              <Descriptions.Item label="NIC">{singleSupplier["NIC"]}</Descriptions.Item>
              <Descriptions.Item label="Contact">{singleSupplier["Contact"]}</Descriptions.Item>
              <Descriptions.Item label="Joined Date">{singleSupplier["Joined Date"]}</Descriptions.Item>
            </Descriptions>
          ) : (
            <p>No supplier found.</p>
          )}
        </Modal>


        {loading && <CircularLoader />}

        {!loading && filteredData.length > 0 && (
          <Card
            size="small"
            bordered={false}
            style={{
              marginTop: 12,
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: 16
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ maxHeight: "460px", overflowY: "auto" }}>
              <Table
                className="sup-bordered-table"
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                scroll={{ y: 400 }} // ✅ this makes the header sticky
                bordered
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                showSizeChanger
                pageSizeOptions={["5", "10", "15", "20", "50", "100"]}
                showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} suppliers`}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>

          </Card>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
