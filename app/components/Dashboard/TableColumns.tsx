"use client";

import { Tag } from "antd";
import Link from "next/link";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  balanceDataType,
  transactionDataType,
} from "../../types/TableDataType";

export const transactionColumns: ColumnsType<transactionDataType> = [
  {
    title: "Date",
    width: "120px",
    key: "timestamp",
    dataIndex: "timestamp",
    render: (timestamp) => new Date(timestamp * 1000).toLocaleDateString(),
  },
  {
    title: "TxID",
    width: "100px",
    key: "txnID",
    dataIndex: "txnID",
    render: (txnID) => (
      <Link
        href={`https://solscan.io/tx/${txnID}`}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate block w-full text-[#06d6a0]"
      >
        {txnID}
      </Link>
    ),
  },
  {
    title: "Platform",
    width: "120px",
    key: "platform",
    dataIndex: "platform",
  },
  {
    title: "Type",
    width: "160px",
    key: "type",
    dataIndex: "type",
    render: (type) => (
      <div className="flex gap-2">
        {type === "Send" ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        {type}
      </div>
    ),
  },
  {
    title: "Outgoing",
    key: "outgoing",
    dataIndex: "outgoing",
    render: (_, record) => (
      <div>
        {record.transferType === "Native" && record.outgoing > 0 && (
          <div>{record.outgoing.toFixed(7)} SOL</div>
        )}
        {record.fee > 0 && <div>{record.fee.toFixed(7)} SOL</div>}
      </div>
    ),
  },
  {
    title: "Ingoing",
    key: "ingoing",
    dataIndex: "ingoing",
    render: (ingoing) => <div>{ingoing}</div>,
  },
  {
    title: "From",
    key: "fromAddress",
    dataIndex: "fromAddress",
    render: (fromAddress) => (
      <div className="truncate block w-full">{fromAddress}</div>
    ),
  },
  {
    title: "To",
    key: "toAddress",
    dataIndex: "toAddress",
    render: (fromAddress) => (
      <div className="truncate block w-full">{fromAddress}</div>
    ),
  },
  // {
  //   title: "Action",
  //   key: "action",
  //   width: "120px",
  //   render: () => <a>Action</a>,
  // },
];

export const balanceColumns: ColumnsType<balanceDataType> = [
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
