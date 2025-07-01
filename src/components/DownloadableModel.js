import React, { useEffect, useState } from "react";
import { Modal, Calendar, Spin, Alert, Card, Button } from "antd";

import jsPDF from "jspdf";
import "jspdf-autotable";
// Simulated API call (replace with actual import)


const DownloadableModel = ({ xModalVisible, onClose, filters, selectedDate, xSupplierList }) => {
    const [leafData, setLeafData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supplierLeafData, setSupplierLeafData] = useState([]);

    const [error, setError] = useState(null);


    
  const downloadXSupplierListAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Suppliers Marked with X Today", 14, 20);

    if (xSupplierList.length === 0) {
      doc.setFontSize(12);
      doc.text("No suppliers marked today.", 14, 30);
    } else {
      const tableData = xSupplierList.map((supplierId, index) => [index + 1, supplierId]);
      doc.autoTable({
        startY: 30,
        head: [["#", "Supplier ID"]],
        body: tableData,
      });
    }

    doc.save("x-marked-suppliers.pdf");
  };


    return (
        <Modal
            title="Suppliers Marked with X Today"
            open={xModalVisible}
            onCancel={() => onClose}
            footer={[
                <Button key="download" type="primary" onClick={downloadXSupplierListAsPDF}>
                    Download as PDF
                </Button>,
                <Button key="close" onClick={onClose}>
                    Close
                </Button>
            ]}

            bodyStyle={{ backgroundColor: "#1a1a1a", color: "#fff" }}
            style={{ top: 60 }}
        >
            {xSupplierList.length > 0 ? (
                <ul>
                    {xSupplierList.map(sid => (
                        <li key={sid}><strong>{sid}</strong></li>
                    ))}
                </ul>
            ) : (
                <p>No suppliers marked today.</p>
            )}
        </Modal>
    );
};

export default DownloadableModel;
