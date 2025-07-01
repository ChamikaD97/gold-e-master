import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons"; // Optional: Add a custom loading spinner
import { ReloadOutlined } from "@ant-design/icons"; // Import the icon
import { TrainOutlined } from "@mui/icons-material";

// Custom button component
const CustomButton = ({
  text,
  onClick,
  loading = false,
  icon,
  type,
  style = {},
  size = "medium",
  ...props
}) => {
  // Optional: Custom loading spinner icon
  const loadingIcon = <LoadingOutlined spin />;
  const refresh = <ReloadOutlined />;
  // Custom styles based on size
  const buttonStyle = {
    padding: size === "large" ? "12px 20px" : "8px 16px",
    fontSize: size === "large" ? "18px" : "16px",
    cursor: "pointer",
    borderRadius: "12px",
    backgroundColor: type,
    color: "#fff",
    border: "none",
    marginRight:'8px',
    outline: "none",
    
    
    ...style, // Allow additional styles to be passed
  };

  const handleClick = (e) => {
    if (!loading) {
      onClick && onClick(e); // Only trigger onClick if not loading
    }
  };

  return (
    <div {...props} onClick={handleClick} style={buttonStyle}>
      {loading ? (
        <Spin indicator={loadingIcon} />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {text}
        </>
      )}
    </div>
  );
};

export default CustomButton;
