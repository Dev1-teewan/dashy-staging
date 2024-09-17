"use client";

import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { getBalanceOnUSDC } from "@/app/utils/HeliusRPC";
import { accountGroupColumns } from "../features/TableColumns";
import { useLocalStorage } from "@solana/wallet-adapter-react";
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
  // Initialize dataSource with localStorage
  const [localSource, setLocalSource] = useLocalStorage<any[]>("itemG1", []);
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [count, setCount] = useState<number>(0); // Initialize count state
  const [inputAddress, setInputAddress] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  // Sync count with dataSource length on client-side mount
  useEffect(() => {
    try {
      if (localSource.length > 0) {
        setCount(Math.max(...localSource.map((item: any) => item.key)) + 1);
      } else {
        setCount(1);
      }
      if (Array.isArray(localSource)) {
        setDataSource(localSource);
      } else {
        setDataSource([]);
      }
    } catch {
      setDataSource([]);
    }
  }, [localSource]);

  // Update localStorage when tags change
  useEffect(() => {
    // Only set localStorage when tags is updated
    if (dataSource.length > 0) {
      setLocalSource(dataSource);
    }
  }, [dataSource, setLocalSource]);

  // Handle save operation
  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      newData.splice(index, 1, { ...newData[index], ...row });
      setDataSource(newData);
    }
  };

  // Handle delete operation
  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  // Editable cell and row components
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  // Define columns with editable configuration
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
            <a className="text-[#06d6a0]">Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  // Handle add new row
  const handleAdd = async () => {
    try {
      const publicKey = new PublicKey(inputAddress);
      messageApi.open({
        type: "loading",
        content: "Fetching balance..",
        duration: 0,
      });
      const balance = await getBalanceOnUSDC(inputAddress);
      messageApi.destroy();
      const newData = {
        key: count,
        alias: "-",
        address: inputAddress || "-",
        from: "-",
        to: "-",
        purpose: "-",
        balance: balance || 0,
        token: "USDC",
      };
      setDataSource([...dataSource, newData]);
      setCount(count + 1);
      setInputAddress("");
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
                          handleAdd();
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
