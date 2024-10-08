import SendToken from "./SendToken";
import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { useDroppable } from "@dnd-kit/core";
import { arraysEqual } from "@/app/utils/Utils";
import { fetchAssets } from "@/app/utils/HeliusRPC";
import EditableField from "../features/EditableField";
import useStyle from "../features/table/ScrollableRow";
import {
  DeleteFilled,
  DownCircleOutlined,
  DownOutlined,
  RightCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { combinedComponents } from "../features/table/CustomizeRow";
import { accountGroupColumns, balanceColumns } from "../features/TableColumns";
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

interface GroupData {
  groupName: string;
  accounts: any[];
  tags: string[];
  totalBalance: number;
}

interface AccountGroupProps {
  groupData: GroupData;
  groupIndex: string;
  updateGroup: (index: string, data: any) => void;
  deleteGroup: (index: string) => void;
  displayFull: boolean;
}

const AccountGroup = ({
  groupData,
  groupIndex,
  updateGroup,
  deleteGroup,
  displayFull,
}: AccountGroupProps) => {
  const { styles } = useStyle(); // Table scrollable style

  // Droppable ref for the empty group
  const { setNodeRef } = useDroppable({ id: groupIndex });

  // Toast msg & new address input state
  const [messageApi, contextHolder] = message.useMessage();
  const [inputAddress, setInputAddress] = useState<string>("");

  // State for group's data and tag / total balance
  const [expanded, setExpanded] = useState<boolean>(displayFull);
  const [localDataSource, setLocalDataSource] = useState<any[]>(
    groupData.accounts || []
  );
  const [localTags, setLocalTags] = useState<string[]>(groupData.tags || []);
  const [count, setCount] = useState<number>(localDataSource.length + 1);
  const [totalBalance, setTotalBalance] = useState(0);

  // Save state for expanded rows and its token list
  // const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [addressTokenList, setAccountTokenList] = useState<Record<string, []>>(
    {}
  );

  // Effect to update local state when params changes
  useEffect(() => {
    setLocalDataSource(groupData.accounts || []);
    setLocalTags(groupData.tags || []);
  }, [groupData.accounts, groupData.tags]);
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
      !arraysEqual(localDataSource, groupData.accounts) ||
      !arraysEqual(localTags, groupData.tags)
    ) {
      // Notify the parent with updated data
      updateGroup(groupIndex, {
        ...groupData,
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
        // Remove "From" and "To" columns if displayFull is false
        if (!expanded && (col.key === "from" || col.key === "to")) {
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
                fromAddress={
                  localDataSource.find(
                    (item) => item.address === record.address
                  )["from"]
                }
                toAddress={
                  localDataSource.find(
                    (item) => item.address === record.address
                  )["to"]
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
          key: `${Date.now()}`,
          alias: "",
          address: inputAddress || "",
          from: [],
          to: [],
          purpose: "",
          balance: response.totalValue || 0,
        };
        const updatedDataSource = [...localDataSource, newData];

        setLocalDataSource(updatedDataSource);
        setAccountTokenList((prev) => ({
          ...prev,
          [inputAddress]: response.dataSource,
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
        const response = await fetchAssets(record.address);
        messageApi.destroy();

        if (response.status === "success") {
          // Update the token list for the expanded address
          setAccountTokenList((prev) => ({
            ...prev,
            [record.address]: response.dataSource,
          }));

          // Update the row balance in the dataSource
          const updatedDataSource = localDataSource.map((item) =>
            item.address === record.address
              ? { ...item, balance: response.totalValue || 0 }
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

  const handleGroupNameChange = (newName: string) => {
    updateGroup(groupIndex, { ...groupData, groupName: newName });
  };

  return (
    <div className={expanded ? "col-span-2" : ""}>
      <Row>
        <Col span={24} className="!min-h-0">
          {contextHolder}
          <Collapse
            ghost
            defaultActiveKey={["1"]}
            className="bg-[#141414] text-base dashboard-collapse"
            items={[
              {
                key: "1",
                showArrow: false,
                label: <></>,
                children: (
                  <>
                    <div className="flex justify-between items-center m-2 gap-2">
                      <div className="flex gap-4 text-white text-xl font-bold">
                        {expanded ? (
                          <DownOutlined
                            onClick={() => setExpanded((prev) => !prev)}
                          />
                        ) : (
                          <RightOutlined
                            onClick={() => setExpanded((prev) => !prev)}
                          />
                        )}
                        <EditableField
                          value={groupData.groupName}
                          onSave={handleGroupNameChange} // Handler to update group name
                          placeholder="Enter group name"
                        />
                      </div>
                      <div className="flex flex-row gap-4 items-center">
                        {/* {expanded ? (
                          <div onClick={() => setExpanded((prev) => !prev)}>
                            <Button className="custom-button">Collapse</Button>
                          </div>
                        ) : (
                          <div onClick={() => setExpanded((prev) => !prev)}>
                            <Button className="custom-button">Expand</Button>
                          </div>
                        )} */}
                        <a
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation(); // Prevent triggering the group toggle
                            deleteGroup(groupIndex);
                          }}
                        >
                          <DeleteFilled style={{ fontSize: "24px" }} />
                        </a>
                      </div>
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
                          ${totalBalance.toFixed(2)}
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
                        rowKey="key"
                        scroll={{ y: 63 * 4 }}
                        bordered={false}
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
                              className="expanded-table"
                              columns={balanceColumns}
                              dataSource={
                                addressTokenList[record.address] || []
                              }
                            />
                          ),
                        }}
                      />

                      <Space
                        className="mt-2"
                        style={{ display: "flex", alignItems: "stretch" }}
                      >
                        <Input
                          value={inputAddress}
                          placeholder="Enter watch address"
                          onChange={(e) => setInputAddress(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <Button
                          onClick={handleAdd}
                          className="custom-button w-36 mb-2"
                        >
                          +
                        </Button>
                      </Space>
                    </div>
                  </>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AccountGroup;
