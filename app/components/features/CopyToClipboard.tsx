import { Tooltip } from "antd";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { CopyOutlined } from "@ant-design/icons";

const CopyToClipboard = ({ address }: { address: string }) => {
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    copy(address as string);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 1000);
  };

  return (
    <Tooltip
      placement="top"
      trigger="click"
      open={visible}
      color={"#1f1f1f"}
      title={"Copied to Clipboard"}
      arrow={{
        pointAtCenter: true,
      }}
    >
      <CopyOutlined
        style={{ color: "#06d6a0" }}
        onClick={() => handleClick()}
      />
    </Tooltip>
  );
};

export default CopyToClipboard;
