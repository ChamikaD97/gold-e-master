import React from "react";
import { Modal, Table, Typography } from "antd";

const { Title } = Typography;

const PerformanceModal = ({ visible, onClose }) => {
  const rawOfficerData = [
    {
      key: "Target Achievements",
      label: "Target Achievements",
      ajith: 84,
      isuru: 88,
      udara1: 77,
      gamini: 66,
      udara2: 71,
    },
    {
      key: "Super Leaf Achievements",
      label: "Super Leaf Achievements",
      ajith: 44,
      isuru: 53,
      udara1: 50,
      gamini: 54,
      udara2: 28,
    },
    {
      key: "3",
      label: "B",
      ajith: 41,
      isuru: 44,
      udara1: 44,
      gamini: 47,
      udara2: 34,
    },
    {
      key: "4",
      label: "BB",
      ajith: 29,
      isuru: 27,
      udara1: 29,
      gamini: 29,
      udara2: 30,
    },
    {
      key: "5",
      label: "P",
      ajith: 30,
      isuru: 28,
      udara1: 27,
      gamini: 29,
      udara2: 36,
    },
  ];

  // Modified function to support reverse ranking for defect-like data (lower is better)
  const getRankedValue = (data, reverse = false) => {
    const entries = Object.entries(data).filter(([key]) => key !== "key" && key !== "label");
    const sorted = [...entries].sort(([, a], [, b]) => (reverse ? a - b : b - a));
    const ranked = {};
    sorted.forEach(([key, value], index) => {
      ranked[key] = { value, rank: index + 1 };
    });
    return ranked;
  };

  const rankedOfficerData = rawOfficerData.map((row) => {
    const reverseRankLabels = ["BB", "P"]; // Lower values are better for these
    const reverse = reverseRankLabels.includes(row.label);
    const ranks = getRankedValue(row, reverse);
    return {
      key: row.key,
      label: row.label,
      ajith: ranks.ajith,
      isuru: ranks.isuru,
      udara1: ranks.udara1,
      gamini: ranks.gamini,
      udara2: ranks.udara2,
    };
  });

  const getCellStyle = (rank) => {
    switch (rank) {
      case 1:
        return { backgroundColor: "#ffd700", fontWeight: "bold" }; // Gold
      case 2:
        return { backgroundColor: "#c0c0c0", fontWeight: "bold" }; // Silver
      case 3:
        return { backgroundColor: "#cd7f32", fontWeight: "bold" }; // Bronze
      default:
        return {};
    }
  };

  const renderRankedCell = (text) => {
    if (!text || typeof text !== "object") return text;
    const { value, rank } = text;
    return {
      children: `${value}% (Rank ${rank})`,
      props: {
        style: getCellStyle(rank),
      },
    };
  };

  const officerColumns = [
    { title: "", dataIndex: "label", key: "label" },
    { title: "Ajith", dataIndex: "ajith", key: "ajith", render: renderRankedCell },
    { title: "Isuru", dataIndex: "isuru", key: "isuru", render: renderRankedCell },
    { title: "Udara", dataIndex: "udara1", key: "udara1", render: renderRankedCell },
    { title: "Gamini", dataIndex: "gamini", key: "gamini", render: renderRankedCell },
    { title: "Chamod", dataIndex: "udara2", key: "udara2", render: renderRankedCell },
  ];

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={1000}>
      <Title level={5}>Officer Performance Ranking</Title>
      <Table
        dataSource={rankedOfficerData}
        columns={officerColumns}
        pagination={false}
        bordered
      />
    </Modal>
  );
};

export default PerformanceModal;
