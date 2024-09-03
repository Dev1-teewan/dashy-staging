"use client";

import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { DataType } from "../types/TableDataType";
import React, { useEffect, useState } from "react";
import { Col, Collapse, Row, Table, Tag } from "antd";

import { sampleData } from "./SampleData";
import { sampleData2 } from "./SampleData2";

const Dashboard = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [totalValue, setTotalValue] = useState<string>("");

  useEffect(() => {
    getAssetsByOwner();
  }, []);

  const getAssetsByOwner = async () => {
    // const response = await fetch(
    //   `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       jsonrpc: "2.0",
    //       id: "asset-id",
    //       method: "searchAssets",
    //       params: {
    //         ownerAddress: "FCHTRYx6npkQCogtpZtEFLJeevAFGbDHhJyvqvT6F4kX",
    //         tokenType: "fungible",
    //         displayOptions: {
    //           showNativeBalance: true,
    //           showGrandTotal: true,
    //         },
    //       },
    //     }),
    //   }
    // );
    // const data = await response.json();
    const data = sampleData2;
    console.log(data);

    // Map the data to the required DataType
    let mappedData = data.result.items
      .filter((item: any) => item.token_info?.price_info?.total_price > 0.9)
      .map((item: any, index: number) => ({
        key: index.toString(),
        asset: {
          icon: item.content?.links?.image || item.content?.files[0]?.uri || "",
          name:
            item.token_info.symbol || item.content.metadata?.name || "Unknown",
          link: `https://explorer.solana.com/address/${item.id}?cluster=mainnet`,
        },
        amount: (
          item.token_info?.balance / Math.pow(10, item.token_info?.decimals)
        )
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        price: {
          value: `$${item.token_info?.price_info?.price_per_token || 0}`,
          change: "N/A", // Assuming you don't have the change data from the API
          color: "rgb(9, 155, 103)", // Assuming green as a placeholder
        },
        value: `$${(item.token_info?.price_info?.total_price || 0).toFixed(2)}`,
      }));

    // Include nativeBalance as a separate entry
    const nativeBalanceData = data.result.nativeBalance.lamports
      ? {
          key: "native",
          asset: {
            icon: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
            name: "SOL",
            link: "https://explorer.solana.com",
          },
          amount: (data.result.nativeBalance.lamports / Math.pow(10, 9)) // Convert lamports to SOL
            .toString()
            .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
          price: {
            value: `$${data.result.nativeBalance.price_per_sol || 0}`,
            change: "N/A", // Assuming you don't have the change data from the API
            color: "rgb(9, 155, 103)", // Assuming green as a placeholder
          },
          value: `$${data.result.nativeBalance.total_price.toFixed(2)}`,
        }
      : {};
    console.log(nativeBalanceData);

    // Combine the data
    if (nativeBalanceData.value) {
      mappedData = [...mappedData, nativeBalanceData];
    }

    // Sum up all values
    const totalValue = mappedData.reduce((sum: number, item: any) => {
      // Extract numerical value from string (e.g., "$5.16") and add to sum
      const value = parseFloat(item.value.replace("$", ""));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    setTotalValue(totalValue.toFixed(2));
    setDataSource(mappedData);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
      sorter: {
        compare: (a, b) =>
          a.asset.name.toString().localeCompare(b.asset.name.toString()),
        multiple: 3,
      },
      render: (asset) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src={asset.icon}
            alt="Token icon"
            width={28}
            height={28}
            style={{
              borderRadius: "10rem",
              marginRight: 8,
            }}
          />
          <a href={asset.link} target="_blank" rel="noopener noreferrer">
            {asset.name}
          </a>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      sorter: {
        compare: (a, b) =>
          parseFloat(a.amount.replace(/,/g, "")) -
          parseFloat(b.amount.replace(/,/g, "")),
        multiple: 3,
      },
    },
    {
      title: "Price (24h change)",
      dataIndex: "price",
      key: "price",
      align: "right",
      sorter: {
        compare: (a, b) => {
          // Convert the value strings to numbers for comparison
          const valueA = parseFloat(a.price.value.replace(/[$,]/g, ""));
          const valueB = parseFloat(b.price.value.replace(/[$,]/g, ""));
          return valueA - valueB;
        },
        multiple: 3,
      },
      render: (price) => (
        <div>
          <span>{price.value}</span>
          <Tag color={price.color} style={{ marginLeft: 8 }}>
            {price.change}
          </Tag>
        </div>
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      align: "right",
      sorter: {
        compare: (a, b) => {
          // Convert the value strings to numbers for comparison
          const valueA = parseFloat(a.value.replace(/[$,]/g, ""));
          const valueB = parseFloat(b.value.replace(/[$,]/g, ""));
          return valueA - valueB;
        },
        multiple: 3,
      },
      defaultSortOrder: "descend",
    },
  ];

  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
      <Row>
        <Col span={24} className="!min-h-0">
          <Collapse
            ghost
            defaultActiveKey={["1"]}
            className="bg-[#141414] text-base"
            expandIconPosition="end"
            items={[
              {
                key: "1",
                label: (
                  <div className="text-xl font-bold">
                    Balance - ${totalValue}
                  </div>
                ),
                children: (
                  <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={dataSource.length > 10 ? {} : false}
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? "table-row-dark" : ""
                    }
                  />
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
