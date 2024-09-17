"use client";

import { useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { accountGroupColumns } from "../features/TableColumns";
import { EditableCell, EditableRow } from "../features/EditableCell";
import {
  Button,
  Col,
  Collapse,
  Empty,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
} from "antd";

const AccountGroup = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      alias: "Personal salary",
      address: "Cnc.....6qw",
      from: "Kraken company",
      to: "Raydium, DuY...8sH",
      purpose: "Yield Farming",
      balance: 0.12,
      token: "SOL",
    },
  ]);

  const [count, setCount] = useState(2);
  const [inputAddress, setInputAddress] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    ...accountGroupColumns.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title as string | undefined,
          handleSave,
        }),
      };
    }),
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: any) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleAdd = () => {
    try {
      const publicKey = new PublicKey(inputAddress);
      const newData: any = {
        key: count,
        alias: "-",
        address: inputAddress || "-", // Use inputAddress state for the address field
        from: "-",
        to: "-",
        purpose: "-",
        balance: 0,
        token: "SOL",
      };
      setDataSource([...dataSource, newData]);
      setCount(count + 1);
      setInputAddress(""); // Clear the input field after adding the row
    } catch (error) {
      messageApi.error("Invalid wallet address");
      console.error("Invalid wallet address", error);
    }
  };

  return (
    <Row>
      <Col span={24} className="!min-h-0">
        {contextHolder}
        <Collapse
          ghost
          defaultActiveKey={["1"]}
          className="bg-[#141414] text-base"
          expandIconPosition="end"
          items={[
            {
              key: "1",
              label: <div className="text-xl font-bold pl-2">Group 1</div>,
              children: (
                <div className="pl-2">
                  <Row>
                    <Col span={4} className="font-bold text-lg">
                      Chain:
                    </Col>
                    <Col span={20}>Solana</Col>
                  </Row>
                  <Row>
                    <Col span={4} className="font-bold text-lg">
                      Group Name:
                    </Col>
                    <Col span={20}>
                      <InputTag />
                    </Col>
                  </Row>
                  <Table
                    components={components}
                    rowClassName={() => "editable-row"}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    className="mt-2"
                    locale={{ emptyText: <Empty /> }}
                    pagination={false}
                  />
                  <Space
                    className="mt-2"
                    style={{ display: "flex", alignItems: "stretch" }}
                  >
                    <Input
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                      placeholder="Enter address"
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAdd(); // Trigger handleAdd when Enter is pressed
                        }
                      }}
                    />
                    <Button
                      onClick={handleAdd}
                      className="custom-button w-36 mb-2"
                    >
                      Add a row
                    </Button>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default AccountGroup;
