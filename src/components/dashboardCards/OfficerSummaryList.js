import React from "react";
import { Row, Col, Typography, Card } from "antd";

const { Title, Text } = Typography;

const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    height: "100%",
};

const OfficerSummaryList = ({ data, title = "Officer Summary" }) => {
    if (!data?.length) return null;

    return (
        <>
            <Title level={4} style={{ color: "#fff", margin: "10px 0" }}>{title}</Title>
            <Row gutter={[16, 16]}>
                {data.map((officer, index) => (
                    <Col span={8} key={index}>
                        <Card bordered={false} style={cardStyle}>
                            <Row align="middle" gutter={16}>
                                <Col flex="60px">
                                    <img
                                        src={officer.image}
                                        alt={officer.name}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "1px solid white",
                                        }}
                                    />
                                </Col>
                                <Col flex="auto">
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>{officer.name}</Text>
                                    <br />
                                    <Text style={{ color: "#ccc" }}>{officer.total} Kg</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default OfficerSummaryList;
