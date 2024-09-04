import Link from "next/link";
import { Layout } from "antd";
import Sider from "antd/lib/layout/Sider";
import MenuList from "../components/MenuList";
import HeaderItem from "../components/HeaderItem";
import { Header, Content } from "antd/lib/layout/layout";

const AntLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout hasSider>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={260}
        className="!fixed !bg-black h-[100vh] !z-[12] !px-1 !py-[14px]"
      >
        {/* Replace with img for Logo */}
        <div className="mb-2 pl-6 flex flex-row gap-2 text-2xl font-semibold tracking-wider ">
          <Link href="/">Dashy</Link>
        </div>
        <MenuList />
      </Sider>
      <Layout>
        <Header className="fixed left-0 lg:left-[260px] h-[75px] flex flex-col w-screen lg:w-[calc(100vw-260px)] p-0 z-10 bg-black text-white  ">
          <HeaderItem />
        </Header>
        <Content className="relative lg:left-[260px] min-h-[calc(100vh-75px)] mt-[calc(75px)] mx-0 flex justify-center w-full lg:w-[calc(100vw-260px)] px-8 pl-4  text-white ">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntLayout;
