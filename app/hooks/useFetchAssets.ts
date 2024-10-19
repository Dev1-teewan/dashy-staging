"use client";

import { message } from "antd";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchAssets, fetchTransactions } from "../utils/HeliusRPC";

export const useFetchAssets = (type: string) => {
  const { publicKey } = useWallet(); // Connected wallet
  const searchParams = useSearchParams(); // URL search params
  const address = publicKey?.toBase58() || searchParams.get("watching") || "";

  // State variables
  const [dataSource, setDataSource] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Disabled for now
  // const [topAddresses, setTopAddresses] = useState<
  //   { key: string; address: string }[]
  // >([]); 

  // Loading state and message API
  const [loading, setLoading] = useState(false); 
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
          }
        } else if (type === "transactions") {
          const response = await fetchTransactions(address);
          if (response.status === "success") {
            setTransactions(response.transactions);
            // setTopAddresses(response.topAddresses || []);
          } else {
            messageApi.error("Invalid wallet address or no transactions found");
          }
        }
      } catch (error) {
        messageApi.error("Failed to fetch data");
      } finally {
        setLoading(false); // End loading
      }
    };

    // Fetch data if address is available
    if (address) fetchData();
  }, [address, type, messageApi]);

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
    : { transactions, contextHolder };
};
