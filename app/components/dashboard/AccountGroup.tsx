"use client";

import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { fetchAssets } from "@/app/utils/HeliusRPC";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import { EditableCell, EditableRow } from "../features/EditableCell";
import { accountGroupColumns, balanceColumns } from "../features/TableColumns";
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
  const [localSource, setLocalSource] = useLocalStorage<any[]>("itemG1", []);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);
  const [inputAddress, setInputAddress] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const [expandedRows, setExpandedRows] = useState<string[]>([]); // State to track expanded rows
  const [addressToken, setAccountToken] = useState<Record<string, []>>({}); // Store balances per address

  useEffect(() => {
    if (localSource.length > 0) {
      setCount(Math.max(...localSource.map((item: any) => item.key)) + 1);
    } else {
      setCount(1);
    }
    setDataSource(localSource);
  }, [localSource]);

  useEffect(() => {
    if (dataSource.length > 0) {
      setLocalSource(dataSource);
    }
  }, [dataSource, setLocalSource]);

  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      newData.splice(index, 1, { ...newData[index], ...row });
      setDataSource(newData);
    }
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
      width: "60px",
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

  const handleAdd = async () => {
    try {
      const publicKey = new PublicKey(inputAddress);
      messageApi.open({
        type: "loading",
        content: "Fetching balance..",
        duration: 0,
      });

      const response = await fetchAssets(inputAddress);
      messageApi.destroy();

      messageApi.destroy();
      if (response.status === "success") {
        setAccountToken((prev) => ({
          ...prev,
          [inputAddress]: response.dataSource,
        }));
        // TODO: update balance when expanding row
        const newData = {
          key: count,
          alias: "-",
          address: inputAddress || "-",
          from: "-",
          to: "-",
          purpose: "-",
          balance: response.totalValue || 0,
        };
        setDataSource([...dataSource, newData]);
        setExpandedRows((prev) => [...prev, inputAddress]);
        setCount(count + 1);
        setInputAddress("");
      }
    } catch (error) {
      messageApi.error("Invalid wallet address");
      console.error("Invalid wallet address", error);
    }
  };

  // Handle row expand event
  const handleExpand = async (expanded: boolean, record: any) => {
    if (!expandedRows.includes(record.address) && expanded) {
      try {
        messageApi.open({
          type: "loading",
          content: "Fetching balance..",
          duration: 0,
        });
        const response = await fetchAssets(record.address);
        messageApi.destroy();

        if (response.status === "success") {
          setAccountToken((prev) => ({
            ...prev,
            [record.address]: response.dataSource,
          }));
          setExpandedRows((prev) => [...prev, record.address]);
        }
      } catch (error) {
        messageApi.error("Failed to fetch balance");
        console.error("Error fetching balance", error);
      }
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
                    className="mt-2"
                    bordered={false}
                    columns={columns}
                    pagination={false}
                    dataSource={dataSource}
                    components={components}
                    locale={{ emptyText: <Empty /> }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          dataSource={addressToken[record.address] || []}
                          columns={balanceColumns}
                          pagination={dataSource.length > 10 ? {} : false}
                        />
                      ),
                      onExpand: handleExpand, // Trigger balance fetch on expand
                    }}
                  />
                  <Space
                    className="mt-2"
                    style={{ display: "flex", alignItems: "stretch" }}
                  >
                    <Input
                      value={inputAddress}
                      placeholder="Enter address"
                      onChange={(e) => setInputAddress(e.target.value)}
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
