"use client";

import { Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";

const MenuList = () => {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: "/",
      icon: <UserOutlined size={18} />,
      label: "Dashboard",
      onClick: () => router.push("/"),
    },
    {
      key: "/history",
      icon: <UserOutlined size={18} />,
      label: "Transactions History",
      onClick: () => router.push("/history"),
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={items}
      selectedKeys={[pathname]}
      defaultSelectedKeys={["/"]}
      className="flex flex-col gap-1 font-semibold bg-transparent"
    />
  );
};

export default MenuList;
