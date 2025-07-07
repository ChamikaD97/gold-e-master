import React, { useState, useEffect } from "react";
import {
    Modal,
    Typography,
    Descriptions,
    Divider,
    Select,
    Button,
    Row,
    Col
} from "antd";
import { showLoader, hideLoader } from "../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import { API_KEY } from "../api/api";
import dayjs from "dayjs";
import CircularLoader from "./CircularLoader";
import CountUp from "react-countup";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis
} from 'recharts';
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { ArrowLeft, ArrowRight, BackHand, NextWeek } from "@mui/icons-material";


const { Title } = Typography;
const { Option } = Select;

const FactoryAnalyticsModal = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ super: 0, normal: 0 });
    const pieData = [
        { name: 'Super', value: totals.super },
        { name: 'Normal', value: totals.normal }
    ];
    const [isLine, setIsLine] = useState(true);

    const COLORS = ['#ffa347', '#47a3ff'];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const { isLoading } = useSelector((state) => state.loader);

    const [filters, setFilters] = useState({
        year: currentYear,
        month: dayjs().month() + 1
    });

    const monthMap = useSelector((state) => state.commonData?.monthMap);

    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const filteredMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        .filter(m => parseInt(filters.year) < currentYear || m <= currentMonth);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


    const [chartType, setChartType] = useState("monthly");


    const getLeafRecordsByDates = async () => {
        const { year, month } = filters;
        const start = dayjs(`${year}-${month}-01`);
        const end = start.endOf("month");
        const dd = `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`;

        const id = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160';


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
            console.error(err);
            setData([]);
            setTotals({ super: 0, normal: 0 });
        } finally {
            dispatch(hideLoader());
        }
    };

    useEffect(() => {
        if (visible) {
            getLeafRecordsByDates();
        }
    }, [visible, chartType, filters.month]);



    
    const handlePrevMonth = () => {
        setFilters(prev => {
            const newMonth = prev.month - 1;
            if (newMonth < 1) {
                return { year: prev.year - 1, month: 12 };
            }
            return { ...prev, month: newMonth };
        });
    };

    const handleNextMonth = () => {
        setFilters(prev => {
            const newMonth = prev.month + 1;
            if (newMonth > 12) {
                return { year: prev.year + 1, month: 1 };
            }
            return { ...prev, month: newMonth };
        });
    };



    useEffect(() => {
        const getYearlyData = async () => {
            const { year } = filters;
            const start = dayjs(`${year}-01-01`);
            const end = dayjs(`${year}-12-31`);
            const dd = `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`;


            const id = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160';


            const url = `/quiX/ControllerV1/glfdata?k=${API_KEY}&r=${id}&d=${dd}`;

            dispatch(showLoader());
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch yearly data");
                const result = await response.json();

                const transformed = result.map(item => ({
                    date: item["Leaf Date"],
                    month: dayjs(item["Leaf Date"]).month() + 1,
                    leaf_type: item["Leaf Type"] === 2 ? "Super" : "Normal",
                    net_kg: parseFloat(item["Net"]),
                }));

                let overallSuper = 0;
                let overallNormal = 0;

                const monthlySummary = Array.from({ length: 12 }, (_, i) => {
                    const monthIndex = i + 1;
                    const label = monthIndex.toString(); // Shows 1 to 12 as labels

                    const monthData = transformed.filter(x => x.month === monthIndex);

                    const totalSuper = monthData
                        .filter(x => x.leaf_type === "Super")
                        .reduce((sum, x) => sum + x.net_kg, 0);

                    const totalNormal = monthData
                        .filter(x => x.leaf_type === "Normal")
                        .reduce((sum, x) => sum + x.net_kg, 0);

                    overallSuper += totalSuper;
                    overallNormal += totalNormal;

                    return {
                        name: label,
                        Super: parseFloat(totalSuper.toFixed(2)),
                        Normal: parseFloat(totalNormal.toFixed(2)),
                        Total: parseFloat((totalSuper + totalNormal).toFixed(2)) // 👈 add this
                    };

                });

                setData(monthlySummary);
                setTotals({
                    super: parseFloat(overallSuper.toFixed(2)),
                    normal: parseFloat(overallNormal.toFixed(2))
                });
            } catch (err) {
                console.error(err);
                setData([]);
                setTotals({ super: 0, normal: 0 });
            } finally {
                dispatch(hideLoader());
            }
        };

        if (chartType === "yearly" && visible) {
            getYearlyData();
        }
    }, [chartType, filters.year, visible]);




    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={850}
            //bodyStyle={{ background: "#1e1e1e", color: "#fff", borderRadius: 8 }}
            destroyOnClose
        >
            <div
                style={{
                    margin: "16px 0",
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 10,
                    color: "#fff",
                    fontWeight: "bold"
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={22}>
                        Overall Factory Analytics
                    </Col>


                    <Col xs={12} sm={8} md={2}>
                        <Button
                            icon={<ReloadOutlined />}
                            type="primary"
                            block
                            danger
                            onClick={() => {
                                setIsLine(false)
                                setFilters({
                                    year: currentYear,
                                    month: dayjs().month() + 1
                                })
                            }
                            }
                        />
                    </Col>
                </Row>

            </div>

            <div
                style={{
                    margin: "16px 0",
                    textAlign: "center",
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 10,
                    color: "#fff",
                    fontWeight: "bold"
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={2}>

                        <Button icon={<ArrowLeft />} type="primary" block onClick={handlePrevMonth} />


                    </Col>
                    <Col xs={12} sm={8} md={10}>
                        <Select
                            showSearch
                            value={filters.year}
                            onChange={(val) => setFilters((prev) => ({ ...prev, year: val }))}
                            style={{
                                width: "100%",
                                backgroundColor: "rgb(0, 0, 0)",
                                color: "#000",
                                border: "1px solid #333",
                                borderRadius: 6
                            }}
                            bordered={false}
                            placeholder="Select Year"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {years.map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={12} sm={8} md={10}>
                        <Select
                            showSearch
                            value={filters.month}
                            onChange={(val) => setFilters((prev) => ({ ...prev, month: val }))}
                            style={{
                                width: "100%",
                                backgroundColor: "rgb(0, 0, 0)",
                                color: "#000",
                                border: "1px solid #333",
                                borderRadius: 6
                            }}
                            bordered={false}
                            placeholder="Select Month"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {filteredMonths.map((m) => (
                                <Option key={m} value={parseInt(m)}>
                                    {monthMap[m]}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} sm={8} md={2}>
                        <Button icon={<ArrowRight />} danger type="primary" block onClick={handleNextMonth} />

                    </Col>
                </Row>
            </div>
            {


                !isLoading && (


                    <>





                        <div
                            style={{
                                margin: "16px 0",
                                textAlign: "center",
                                borderRadius: 10,
                                backgroundColor: "#222",
                                padding: 10,
                                color: "#fff",
                                fontWeight: "bold"
                            }}
                        >
                            <Row gutter={[16, 16]} justify="center" >

                                {!isLoading &&


                                    <>

                                        <Col xs={24} sm={12} md={8}>
                                            <div
                                                style={{
                                                    backgroundColor: "#ffa347",
                                                    borderRadius: 10,
                                                    padding: "14px 24px",
                                                    textAlign: "center",
                                                    fontWeight: 600,
                                                    color: "#000",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                                                }}
                                            >
                                                Super Total<br />
                                                <CountUp style={{ fontSize: 30 }} end={Math.round(totals.super)} duration={1.2} separator="," /> kg
                                            </div>
                                        </Col>

                                        <Col xs={24} sm={12} md={8}>
                                            <div
                                                style={{
                                                    backgroundColor: "#47a3ff",
                                                    borderRadius: 10,
                                                    padding: "14px 24px",
                                                    textAlign: "center",
                                                    fontWeight: 600,
                                                    color: "#000",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                                                }}
                                            >
                                                Normal Total<br />

                                                <CountUp style={{ fontSize: 30 }} end={Math.round(totals.normal)} duration={1.2} separator="," /> kg

                                            </div>
                                        </Col>

                                        <Col xs={24} sm={24} md={8}>
                                            <div
                                                style={{
                                                    backgroundColor: "#28a745",
                                                    borderRadius: 10,
                                                    padding: "14px 24px",
                                                    textAlign: "center",
                                                    fontWeight: 600,
                                                    color: "#000",
                                                    textShadow: "0 1px 1px rgba(255, 255, 255, 0.3)",
                                                    boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)"
                                                }}
                                            >
                                                Overall Total<br />
                                                <CountUp style={{ fontSize: 30 }} end={Math.round(totals.super + totals.normal)} duration={1.2} separator="," /> kg


                                            </div>
                                        </Col>
                                    </>
                                }

                            </Row>


                        </div>

                        <div
                            style={{
                                margin: "16px 0",
                                textAlign: "center",
                                borderRadius: 10,
                                backgroundColor: "#222",
                                padding: 10,
                                color: "#fff",
                                fontWeight: "bold"
                            }}
                        >

                            <Row gutter={[16, 16]} justify="center" >
                                {!isLoading &&

                                    <div style={{ width: "100%", height: 300 }}>
                                        <ResponsiveContainer>
                                            {chartType === "monthly" ? (
                                                <PieChart>
                                                    <Pie

                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        label={({ value, percent }) => `${(percent * 100).toFixed(0)}%`} // ✅ Show % inside
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#555", color: "#fff" }}
                                                        labelStyle={{ color: "#fff" }}
                                                        itemStyle={{ color: "#fff" }}
                                                    />
                                                    <Legend wrapperStyle={{ color: "#fff" }} />
                                                </PieChart>

                                            ) : (
                                                <LineChart data={data}>
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "#1e1e1e",   // Dark background
                                                            borderColor: "#555",          // Darker border
                                                            color: "#fff"                 // Text color inside tooltip
                                                        }}
                                                        labelStyle={{ color: "#fff" }}  // Label (e.g., month name)
                                                        itemStyle={{ color: "#fff" }}   // Items (e.g., Super, Normal, Total values)
                                                    />
                                                    <Legend />

                                                    <Line type="monotone" dataKey="Super" stroke="#ffa347" />
                                                    <Line type="monotone" dataKey="Normal" stroke="#47a3ff" />
                                                    <Line type="monotone" dataKey="Total" stroke="#28a745" strokeWidth={2} dot={{ r: 3 }} />
                                                </LineChart>

                                            )}
                                        </ResponsiveContainer>


                                    </div>
                                }


                            </Row>




                        </div>
                    </>
                )

            }

            {isLoading && (
                <div
                    style={{
                        margin: "16px 0",
                        textAlign: "center",
                        borderRadius: 10,
                        backgroundColor: "#222",
                        padding: 10,
                        color: "#fff",
                        fontWeight: "bold"
                    }}

                >






                    {<CircularLoader />}



                </div>

            )}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Button
                    type={chartType === "monthly" ? "primary" : "default"}
                    onClick={() => setChartType("monthly")}
                    style={{ marginRight: 8 }}
                >
                    Monthly Summary
                </Button>
                <Button
                    type={chartType === "yearly" ? "primary" : "default"}
                    onClick={() => setChartType("yearly")}
                >
                    Yearly Summary
                </Button>
                <Button
                    type={chartType === "yearly" ? "primary" : "default"}
                    onClick={() => setIsLine(false)}
                >
                    Show All
                </Button>

            </div>


        </Modal>
    );
};

export default FactoryAnalyticsModal;
