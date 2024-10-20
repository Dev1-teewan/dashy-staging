"use client";

import Link from "next/link";
import Image from "next/image";
import { Layout } from "antd";
import { useState } from "react";
import MenuList from "./MenuList";
import HeaderItem from "../HeaderItem";
import Sider from "antd/lib/layout/Sider";
import dashy from "../../assets/Dashy-Text-Only-White.png";
import { usePathname } from "next/navigation";
import { Header, Content } from "antd/lib/layout/layout";

const AntLayout = ({ children }: { children: React.ReactNode }) => {
  const [sider, setSider] = useState({ collapsed: true });

  const onCollapse = (collapsed: any) => {
    setSider({ collapsed });
  };

  const pathname = usePathname();

  // Check if the current path is the landing page ("/")
  const isLandingPage = pathname === "/";

  return !isLandingPage ? (
    <Layout hasSider>
      <Sider
        // breakpoint="lg"
        width={260}
        collapsedWidth="87"
        collapsed={sider.collapsed}
        onMouseEnter={() => onCollapse(false)}
        onMouseLeave={() => onCollapse(true)}
        className="!fixed !bg-[#020708] h-[100vh] !z-[12] !px-1 !py-[14px]"
      >
        <div className="pl-3 mb-4">
          <Link href="/">
            <Image src={dashy} alt={"dashy"} height={21.5} width={55} />
          </Link>
        </div>
        <MenuList sider={sider} />
      </Sider>
      <Layout>
        <Header className="fixed left-0 h-[75px] flex flex-col w-screen  p-0 z-10 !bg-[#020212] text-white">
          <HeaderItem />
        </Header>
        <Content className="relative min-h-[calc(100vh-75px)] mt-[calc(75px)] min-w-[calc(100vh-80px)] !bg-[#020212] ml-[calc(80px)] flex justify-center text-white">
          {children}
        </Content>
      </Layout>
    </Layout>
  ) : (
    <> {children}</>
  );
};

export default AntLayout;
