"use client";

import { message } from "antd";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAssets, fetchTransactions } from "../utils/HeliusRPC";
import { useWallet } from "@solana/wallet-adapter-react";

export const useFetchAssets = (type: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { publicKey } = useWallet();
  const address = publicKey?.toBase58() || searchParams.get("watching") || "";

  // State variables
  const [dataSource, setDataSource] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [topAddresses, setTopAddresses] = useState<
    { key: string; address: string }[]
  >([]);

  const [loading, setLoading] = useState(false); // To manage loading state
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === "balance") {
          const response = await fetchAssets(address);
          if (response.status === "success") {
            setDataSource(response.dataSource);
            setTotalValue(response.totalValue);
          } else {
            messageApi.error("Invalid wallet address or no assets found");
            router.push("/");
          }
        } else if (type === "transactions") {
          const response = await fetchTransactions(address);
          if (response.status === "success") {
            setTransactions(response.transactions);
            setTopAddresses(response.topAddresses || []);
          } else {
            messageApi.error("Invalid wallet address or no transactions found");
            router.push("/");
          }
        }
      } catch (error) {
        messageApi.error("Failed to fetch data");
      } finally {
        setLoading(false); // End loading
      }
    };

    if (address) fetchData();
  }, [address, type, router, messageApi]);

  // Separate useEffect to handle message API
  useEffect(() => {
    if (loading) {
      messageApi.open({
        type: "loading",
        content: `Fetching ${type} data...`,
        duration: 0, // Show indefinitely until destroyed
      });
    } else {
      messageApi.destroy();
    }
  }, [loading, messageApi, type]);

  return type === "balance"
    ? { dataSource, totalValue, contextHolder }
    : { transactions, topAddresses, contextHolder };
};
