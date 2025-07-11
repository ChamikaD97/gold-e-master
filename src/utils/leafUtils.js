
import { API_KEY, getMonthDateRangeFromParts } from "../api/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const getOfficerByLineId = (lineId, lineIdCodeMap) => {
  const match = lineIdCodeMap.find((line) => line.lineId === lineId);
  return match ? match.officer : null;
};

export const fetchSupplierDataFromAPI = async (supplierId) => {
  const url = `/quiX/ControllerV1/supdata?k=${API_KEY}&s=${supplierId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch supplier data");
    const data = await response.json();
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to fetch supplier details from API");
    return [];
  }
};

export const getLastMonthInactiveSuppliers = (remainingSuppliers, line, leafSupplies) => {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const lastMonthSupplierIds = new Set(
    leafSupplies
      .filter(supply => {
        const supplyDate = new Date(supply.date);
        return (
          supplyDate >= prevMonth &&
          supplyDate < nextMonth &&
          (line === "All" || supply.line === line)
        );
      })
      .map(supply => supply.supplierId)
  );

  return remainingSuppliers.filter(supplier =>
    lastMonthSupplierIds.has(supplier["Supplier Id"])
  );
};

export const getTotalKG = (xSupplierDetails) => {
  return xSupplierDetails.reduce((sum, item) => sum + (parseFloat(item["X KG"]) || 0), 0);
};

export const downloadXSupplierListAsPDF = (filters, xSupplierDetails, remainingSuppliers, p) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString();
  const selectedLine = filters.lineCode || "All";

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

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("Daily Leaf Supply Summary", 14, 52);
  doc.text(`${selectedLine} Line Suppliers that need to Supply Leaf`, 14, 58);
  doc.setFont(undefined, 'normal');
  doc.text(`Date: ${today}    |    Line: ${selectedLine}`, 14, 63);
  doc.setDrawColor(0);
  doc.line(14, 66, 196, 66);

  if (xSupplierDetails.length > 0) {
    const totalXKg = xSupplierDetails.reduce((sum, s) => sum + parseFloat(s["X KG"] || 0), 0);

    const tableData2 = xSupplierDetails.map((s) => [
      s["Supplier Id"],
      s["Supplier Name"],
      s["Contact"] || "-",
      s["X KG"] || "0",
      "",
      ""
    ]);

    const tableData = tableData2.map((row, index) => [index + 1, ...row]);

    const finalRow = [
      { content: "Total", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
      { content: totalXKg.toFixed(2), styles: { fontStyle: "bold" } },
      { content: "", styles: {} }
    ];

    tableData.push(finalRow);

    doc.autoTable({
      startY: 72,
      head: [["#", "Supplier ID", "Name", "Mobile", "Last Supply", "Informed", "Availability"]],
      body: tableData,
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
      tableLineWidth: 0.1,
    });
  }

  if (remainingSuppliers.length > 0) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Remaining Inactive Suppliers", 14, 30);

    const inactiveTableData1 = remainingSuppliers.map(s => [
      s["Supplier Id"],
      s["Supplier Name"] || "-",
      s["Contact"] || "-",
      " "
    ]);

    const inactiveTableData = inactiveTableData1.map((row, index) => [index + 1, ...row]);

    doc.autoTable({
      startY: 36,
      head: [["#", "Supplier ID", "Name", "Mobile"]],
      body: inactiveTableData,
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
      tableLineWidth: 0.1,
    });
  }

  const lastPage = doc.internal.getNumberOfPages();
  doc.setPage(lastPage);
  doc.line(14, 275, 196, 275);
  doc.setFontSize(8);
  doc.setTextColor(5);
  doc.setFont(undefined, 'normal');
  doc.text("Green House Plantation SLMS | DA Engineer | ACD Jayasinghe", 14, 280);
  doc.text("0718553224 | deshjayasingha@gmail.com", 14, 285);

  if (p) {
    doc.autoPrint();
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl);
  } else {
    const formattedDate = new Date().toISOString().split('T')[0];
    doc.save(`${selectedLine} line suppliers - ${formattedDate}.pdf`);
  }
};
