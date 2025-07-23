import React from "react";
import { Row, Col } from "antd";

const cardStyle = (bg) => ({
  backgroundColor: bg,
  borderRadius: 10,
  padding: "14px 24px",
  textAlign: "center",
  fontWeight: 600,
  color: "#000",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
});

const TargetSummaryCards = ({
  targets,
  totals,
  weeklySummery,
  weekTargets,
  monthlyTarget,
}) => {
  const totalAchievement = totals.normal + totals.super;
  const overallPercentage = ((totalAchievement / targets) * 100).toFixed(0);

  return (
    <>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} md={10}>
          <div style={cardStyle("#ffa347")}>
            Target<br />
            {targets}
          </div>
        </Col>

        <Col xs={24} md={10}>
          <div style={cardStyle("#47a3ff")}>
            Achievement<br />
            {totalAchievement}
          </div>
        </Col>

        <Col xs={24} md={4}>
          <div style={cardStyle("#ffa347")}>{overallPercentage}%</div>
        </Col>
      </Row>

      <br />

      {weeklySummery.length > 0 && (
        <Row gutter={[16, 16]}>
          {weeklySummery.map((week, index) => {
            const bgColors = ["#47a3ff", "#ffc547", "#ff6b8b", "#47a3ff"];
            const weekTarget = weekTargets[index] * monthlyTarget / 100;
            const percentage = ((week.total / weekTarget) * 100).toFixed(0);

            return (
              <Col xs={24} sm={6} key={index}>
                <div style={cardStyle(bgColors[index])}>
                  {week.total} / {weekTarget} - {percentage}%
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default TargetSummaryCards;
