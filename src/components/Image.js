import React from "react";
import { Image } from "antd"; 
import train from "../images/train.png"; // Adjust the path accordingly

const ImageCard = () => (
  <Image
  width={50} height={50}
  preview={false}
    src={train}
    
  />
);
export default ImageCard;
