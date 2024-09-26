"use client";

import { Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  DotChartOutlined,
  HistoryOutlined,
  HomeOutlined,
} from "@ant-design/icons";

interface MenuListProps {
  sider: { collapsed: boolean };
}

const MenuList = ({ sider }: MenuListProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: "/",
      icon: <HomeOutlined size={18} />,
      label: sider.collapsed ? null : "Dashboard",
      onClick: () => router.push("/"),
    },
    {
      key: "/engage",
      icon: <DotChartOutlined size={18} />,
      label: sider.collapsed ? null : "Engaged",
      onClick: () => router.push("/engage"),
    },
    {
      key: "/history",
      icon: <HistoryOutlined size={18} />,
      label: sider.collapsed ? null : "Transactions History",
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
