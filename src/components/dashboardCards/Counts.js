import React, { useState, useEffect } from "react";
import { Typography, Space, Card } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Counts = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });


  const getLeafRecordsByDates = async () => {
        const { year, month } = filters;
        const start = dayjs(`${year}-${month}-01`);
        const end = start.endOf("month");
        const dd = `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`;

        const id = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162';


        const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${id}&d=${dd}`;

        setData([]);
        dispatch(showLoader());

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch leaf records");

            const result = await response.json();

            const transformed = result.map(item => ({
                supplier_id: item["Supplier Id"],
                date: item["Leaf Date"],
                leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
                lineCode: parseInt(item["Route"]),
                net_kg: parseFloat(item["Net"]),
            }));

            const calculatedTotals = transformed.reduce(
                (acc, item) => {
                    if (item.leaf_type === "Super") acc.super += item.net_kg;
                    else acc.normal += item.net_kg;
                    return acc;
                },
                { super: 0, normal: 0 }
            );

            setTotals(calculatedTotals);
            setData(transformed);
        } catch (err) {
            toast.error("Error While Loading Data,Please Try Again");
            setData([]);
            setTotals({ super: 0, normal: 0 });
        } finally {
            dispatch(hideLoader());
        }
    };

  
  return (
    <Card
      bordered={false}
      style={{ 
        width: "fit-content",
        padding: "8px 16px",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        backgroundColor: "transparent"
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ fontWeight: "bold", color: "#fff", fontSize: 30 }}>
        {formattedTime}            </div>
      <div style={{ fontWeight: "normal", color: "#fff", fontSize: 18 }}>
        {formattedDate}         </div>



    </Card>
  );
};

export default Counts;
