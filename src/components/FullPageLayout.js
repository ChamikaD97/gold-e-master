import React from "react";
import background from "../images/background.jpg";

const FullPageLayout = ({ children }) => {
  return (
    <div
      style={{
        height: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center", // center horizontally
        alignItems: "center",     // center vertically
      }}
    >
      {children}
    </div>
  );
};

export default FullPageLayout;
