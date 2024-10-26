"use client";

import React, { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { SessionProvider } from "next-auth/react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const environment = process.env.NEXT_PUBLIC_ENV;
  console.log("Environment: ", environment);

  // Use useMemo to determine the endpoint based on the environment
  const endpoint = useMemo(() => {
    if (environment === "Production") {
      return `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`;
    } else {
      return clusterApiUrl(WalletAdapterNetwork.Devnet); // Use Devnet for staging
    }
  }, [environment]);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      // new UnsafeBurnerWalletAdapter(),
      // new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SessionProvider refetchInterval={0}>{children}</SessionProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
