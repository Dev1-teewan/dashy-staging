import SendToken from "./SendToken";
import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { useDroppable } from "@dnd-kit/core";
import EditableField from "../features/EditableField";
import useStyle from "../features/table/ScrollableRow";
import { ClusterDataType } from "../../utils/Versioning";
import { arraysEqual, formatAmount } from "@/app/utils/Utils";
import { combinedComponents } from "../features/table/CustomizeRow";
import { accountGroupColumns, balanceColumns } from "../features/TableColumns";
import {
  DeleteFilled,
  DownCircleOutlined,
  DownOutlined,
  RightCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Collapse,
  Empty,
  Input,
  message,
  Row,
  Space,
  Table,
  Popconfirm,
} from "antd";

interface AccountGroupProps {
  clusterData: ClusterDataType;
  clusterIndex: string;
  updateCluster: (index: string, data: any) => void;
  deleteCluster: (index: string) => void;
  displayFull: boolean;
}

const AccountGroup = ({
  clusterData,
  clusterIndex,
  updateCluster,
  deleteCluster,
  displayFull,
}: AccountGroupProps) => {
  // Table scrollable style
  const { styles } = useStyle();
  // DND Droppable ref for the empty cluster
  const { setNodeRef } = useDroppable({ id: clusterIndex });

  // State for toast msg & new address input
  const [messageApi, contextHolder] = message.useMessage();
  const [inputAddress, setInputAddress] = useState<string>("");

  // State for cluster's data and tag / total balance
  const [expanded, setExpanded] = useState<boolean>(displayFull);
  const [localDataSource, setLocalDataSource] = useState<any[]>(
    clusterData.accounts || []
  );
  const [localTags, setLocalTags] = useState<string[]>(clusterData.tags || []);
  const [count, setCount] = useState<number>(localDataSource.length + 1);
  const [totalBalance, setTotalBalance] = useState(0);

  // Save state for expanded rows and its token list
  // const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [accountTokenList, setAccountTokenList] = useState<Record<string, []>>(
    {}
  );

  // Effect to update local state when params changes
  useEffect(() => {
    setLocalDataSource(clusterData.accounts || []);
    setLocalTags(clusterData.tags || []);
  }, [clusterData.accounts, clusterData.tags]);

  // Effect to update expanded state when displayFull changes
  useEffect(() => {
    setExpanded(displayFull);
  }, [displayFull]);

  // Effect to update parent when localDataSource or localTags change
  useEffect(() => {
    const total = localDataSource.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0
    );

    if (
      total !== totalBalance ||
      !arraysEqual(localDataSource, clusterData.accounts) ||
      !arraysEqual(localTags, clusterData.tags)
    ) {
      // Notify the parent with updated data
      updateCluster(clusterIndex, {
        ...clusterData,
        accounts: localDataSource,
        tags: localTags,
        totalBalance: total,
      });
      setTotalBalance(total); // Update local state for total balance
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDataSource, localTags, totalBalance]);

  const handleTagsChange = (newTags: string[]) => {
    if (
      newTags.length !== localTags.length ||
      !newTags.every((tag, index) => tag === localTags[index])
    ) {
      setLocalTags(newTags);
    }
  };

  // Functions on Table editable cells (Save & Delete row)
  const handleSave = (row: any) => {
    const newData = [...localDataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      newData.splice(index, 1, { ...newData[index], ...row });
      setLocalDataSource(newData);
    }
  };

  const handleDelete = (key: string) => {
    const newData = localDataSource.filter((item) => item.key !== key);
    setLocalDataSource(newData);
  };

  const columns = [
    ...accountGroupColumns
      .filter((col: any) => {
        // Remove "Connections" column if displayFull is false
        if (!expanded && col.key === "connections") {
          return false;
        }
        return true;
      })
      .map((col: any) => {
        // Set default widths for columns when expanded is false
        if (!expanded) {
          if (col.key === "alias") col.width = "25%";
          if (col.key === "address") col.width = "25%";
          if (col.key === "purpose") col.width = "25%";
          if (col.key === "balance") col.width = "20%";
        }

        if (!col.editable) return col;
        return {
          ...col,
          onCell: (record: any) => ({
            record,
            editable: col.editable,
            type: col.type,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        };
      }),
    expanded
      ? {
          title: "Operation",
          width: "120px",
          dataIndex: "operation",
          render: (_: any, record: any) => (
            <div className="flex flex-col gap-2">
              <SendToken
                rowAccount={record.address}
                connections={
                  localDataSource.find(
                    (item) => item.address === record.address
                  )["connections"]
                }
              />

              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => handleDelete(record.key)}
              >
                <Button className="text-[#06d6a0]">Delete</Button>
              </Popconfirm>
            </div>
          ),
        }
      : null,
  ].filter(Boolean);

  // Handle add new address to the cluster
  const handleAdd = async () => {
    try {
      new PublicKey(inputAddress);
      messageApi.open({
        type: "loading",
        content: "Fetching balance..",
        duration: 0,
      });

      const response = await fetch("/api/helius/searchAssets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputAddress }),
      });
      const result = await response.json();

      messageApi.destroy();

      if (result.status === "success") {
        const newData = {
          key: `${Date.now()}`,
          alias: "",
          address: inputAddress || "",
          connections: [],
          purpose: "",
          balance: result.totalValue || 0,
        };
        const updatedDataSource = [...localDataSource, newData];

        setLocalDataSource(updatedDataSource);
        setAccountTokenList((prev) => ({
          ...prev,
          [inputAddress]: result.dataSource,
        }));
        // setExpandedRows((prev) => [...prev, inputAddress]);
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
    // Fetch balance only when first expanded (disable -> !expandedRows.includes(record.address))
    if (expanded) {
      try {
        messageApi.open({
          type: "loading",
          content: "Fetching balance..",
          duration: 0,
        });

        const response = await fetch("/api/helius/searchAssets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: record.address }),
        });
        const result = await response.json(); // Parse the JSON response

        messageApi.destroy();

        if (result.status === "success") {
          // Update the token list for the expanded address
          setAccountTokenList((prev) => ({
            ...prev,
            [record.address]: result.dataSource,
          }));

          // Update the row balance in the dataSource
          const updatedDataSource = localDataSource.map((item) =>
            item.address === record.address
              ? { ...item, balance: result.totalValue || 0 }
              : item
          );
          setLocalDataSource(updatedDataSource);

          // Expand the row
          // setExpandedRows((prev) => [...prev, record.address]);
        }
      } catch (error) {
        messageApi.error("Failed to fetch balance");
        console.error("Error fetching balance", error);
      }
    }
  };

  const handleClusterNameChange = (newName: string) => {
    updateCluster(clusterIndex, { ...clusterData, clusterName: newName });
  };

  return (
    <div className={expanded ? "col-span-2" : ""}>
      {contextHolder}
      <Row>
        <Col span={24} className="!min-h-0">
          <div className="bg-[#141414] text-base dashboard-collapse p-4 rounded-xl">
            {/* Section: Cluster Header */}
            <div className="flex justify-between items-center m-2">
              <div className="flex gap-4 text-xl font-bold">
                {expanded ? (
                  <DownOutlined onClick={() => setExpanded(false)} />
                ) : (
                  <RightOutlined onClick={() => setExpanded(true)} />
                )}
                <EditableField
                  messageApi={messageApi}
                  value={clusterData.clusterName}
                  onSave={handleClusterNameChange}
                />
              </div>
              <DeleteFilled
                className="text-[24px] text-red-500 hover:text-red-600 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteCluster(clusterIndex);
                }}
              />
            </div>

            <div className="pl-2">
              <Row className="mb-1">
                <Col flex="170px" className="font-semibold text-lg">
                  Chain:
                </Col>
                <Col flex="auto" className="flex items-center">
                  Solana
                </Col>
              </Row>
              <Row className="mb-1">
                <Col flex="170px" className="font-semibold text-lg">
                  Cluster Balance:
                </Col>
                <Col flex="auto" className="flex items-center">
                  ${formatAmount(totalBalance)}
                </Col>
              </Row>
              <Row>
                <Col flex="170px" className="font-semibold text-lg">
                  Cluster Tags:
                </Col>
                <Col flex="auto">
                  <InputTag
                    initialTags={localTags}
                    onTagsChange={handleTagsChange}
                  />
                </Col>
              </Row>

              <Table
                bordered={false}
                scroll={{ y: 63 * 4 }}
                columns={columns}
                pagination={false}
                dataSource={localDataSource}
                components={combinedComponents}
                className={`mt-4 ${styles.customTable}`}
                locale={{
                  emptyText: (
                    <div ref={setNodeRef}>
                      <Empty className="min-h-[219px] flex flex-col justify-center items-center" />
                    </div>
                  ),
                }}
                expandable={{
                  onExpand: handleExpand,
                  expandIcon: ({ expanded, onExpand, record }) =>
                    expanded ? (
                      <DownCircleOutlined
                        onClick={(e) => onExpand(record, e)}
                        style={{ color: "#06d6a0" }}
                      />
                    ) : (
                      <RightCircleOutlined
                        onClick={(e) => onExpand(record, e)}
                        style={{ color: "#06d6a0" }}
                      />
                    ),
                  expandedRowRender: (record) => (
                    <Table
                      pagination={false}
                      scroll={{ y: 180 }}
                      columns={balanceColumns}
                      className={`expanded-table ${styles.customTable}`}
                      dataSource={accountTokenList[record.address] || []}
                    />
                  ),
                }}
              />

              {/* Section: Add new address */}
              <Space className="mt-2 flex items-stretch">
                <Input
                  value={inputAddress}
                  placeholder="Enter watch address"
                  onChange={(e) => setInputAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <Button onClick={handleAdd} className="custom-button w-36 mb-2">
                  +
                </Button>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AccountGroup;
