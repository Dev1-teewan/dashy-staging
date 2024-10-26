"use client";

import { Button } from "antd";
import dynamic from "next/dynamic";
import Backup from "./features/backup/BackupJson";
import { SettingFilled } from "@ant-design/icons";
import { ConnectDropdown } from "./ConnectDropdown";

import bs58 from "bs58";
import Link from "next/link";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SigninMessage } from "@/app/utils/SigninMessage";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";

// To avoid Hydration Mismatch Error
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const HeaderItem = () => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const { data: session, status } = useSession();

  const handleSignIn = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();

      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  useEffect(() => {
    if (wallet.connected && status === "unauthenticated") {
      handleSignIn();
    }

    if (wallet.disconnecting && status === "authenticated") {
      handleSignOut();
    }

    // Handle the case where the user change wallets through the dropdown
    if (
      wallet.publicKey?.toBase58() !== session?.wallet?.pubKey &&
      status === "authenticated"
    ) {
      handleSignOut();
      handleSignIn();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  useEffect(() => {
    // Handle the case where the user change wallets from extension
    if (
      wallet.publicKey?.toBase58() !== session?.wallet?.pubKey &&
      status === "authenticated"
    ) {
      handleSignOut();
      handleSignIn();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="flex justify-between items-center p-5">
      <div></div>
      <div className="flex items-center gap-2 px-3">
        {/* <Button
          className="flex justify-center items-center !bg-[#141414] !border-[#141414] hover:!border-[#06d6a0] !text-white hover:!text-[#06d6a0]"
          ghost
          icon={<SettingFilled />}
        ></Button> */}

        {/* <ConnectDropdown /> */}

        {/* <Link legacyBehavior href="/api/examples/protected">
          <a>Protected API Route</a>
        </Link> */}
        <WalletMultiButtonDynamic className="custom-button" />
        {/* <Backup /> */}
      </div>
    </div>
  );
};

export default HeaderItem;
