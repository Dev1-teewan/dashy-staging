"use client";

import Link from "next/link";
import Image from "next/image";
import { Layout } from "antd";
import { useState } from "react";
import MenuList from "./MenuList";
import HeaderItem from "../HeaderItem";
import Sider from "antd/lib/layout/Sider";
import dashy from "../../assets/dashy.png";
import { Header, Content } from "antd/lib/layout/layout";

const AntLayout = ({ children }: { children: React.ReactNode }) => {
  const [sider, setSider] = useState({ collapsed: true });

  const onCollapse = (collapsed: any) => {
    setSider({ collapsed });
  };

  return (
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
        <div className="pl-6">
          <Link href="/">
            <Image src={dashy} alt={"dashy"} height={21.5} width={55} />
          </Link>
        </div>
        <MenuList sider={sider} />
      </Sider>
      <Layout>
        <Header className="fixed left-0 h-[75px] flex flex-col w-screen  p-0 z-10 bg-black text-white  ">
          <HeaderItem />
        </Header>
        <Content className="relative min-h-[calc(100vh-75px)] mt-[calc(75px)] mx-0 flex justify-center w-full px-8 pl-4  text-white ">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntLayout;
