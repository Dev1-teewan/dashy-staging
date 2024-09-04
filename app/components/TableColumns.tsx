"use client";

import { Tag } from "antd";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { DataType } from "../types/TableDataType";

export const columns: ColumnsType<DataType> = [
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