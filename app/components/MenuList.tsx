import React from "react";
import { Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";

const MenuList = () => {
  const items = [
    {
      key: "1",
      icon: <UserOutlined size={18} />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <UserOutlined size={18} />,
      label: "Nav 2",
    },
    {
      key: "3",
      icon: <UserOutlined size={18} />,
      label: "Nav 3",
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={items}
      className="flex flex-col gap-1 font-semibold bg-transparent"
      defaultSelectedKeys={["1"]}
    />
  );
};

export default MenuList;
