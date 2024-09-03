import { Button } from "antd";
// import dynamic from "next/dynamic";
import { SettingFilled } from "@ant-design/icons";

// // To avoid Hydration Mismatch Error
// const WalletMultiButtonDynamic = dynamic(
//   async () =>
//     (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
//   { ssr: false }
// );

const HeaderItem = () => {
  return (
    <div className="flex justify-between items-center p-5">
      <div></div>
      <div className="flex items-center gap-2 px-3">
        <Button
          className="flex justify-center items-center !bg-[#141414] !border-[#141414] hover:!border-[#06d6a0] !text-white hover:!text-[#06d6a0]"
          ghost
          icon={<SettingFilled />}
        ></Button>

        <Button className="bg-[#003628] text-[#06d6a0] hover:!text-[#000000] hover:!bg-[#06d6a0] border-none font-bold text-center w-32">
          <span>Connect</span>
        </Button>

        {/* <WalletMultiButtonDynamic /> */}
      </div>
    </div>
  );
};

export default HeaderItem;
