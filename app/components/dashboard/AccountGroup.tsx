import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { fetchAssets } from "@/app/utils/HeliusRPC";
import { editableComponents } from "../features/EditableCell";
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

interface GroupData {
  groupName: string;
  accounts: any[];
  tags: string[];
  totalBalance: number;
}

interface AccountGroupProps {
  groupData: GroupData;
  groupIndex: number;
  updateGroup: (index: number, data: GroupData) => void;
  deleteGroup: (index: number) => void;
}

const AccountGroup = ({
  groupData,
  groupIndex,
  updateGroup,
  deleteGroup,
}: AccountGroupProps) => {
  // Toast msg & new address input state
  const [messageApi, contextHolder] = message.useMessage();
  const [inputAddress, setInputAddress] = useState<string>("");

  // State for group's data and tag / total balance
  const [dataSource, setDataSource] = useState<any[]>(groupData.accounts || []);
  const [tags, setTags] = useState<string[]>(groupData.tags || []);
  const [count, setCount] = useState<number>(dataSource.length + 1);
  const [totalBalance, setTotalBalance] = useState(0);

  // Save state for expended rows and its token list
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [addressTokenList, setAccountTokenList] = useState<Record<string, []>>(
    {}
  );

  // Notify parent components when there are changes (Deep comparison required)
  useEffect(() => {
    const total = dataSource.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0
    );

    // Check if tags or data source changed to avoid unnecessary updates
    if (
      JSON.stringify(dataSource) !== JSON.stringify(groupData.accounts) ||
      JSON.stringify(tags) !== JSON.stringify(groupData.tags) ||
      total !== groupData.totalBalance
    ) {
      updateGroup(groupIndex, {
        ...groupData,
        accounts: dataSource,
        tags,
        totalBalance: total, // Update total balance here
      });
      setTotalBalance(total); // Update local state for total balance
    }
  }, [dataSource, tags, groupData, groupIndex, updateGroup]);

  // Calculate total balance
  useEffect(() => {
    const calculateTotalBalance = () => {
      const total = dataSource.reduce((sum, account) => {
        return sum + parseFloat(account.balance);
      }, 0);
      setTotalBalance(total);
    };

    calculateTotalBalance();
  }, [dataSource]);

  // Functions on Tags
  useEffect(() => {
    setTags([...groupData.tags]); // Spread operator to create a new array
  }, [groupData.tags]);

  const handleTagsChange = (newTags: string[]) => {
    if (
      newTags.length !== tags.length ||
      !newTags.every((tag, index) => tag === tags[index])
    ) {
      setTags(newTags);
    }
  };

  // Functions on Table editable cells (Save & Delete row)
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

  const columns = [
    ...accountGroupColumns.map((col: any) => {
      if (!col.editable) return col;
      return {
        ...col,
        onCell: (record: any) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        }),
      };
    }),
    {
      title: "Operation",
      width: "60px",
      dataIndex: "operation",
      render: (record: any) =>
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

  // Handle add new address to the group
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

      if (response.status === "success") {
        const newData = {
          key: count,
          alias: "-",
          address: inputAddress || "-",
          from: "-",
          to: "-",
          purpose: "-",
          balance: response.totalValue || 0,
        };
        const updatedDataSource = [...dataSource, newData];
        setDataSource(updatedDataSource);
        setExpandedRows((prev) => [...prev, inputAddress]);
        setCount(count + 1);
        setInputAddress("");
      }
    } catch (error) {
      messageApi.error("Invalid wallet address");
      console.error("Invalid wallet address", error);
    }
  };

  // Fetch token balance when expanding row
  const handleExpand = async (expanded: boolean, record: any) => {
    // Fetch balance only when first expanded
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
          // Update the token list for the expanded address
          setAccountTokenList((prev) => ({
            ...prev,
            [record.address]: response.dataSource,
          }));

          // Update the row balance in the dataSource
          const updatedDataSource = dataSource.map((item) =>
            item.address === record.address
              ? { ...item, balance: response.totalValue || 0 }
              : item
          );
          setDataSource(updatedDataSource);

          // Expand the row
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
          items={[
            {
              key: "1",
              label: (
                <div className="flex justify-between items-center mx-2">
                  <div className="text-lg font-bold">{groupData.groupName}</div>
                  <a
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation(); // Prevent triggering the group toggle
                      deleteGroup(groupIndex);
                    }}
                  >
                    Delete
                  </a>
                </div>
              ),
              children: (
                <div className="pl-2">
                  <Row className="mb-1">
                    <Col span={4} className="font-bold text-lg">
                      Chain:
                    </Col>
                    <Col span={20} className="flex items-center">
                      Solana
                    </Col>
                  </Row>
                  <Row className="mb-1">
                    <Col span={4} className="font-bold text-lg">
                      Total Balance:
                    </Col>
                    <Col span={20} className="flex items-center">
                      ${totalBalance.toFixed(2)}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="font-bold text-lg">
                      Group Tags:
                    </Col>
                    <Col span={20}>
                      <InputTag
                        initialTags={tags}
                        onTagsChange={handleTagsChange}
                      />
                    </Col>
                  </Row>
                  <Table
                    className="mt-4"
                    bordered={false}
                    columns={columns}
                    pagination={false}
                    dataSource={dataSource}
                    components={editableComponents}
                    locale={{ emptyText: <Empty /> }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          columns={balanceColumns}
                          dataSource={addressTokenList[record.address] || []}
                          pagination={dataSource.length > 10 ? {} : false}
                        />
                      ),
                      onExpand: handleExpand,
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
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button
                      onClick={handleAdd}
                      className="custom-button w-36 mb-2"
                    >
                      Add Watch Address
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
