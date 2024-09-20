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
          colorBorder: "#06d6a0",
          colorTextDescription: "#f1f1f1",
          colorTextHeading: "#f1f1f1",
          colorTextPlaceholder: "#4b5563",
        },
        components: {
          Button: {
            colorPrimary: "#06d6a0",
            defaultColor: "#fcfcfd",
            defaultBorderColor: "#fcfcfd",
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
            expandIconBg: "#003628",
            headerBg: "#1D1D1D",
            rowHoverBg: "#262626",
            rowExpandedBg: "#141414",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
