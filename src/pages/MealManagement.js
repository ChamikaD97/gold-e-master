import React, { useState } from "react";
import {
  Button,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Table,
  Typography,
  Tag,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const INGREDIENTS = [
  { key: "rice", name: "Rice", serves: 10, price: 200 },
  { key: "dhal", name: "Dhal", serves: 25, price: 450 },
  { key: "fish", name: "Fish", serves: 8, price: 1200 },
  { key: "leaves", name: "Leaves", serves: 20, price: 300 },
];

const MealManagementUI = () => {
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [paxCount, setPaxCount] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [result, setResult] = useState([]);

  const handleMealTypeClick = (type) => {
    setSelectedMealType(type);
    setPaxCount(0);
    setSelectedMeals([]);
    setResult([]);
  };

  const handleAddMeal = (mealKey) => {
    if (!selectedMeals.includes(mealKey)) {
      setSelectedMeals((prev) => [...prev, mealKey]);
    }
  };

  const calculateRequirements = () => {
    const calculated = INGREDIENTS.filter((item) =>
      selectedMeals.includes(item.key)
    ).map((item) => {
      const needed = +(paxCount / item.serves).toFixed(2);
      return {
        key: item.key,
        name: item.name,
        needed,
        price: item.price,
        total: +(needed * item.price).toFixed(2),
      };
    });
    setResult(calculated);
  };

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  };

  return (
    <div>
      <Card bordered={false} style={{ ...cardStyle, marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col md={4}>
            <Button
              icon={<ReloadOutlined />}
              danger
              type="primary"
              block
              onClick={() => {
                setPaxCount(0);
                setSelectedMeals([]);
                setResult([]);
                setSelectedMealType(null);
              }}
            />
          </Col>

          {["Breakfast", "Lunch", "Dinner", "Special"].map((type) => (
            <Col xs={8} sm={4} md={5} key={type}>
              <Button
                type={selectedMealType === type ? "primary" : "default"}
                onClick={() => handleMealTypeClick(type)}
                style={{
                  width: "100%",
                  background: selectedMealType === type ? "#1890ff" : "#000",
                  color: "#fff",
                  borderColor: "#333",
                }}
              >
                {type}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {selectedMealType && (
        <Card bordered={false} style={cardStyle} title={`Plan ${selectedMealType} Meal`}>
          <Row gutter={16} style={{ marginBottom: 12 }}>
            <Col span={12}>
              Pax Count:
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                value={paxCount}
                onChange={setPaxCount}
              />
            </Col>
            <Col span={12}>
              Add Meal:
              <Select
                showSearch
                className="meal-select"
                placeholder="Select Meal Item"
                onSelect={handleAddMeal}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                dropdownStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  color: "#fff",
                }}
                bordered={false}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {INGREDIENTS.map((item) => (
                  <Option key={item.key} value={item.key}>
                    {item.name}
                  </Option>
                ))}
              </Select>

            </Col>
          </Row>

          <div style={{ marginBottom: 12 }}>
            Selected Meals:
            {selectedMeals.map((key) => (
              <Tag key={key}>{INGREDIENTS.find((i) => i.key === key).name}</Tag>
            ))}
          </div>

          <Button type="primary" block onClick={calculateRequirements}>
            Calculate Requirements
          </Button>

          {result.length > 0 && (
            <Table
              style={{ marginTop: 20 }}
              dataSource={result}
              pagination={false}
              columns={[
                { title: "Ingredient", dataIndex: "name" },
                { title: "Needed (kg)", dataIndex: "needed" },
                { title: "Price/kg (LKR)", dataIndex: "price" },
                { title: "Total (LKR)", dataIndex: "total" },
              ]}
              summary={(pageData) => {
                const totalCost = pageData.reduce((sum, item) => sum + item.total, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>Total</Table.Summary.Cell>
                    <Table.Summary.Cell>{totalCost.toFixed(2)} LKR</Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default MealManagementUI;
