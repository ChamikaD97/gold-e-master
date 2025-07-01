import { Modal, Row, Col, Avatar, Button,Card, Typography, Space,Tag } from "antd";
import CustomButton from "./CustomButton";
import f1 from "../images/1.jpeg"; // Adjust the path accordingly
import f2 from "../images/2.jpeg"; // Adjust the path accordingly
import f3 from "../images/3.jpeg"; // Adjust the path accordingly
import f4 from "../images/4.jpeg"; // Adjust the path accordingly
import f5 from "../images/5.jpeg"; // Adjust the path accordingly
        {/* Column 2: Personal Details */}

const OfficerProfileModal = ({
  visible,
  onClose,
  officer,
  onContinue,
  officers,
  filteredData,
  monthlyTargetsFroSelectedOfficer,
}) => {
  const { Title, Text } = Typography;

  const imageMap = {
    1: f1,
    2: f2,
    3: f3,
    4: f4,
    5: f5,
    // add as needed
  };

  return (
    <Modal
      title="Field Officer Profile"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      centered
    >
      {/* 3-column layout */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Column 1: Avatar/Image Centered */}
        <Col span={6}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {officer?.id ? (
             <img
             src={imageMap[officer.id]}
             alt="Officer"
             style={{
              width: 200,
              height: 200,
              borderRadius: "50%", // perfect circle
              objectFit: "cover",
              border: "2px solid #ccc",
            }}/>
            ) : (
              <Avatar
                size={150}
                style={{
                  backgroundColor: "#7265e6",
                  verticalAlign: "middle",
                  fontSize: 48,
                }}
              >
                {officer?.name?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </div>
        </Col>

        <Col span={7}>
  <Card
    bordered
    style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: "#fafafa",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    }}
  >
    <Space direction="vertical" size="middle">
      <Title level={4} style={{ margin: 0 }}>
        {officer?.name}
      </Title>

      <Text>
        <strong>Contact:</strong> {officer?.phone}
      </Text>

    
      <div>
        <strong>Position: </strong>
        <Tag color="purple">{officer?.position}</Tag>
      </div>

      <div>
        <strong>Experience: </strong>
        <Tag color="green">{officer?.email} years</Tag>
      </div>
    </Space>
  </Card>
</Col>
        {/* Column 3: Monthly Targets */}
        <Col span={11}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {monthlyTargetsFroSelectedOfficer?.map((month) => (
              <CustomButton
                key={month.id}
                text={`${month.name} - ${month.target.toLocaleString()}`}
                type="rgb(0, 0, 0)"
                style={{
                  textAlign: "center",
                  padding: "4px 8px",
                }}
              />
            ))}
          </div>
        </Col>
      </Row>

      {/* Section: Action Buttons */}
      <Row justify="center" gutter={[16, 16]}>
        <Col>
          <Button type="primary" onClick={onContinue}>
            Continue to Performance View
          </Button>
        </Col>
        <Col>
          <Button type="default" onClick={() => onContinue("lastYear")}>
            Last Year Progress
          </Button>
        </Col>
        <Col>
          <Button type="default" onClick={() => onContinue("monthly")}>
            This Year Monthly Progress
          </Button>
        </Col>
        <Col>
          <Button type="default" onClick={() => onContinue("performance")}>
            Show This Year Performance
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};

export default OfficerProfileModal;
