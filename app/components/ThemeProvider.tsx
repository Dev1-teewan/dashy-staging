import { ConfigProvider } from "antd";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#06d6a0",
          colorText: "#FFFFFF",
          colorBgBase: "#000000",
          colorLinkHover: "#06d6a0",
        },
        components: {
          Button: {
            colorPrimary: "#06d6a0",
            algorithm: true,
          },
          Menu: {
            darkItemHoverBg: "#141414",
            darkItemSelectedBg: "#141414",
            darkItemSelectedColor: "#06d6a0",
            itemSelectedColor: "#141414",
            darkItemColor: "#ffffff",
          },
          Table: {
            cellFontSize: 16,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
