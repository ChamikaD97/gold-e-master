import React, { useEffect, useState } from "react";
import { Modal, Calendar, Alert, Card, Button, Row, Col, message } from "antd";
import dayjs from "dayjs";
import CircularLoader from "../components/CircularLoader";
import { API_KEY, getMonthDateRangeFromParts } from "../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSupplier } from "../redux/commonDataSlice";
import { hideLoader, showLoader } from "../redux/loaderSlice";

const SupplierLeafModal = ({ open, onClose, filters, selectedDate, supplierId }) => {
    const [leafData, setLeafData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [supplier, setSupplier] = useState(null);

    const [data, setData] = useState([]);

    const dispatch = useDispatch();
    const fetchSupplierDataFromId = async (supId) => {
        dispatch(showLoader());
        console.log
            ("Fetching supplier data for ID:", supId);
        const id = supId?.toString().padStart(5, "0").trim();
        dispatch(setSelectedSupplier(id)); // Dispatch the selected supplier ID to the Redux store
        if (!id || id.length !== 5) {
            message.warning("⚠️ Please enter a valid 5-digit Supplier ID");
            return;
        }
        setSupplier(null);
        setData([]);
        const url = `/quiX/ControllerV1/supdata?k=${API_KEY}&s=${id}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch supplier data");
            const result = await response.json();
            const supplierData = Array.isArray(result) ? result[0] : result;

            if (supplierData) {
                setSupplier(supplierData);
                console.log("Supplier data loaded:", supplierData);
                message.success(`✅ Supplier ID ${id} loaded successfully`);
                dispatch(hideLoader());
            } else {
                message.warning(`⚠️ No supplier data found for ID ${id}`);
                dispatch(hideLoader());
            }
        } catch (err) {
            console.error(err);
            message.error("❌ Failed to load supplier data");
            setSupplier(null);
        } finally {
            //dispatch(hideLoader());
        }
    };





    useEffect(() => {

        if (open && supplierId) {
            setLoading(true);
            getLeafRecordsBySupplierId({ filters, supplierId })
                .then((data) => {
                    setLeafData(data || []);
                    setError(null);
                })
                .catch(() => {
                    setError("Failed to fetch leaf records.");
                    setLeafData([]);
                })
                .finally(() => setLoading(false));
            fetchSupplierDataFromId(supplierId);
        }
    }, [supplierId, open]);

    const getLeafRecordsBySupplierId = async ({ filters, supplierId }) => {
        const baseUrl = "/quiX/ControllerV1/glfdata";
        const range = getMonthDateRangeFromParts(filters.year, filters.month);
        const params = new URLSearchParams({ k: API_KEY, s: supplierId, d: range });
        const url = `${baseUrl}?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        return Array.isArray(data) ? data : data ? [data] : [];
    };

    const dateCellRender = (value) => {
        const dateStr = value.format("YYYY-MM-DD");
        const records = leafData.filter((r) => r["Leaf Date"] === dateStr);
        if (!records.length) return null;

        return (
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {records.map((item, idx) => {
                    const type = item["Leaf Type"] === 2 ? "Super" : "Normal";
                    const bgColor = type === "Super" ? "#ffa347" : "#47a3ff";
                    const color = type === "Super" ? "#000" : "#000";
                    return (
                        <li
                            key={idx}
                            style={{
                                backgroundColor: bgColor,
                                color,
                                fontSize: 12,
                                marginBottom: 2,
                                padding: "2px 6px",
                                borderRadius: 6,
                                textAlign: "center",
                            }}
                        >
                            {Math.round(parseFloat(item["Net"]))} kg
                        </li>
                    );
                })}
            </ul>
        );
    };

    const monthMap = useSelector((state) => state.commonData?.monthMap);

    const superKg = leafData
        .filter((item) => item["Leaf Type"] === 2)
        .reduce((sum, item) => sum + parseFloat(item["Net"] || 0), 0);

    const normalKg = leafData
        .filter((item) => item["Leaf Type"] !== 2)
        .reduce((sum, item) => sum + parseFloat(item["Net"] || 0), 0);

    const totalKg = (superKg + normalKg).toFixed(2);

    const downloadLeafDataAsPDF = (print = false) => {
        const today = new Date().toLocaleDateString();
        const selectedLine = filters.lineCode || "All";
        const doc = new jsPDF();
        const monthName = monthMap?.[filters.month] || filters.month;

        // Calculate totals
        const superKg = leafData
            .filter((item) => item["Leaf Type"] === 2)
            .reduce((sum, item) => sum + parseFloat(item["Net"] || 0), 0);

        const normalKg = leafData
            .filter((item) => item["Leaf Type"] !== 2)
            .reduce((sum, item) => sum + parseFloat(item["Net"] || 0), 0);

        const totalKg = (superKg + normalKg).toFixed(2);

        const tableData = leafData.map((record) => [
            record["Leaf Date"],
            record["Leaf Type"] === 2 ? "Super" : "Normal",
            `${Math.round(record["Net"])} kg`,
        ]);

        // Header
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.line(14, 20, 196, 20);
        doc.setFont(undefined, 'bold');
        doc.text("GREEN HOUSE PLANTATION (PVT) LIMITED", 105, 28, { align: "center" });

        doc.setFontSize(9);
        doc.line(14, 32, 196, 32);
        doc.setFont(undefined, 'normal');
        doc.text("Factory: Panakaduwa, No: 40, Rotumba, Bandaranayakapura", 14, 40);
        doc.text("Email: gtgreenhouse9@gmail.com | Tele: +94 77 2004609", 14, 45);

        doc.setFontSize(10);
        doc.text(`Created Date: ${today}    |    Line: ${selectedLine}`, 14, 62);

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("Monthly Leaf Supply Summary", 14, 51);
        doc.setFontSize(11);
        doc.text(`Leaf Supply of ${supplierId} in ${dayjs(selectedDate).format("MMMM YYYY")}`, 14, 56);
        doc.setFont(undefined, 'normal');
        doc.line(14, 66, 196, 66);

        // Table
        autoTable(doc, {
            startY: 72,
            head: [["Date", "Type", "Net KG"]],
            body: tableData,
            styles: {
                fontSize: 9,
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [0, 0, 0],
                lineWidth: 0.2,
            },
            bodyStyles: {
                fontStyle: 'bold',
                textColor: [0, 0, 0], // ✅ ensures data rows are black
            },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            didDrawPage: function (data) {
                const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
                const totalPages = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Page ${pageNumber} of ${totalPages}`, 190, 290, { align: 'right' });
            },
        });


        // ✅ Add footer and summary ONLY on the last page
        const lastPage = doc.internal.getNumberOfPages();
        doc.setPage(lastPage);

        const summaryY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Super Total: ${Math.round(superKg)} kg`, 14, summaryY);
        doc.text(`Normal Total: ${Math.round(normalKg)} kg`, 14, summaryY + 6);
        doc.text(`Overall Total: ${Math.round(superKg + normalKg)} kg`, 14, summaryY + 12);

        // Footer only on last page
        doc.line(14, 275, 196, 275);
        doc.setFontSize(8);
        doc.setTextColor(5);
        doc.setFont(undefined, 'normal');
        doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
        doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

        const filename = `Leaf_Supplier_${supplierId}_${filters.year}_${filters.month}.pdf`;

        if (print) {
            doc.autoPrint();
            const blob = doc.output("blob");
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl);
        } else {
            doc.save(filename);
        }
    };


    return (
        <Modal
            open={open}
            onCancel={onClose}

            footer={[
                <Button
                    key="pdf"
                    type="primary"
                    onClick={() => downloadLeafDataAsPDF(false)}
                    style={{ backgroundColor: "#007bff", borderRadius: 6 }}
                >
                    Download PDF
                </Button>,
                <Button
                    key="print"
                    onClick={() => downloadLeafDataAsPDF(true)}
                    style={{ backgroundColor: "#28a745", color: "#fff", borderRadius: 6 }}
                >
                    Print PDF
                </Button>,
                <Button
                    key="close"
                    danger
                    onClick={onClose}
                    style={{ borderRadius: 6 }}
                >
                    Close
                </Button>,
            ]}
            bodyStyle={{
                backgroundColor: "#1e1e1e",
                color: "#fff",
                padding: 20,
                borderRadius: 8,
            }}
            style={{ top: 60, borderRadius: 12, overflow: "hidden" }}
            width={900}
        >
            <div
                style={{
                    marginBottom: 20,
                    padding: 12,
                    background: "#2b2b2b",
                    borderRadius: 8,
                    textAlign: "center",
                    color: "#fff",
                    fontWeight: "500",
                    fontSize: 16,
                    border: "1px solid #444",
                }}
            >
                {`Leaf Supply of ${supplier?.["Supplier Name"] || "Unknown"}  - ${supplierId}  in ${dayjs(selectedDate).format("MMMM YYYY")}`}

            </div>

            <Card bordered={false} style={{ backgroundColor: "#2a2a2a", borderRadius: 10 }}>
                {loading ? (
                    <CircularLoader />
                ) : error ? (
                    <Alert type="error" message={error} />
                ) : (
                    <>


                        <Calendar
                            fullscreen={false}
                            dateCellRender={dateCellRender}
                            value={dayjs(selectedDate)}

                        />
                        <div
                            style={{
                                marginTop: 20,
                                padding: 20,
                                background: "#2b2b2b",
                                borderRadius: 10,
                                border: "1px solid #444",
                            }}
                        >
                            <Row gutter={[16, 16]} justify="center">
                                {/* Super Total */}
                                <Col xs={24} sm={12} md={8}>
                                    <div
                                        style={{
                                            backgroundColor: "#ffa347",
                                            padding: "14px 24px",
                                            borderRadius: 10,
                                            color: "#000",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        Super Total<br />
                                        <strong style={{ fontSize: 20 }}>{Math.round(superKg)} kg</strong>
                                    </div>
                                </Col>

                                {/* Normal Total */}
                                <Col xs={24} sm={12} md={8}>
                                    <div
                                        style={{
                                            backgroundColor: "#47a3ff",
                                            padding: "14px 24px",
                                            borderRadius: 10,
                                            color: "#000",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        Normal Total<br />
                                        <strong style={{ fontSize: 20 }}>{Math.round(normalKg)} kg</strong>
                                    </div>
                                </Col>

                                {/* Overall Total */}
                                <Col xs={24} sm={24} md={8}>
                                    <div
                                        style={{
                                            backgroundColor: "#28a745",
                                            padding: "14px 24px",
                                            borderRadius: 10,
                                            color: "#fff",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                            textShadow: "0 1px 1px rgba(0,0,0,0.4)",
                                        }}
                                    >
                                        Overall Total<br />
                                        <strong style={{ fontSize: 20 }}>{Math.round(superKg + normalKg)} kg</strong>
                                    </div>
                                </Col>
                            </Row>
                        </div>


                    </>
                )}
            </Card>
        </Modal>
    );
};

export default SupplierLeafModal;
