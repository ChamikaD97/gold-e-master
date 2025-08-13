import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Col, Row, Button, Table,
  Select, Typography, Input,
  Modal, Descriptions,
  Tag
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import lineIdCodeMapForAll from "../data/SummeryData.json";
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
import { SearchOutlined, SearchRounded } from "@mui/icons-material";
import CountUp from "react-countup";

const Suppliers = () => {

  const { Option } = Select;
  const { Text } = Typography;
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({
    line: "Select Line",
    search: "",
    searchById: "",
    searchByObject: "", // 🔍 NEW
  });


  const [suppliers, setSuppliers] = useState([]);
  const [singleSupplier, setSingleSupplier] = useState([]);

  const navigate = useNavigate();




  const [loading, setLoading] = useState(false);
  const [showSingleModel, setShowSingleModel] = useState(false);


  const fetchSupplierDataFromAPI = async (lineCode) => {
    const baseUrl = "/quiX/ControllerV1/supdata";
    const ids = Array.from({ length: 170 }, (_, i) => i + 1).join(",");

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
  const handleDelete = () => {
    if (filteredData.length === 0) {
      toast.warn("No supplier data to export");
      return;
    }

    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const selectedLine = filters.line || "All";
    const currentMonthName = today.toLocaleString("default", { month: "long" });

    // --- Header ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.line(14, 20, 196, 20);
    doc.setFont(undefined, 'bold');
    doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 28, { align: "center" });

    doc.setFontSize(9);
    doc.line(14, 32, 196, 32);
    doc.setFont(undefined, 'normal');
    doc.text("Factory: Panakaduwa, Rotumba.", 14, 40);
    doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 45);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Supplier List", 14, 52);
    doc.text(`Line: ${lineIdToCodeMap[selectedLine] || "All"}`, 14, 58);
    doc.setFont(undefined, 'normal');
    doc.line(14, 63, 196, 63);
    doc.text(`Date: ${formattedDate}`, 14, 69);
    doc.line(14, 72, 196, 72);

    // --- Table Data ---
    const tableBody = filteredData.map((s, index) => [
      index + 1,
      s["Supplier Id"],
      s["Supplier Name"],
      lineIdToCodeMap(s.Route),  // ✅ call the function here
      s["Pay"] === 1 ? "Cash" : "Bank",
      s["NIC"],
      s["Contact"],
      s["Joined Date"]
    ]);


    doc.autoTable({
      startY: 78,
      head: [["#", "ID", "Name", "Route", "Payment", "NIC", "Contact", "Joined"]],
      body: tableBody,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1
    });

    // --- Footer on Last Page ---
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    const y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(8);
    doc.setTextColor(50);
    doc.line(14, 275, 196, 275);
    doc.setFont(undefined, 'normal');
    doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
    doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);
    doc.text(`Page ${pageCount}`, 190, 290, { align: 'right' });

    doc.save(`Supplier_List_${selectedLine}_${formattedDate}.pdf`);
  };




  const uniqueLines = [
    { label: "All", value: "All" },
    ...lineIdCodeMapForAll
      .filter(l => l.lineCode && l.lineId)
      .map(l => ({ label: l.lineCode, value: l.lineId }))
  ];

  const lineIdToCodeMap = (id) => {
    const record = lineIdCodeMapForAll.find(item => parseInt(item.lineId) === id);
    return record?.lineCode || "Unknown";
  };


  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);



  const filteredData = suppliers
    .filter((s) => {
      const search = filters.search?.toLowerCase() || "";
      const objectSearch = filters.searchByObject?.toLowerCase() || "";

      const matchesBasicSearch =
        s["Supplier Id"]?.toLowerCase().includes(search) ||
        s["Supplier Name"]?.toLowerCase().includes(search);

      const matchesObjectSearch = objectSearch
        ? Object.values(s).some((val) =>
          val?.toString().toLowerCase().includes(objectSearch)
        )
        : true;

      return matchesBasicSearch && matchesObjectSearch;
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
            background: "#8b5400ff",

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
        const routeA = lineIdToCodeMap(a.Route);
        const routeB = lineIdToCodeMap(b.Route);
        return routeA.localeCompare(routeB);
      },
      render: (value) => lineIdToCodeMap(value),
      filters: [...new Set(suppliers.map(s => s.Route))]
        .map(r => ({ text: lineIdToCodeMap(r), value: r })),
      onFilter: (value, record) => record.Route === value
    }
    ,
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
      render: text => (
        <span
          style={{
            background: "#008b68ff",

            color: "#fff",
            padding: "6px 12px",
            borderRadius: "24px",
            fontWeight: 400,
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
          {parseInt(text) == 1 ? 'Cash' : 'Bank'}
        </span>
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} className="fade-in">

      <Row gutter={[8, 8]} justify="center">
        <Col md={18}>
          <Card bordered={false} style={cardStyle}>
            <Row gutter={[8, 8]} align="middle">
              <Col md={1}>
                <Button
                  icon={<ReloadOutlined />}
                  danger
                  type="primary"
                  block
                  onClick={() => {

                    setSuppliers([])
                    setFilters({ line: "Select Line", search: "", searchById: "" })
                  }}
                />
              </Col>
              <Col span={4}>
                <Text style={{ color: "#fff" }}>Search By Line</Text>
              </Col>
              <Col span={4}>
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
              <Col span={4}>
                <Button
                  icon={<SearchRounded />}
                  type="primary"
                  onClick={() => fetchSupplierDataFromAPI(filters.line)}
                />
              </Col>


              <Col span={5}>
                <Input
                  value={filters.searchByObject}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchByObject: e.target.value,
                    }))
                  }
                  placeholder="Enter object-related keyword"
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: 6,
                  }}
                  allowClear
                />
              </Col>

              <Col span={4}>
                <Button
                  type="primary"
                  onClick={() => handleDelete()}
                  style={{ width: "100%", borderColor: "#3e8e41" }}
                >
                  Download
                </Button>
              </Col>


            </Row>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            bordered={false}
            style={{ ...cardStyle, textAlign: "center" }}
          >
            <span style={{ fontSize: 20, fontWeight: '600', color: '#fff' }}>
              <CountUp end={filteredData.length} duration={0.5} separator="," /> Suppliers
            </span>
          </Card>
        </Col>

      </Row>

      <div style={{ flex: "0 0 auto", marginBottom: 16 }} className="fade-in">


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
            <div style={{ maxHeight: "460px", overflowY: "auto" }} className="fade-in">
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
                showTo32tal={(total, range) => `${range[0]}–${range[1]} of ${total} suppliers`}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>

          </Card>
        )}
      </div>
      {loading && <CircularLoader />}
    </div>
  );
};

export default Suppliers;
