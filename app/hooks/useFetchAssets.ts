"use client";

import { message } from "antd";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAssets, fetchTransactions } from "../utils/HeliusRPC";

export const useFetchAssets = (type: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicKey = searchParams.get("watching") ?? "";

  const [dataSource, setDataSource] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      if (type === "balance") {
        const response = await fetchAssets(publicKey);
        if (response.status === "success") {
          setDataSource(response.dataSource);
          setTotalValue(response.totalValue);
        } else {
          messageApi.error("Invalid wallet address or no assets found");
          router.push("/");
        }
      } else if (type === "transactions") {
        const response = await fetchTransactions(publicKey);

        if (response.status === "success") {
          console.log(response.transactions);
          setTransactions(response.transactions);
        } else {
          messageApi.error("Invalid wallet address or no transactions found");
          router.push("/");
        }
      }
    };

    fetchData();
  }, [publicKey, router, messageApi, type]);

  // Return data conditionally based on type
  return type === "balance"
    ? { dataSource, totalValue, contextHolder }
    : { transactions, contextHolder };
};
