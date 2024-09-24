"use client";

import Link from "next/link";
import Image from "next/image";
import { Tag, Tooltip } from "antd";
import CustomSelect from "./CustomSelect";
import CopyToClipboard from "./CopyToClipboard";
import type { ColumnsType } from "antd/es/table";
import { DragHandle } from "./table/CustomizeRow";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  accountGroupDataType,
  balanceDataType,
  topAddressDataType,
  transactionDataType,
} from "../../types/TableDataType";

// Extend the column type to add an optional `editable` field
// Create a type by extending each column type with an `editable` property
export type EditableColumnType = ColumnsType<accountGroupDataType>[number] & {
  editable?: boolean;
};

export const accountGroupColumns: EditableColumnType[] = [
  {
    key: "sort",
    align: "center",
    width: 20,
    render: () => <DragHandle />,
  },
  {
    title: "Alias",
    width: "235px",
    key: "alias",
    dataIndex: "alias",
    editable: true,
  },
  {
    title: "Address",
    width: "180px",
    key: "address",
    dataIndex: "address",
    render: (address) => {
      const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
      return (
        <Tooltip className="inline-flex gap-4" title={address}>
          <span>{shortAddress}</span>
          <CopyToClipboard address={address} />
        </Tooltip>
      );
    },
  },
  {
    title: "From",
    width: "235px",
    key: "from",
    dataIndex: "from",
    editable: true,
  },
  {
    title: "To",
    width: "235px",
    key: "to",
    dataIndex: "to",
    editable: true,
  },
  {
    title: "Purpose",
    width: "235px",
    key: "purpose",
    dataIndex: "purpose",
    editable: true,
  },
  {
    title: "Balance",
    width: "85px",
    key: "balance",
    dataIndex: "balance",
    render: (balance) => <span>${balance}</span>,
  },
];

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
];

export const topAddressColumns: ColumnsType<topAddressDataType> = [
  {
    title: "Address",
    key: "address",
    dataIndex: "address",
    render: (address) => (
      <div className="inline-flex gap-4">
        <Link
          href={`https://solscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate block w-full text-[#06d6a0]"
        >
          {address}
        </Link>

        <CopyToClipboard address={address} />
      </div>
    ),
  },
  // {
  //   title: "Interaction",
  //   width: "205px",
  //   key: "count",
  //   dataIndex: "count",
  // },
  {
    title: "Balance (USDC)",
    width: "205px",
    key: "balance",
    dataIndex: "balance",
  },
  {
    title: "Grouping",
    width: "310px",
    key: "grouping",
    render: (_, record) => (
      <div className="TopEngaged">
        <CustomSelect address={record.address} />
      </div>
    ),
  },
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
