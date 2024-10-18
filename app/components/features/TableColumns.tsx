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
  type?: string;
};

export const accountGroupColumns: EditableColumnType[] = [
  {
    key: "sort",
    align: "center",
    width: "50px",
    render: () => (
      <div className="flex items-center min-h-[32px]">
        <DragHandle />
      </div>
    ),
  },
  {
    title: "Alias",
    width: "17%",
    key: "alias",
    dataIndex: "alias",
    editable: true,
  },
  {
    title: "Address",
    width: "17%",
    key: "address",
    dataIndex: "address",
    render: (address) => {
      const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
      return (
        <Tooltip className="inline-block" title={address}>
          <span className="mr-4">{shortAddress}</span>
          <CopyToClipboard address={address} />
        </Tooltip>
      );
    },
  },
  {
    title: "Connections",
    width: "20%",
    key: "connections",
    dataIndex: "connections",
    editable: true,
    type: "select",
  },
  {
    title: "Purpose",
    width: "22%",
    key: "purpose",
    dataIndex: "purpose",
    editable: true,
  },
  {
    title: "Balance",
    width: "",
    key: "balance",
    dataIndex: "balance",
    render: (balance) => <span>${balance}</span>,
  },
];

export const transactionColumns: ColumnsType<transactionDataType> = [
  {
    title: "Date",
    width: "15%",
    key: "timestamp",
    dataIndex: "timestamp",
    render: (timestamp) =>
      new Date(timestamp * 1000).toLocaleString("en-US", {
        month: "short", // "Oct"
        day: "2-digit", // "01"
        year: "numeric", // "2024"
        hour: "2-digit", // "21"
        minute: "2-digit", // "02"
        hour12: false, // 24-hour format
      }),
  },
  {
    title: "TxID",
    width: "10%",
    key: "txnID",
    dataIndex: "txnID",
    render: (txnID) => (
      <Link
        href={`https://solscan.io/tx/${txnID}`}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate block w-full text-[#06d6a0]"
      >
        {txnID.slice(0, 4)}...
      </Link>
    ),
  },
  {
    title: "Platform",
    width: "10%",
    key: "platform",
    dataIndex: "platform",
  },
  {
    title: "Type",
    width: "10%",
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
        {/* Handle native outgoing transfers */}
        {record.transferType === "Native" && record.outgoing > 0 && (
          <div>
            <span className="text-[#06d6a0] mr-2">-</span>
            {parseFloat(record.outgoing.toString())} SOL
          </div>
        )}

        {/* Handle token outgoing transfers */}
        {record.transferType === "Token" && record.outgoing > 0 && (
          <div>
            <span className="text-[#06d6a0] mr-2">-</span>
            {parseFloat(record.outgoing.toString())} {record.tokenSymbol}{" "}
          </div>
        )}

        {/* Display the fee if applicable */}
        {record.fee > 0 && (
          <div>
            <span className="text-[#06d6a0] mr-2">-</span>
            {parseFloat(record.fee.toString())} SOL
          </div>
        )}
      </div>
    ),
  },
  {
    title: "Ingoing",
    key: "ingoing",
    dataIndex: "ingoing",
    render: (_, record) => (
      <div>
        {/* Handle native ingoing transfers */}
        {record.transferType === "Native" && record.ingoing > 0 && (
          <div>
            <span className="text-[#06d6a0] mr-2">+</span>
            {parseFloat(record.ingoing.toString())} SOL
          </div>
        )}

        {/* Handle token ingoing transfers */}
        {record.transferType === "Token" && record.ingoing > 0 && (
          <div>
            <span className="text-[#06d6a0] mr-2">+</span>
            {parseFloat(record.ingoing.toString())} {record.tokenSymbol}
          </div>
        )}
      </div>
    ),
  },
  {
    title: "From",
    width: "10%",
    key: "fromAddress",
    dataIndex: "fromAddress",
    render: (fromAddress) => {
      const shortAddress = `${fromAddress.slice(0, 4)}...${fromAddress.slice(
        -4
      )}`;
      return (
        <Tooltip className="inline-flex gap-2" title={fromAddress}>
          <span>{shortAddress}</span>
          <CopyToClipboard address={fromAddress} />
        </Tooltip>
      );
    },
  },
  {
    title: "To",
    width: "10%",
    key: "toAddress",
    dataIndex: "toAddress",
    render: (toAddress) => {
      const shortAddress = `${toAddress.slice(0, 4)}...${toAddress.slice(-4)}`;
      return (
        <Tooltip className="inline-flex gap-2" title={toAddress}>
          <span>{shortAddress}</span>
          <CopyToClipboard address={toAddress} />
        </Tooltip>
      );
    },
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
        <span>{`$${parseFloat(price.value.replace(/[$,]/g, "")).toFixed(
          2
        )}`}</span>
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
