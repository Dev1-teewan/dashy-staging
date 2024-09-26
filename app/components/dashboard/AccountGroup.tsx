import { useEffect, useState } from "react";
import InputTag from "../features/InputTag";
import { PublicKey } from "@solana/web3.js";
import { useDroppable } from "@dnd-kit/core";
import { arraysEqual } from "@/app/utils/Utils";
import { fetchAssets } from "@/app/utils/HeliusRPC";
import EditableField from "../features/EditableField";
import useStyle from "../features/table/ScrollableRow";
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
} from "antd";
import { AnchorProvider, Wallet, web3 } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
const { SystemProgram, Transaction, LAMPORTS_PER_SOL } = web3;

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
}

const AccountGroup = ({
  groupData,
  groupIndex,
  updateGroup,
  deleteGroup,
}: AccountGroupProps) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;
  const { styles } = useStyle(); // Table scrollable style

  // Droppable ref for the empty group
  const { setNodeRef } = useDroppable({ id: groupIndex });

  // Toast msg & new address input state
  const [messageApi, contextHolder] = message.useMessage();
  const [inputAddress, setInputAddress] = useState<string>("");

  // State for group's data and tag / total balance
  const [localDataSource, setLocalDataSource] = useState<any[]>(
    groupData.accounts || []
  );
  const [localTags, setLocalTags] = useState<string[]>(groupData.tags || []);
  const [count, setCount] = useState<number>(localDataSource.length + 1);
  const [totalBalance, setTotalBalance] = useState(0);

  // Save state for expended rows and its token list
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [addressTokenList, setAccountTokenList] = useState<Record<string, []>>(
    {}
  );

  // Effect to update local state when params changes
  useEffect(() => {
    setLocalDataSource(groupData.accounts || []);
    setLocalTags(groupData.tags || []);
  }, [groupData.accounts, groupData.tags]);

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

  const sendToken = async (address: string) => {
    if (!wallet) {
      messageApi.error("Wallet not connected");
      return;
    }

    try {
      // Ensure the receiving account will be rent exempt
      const minimumBalance = await connection.getMinimumBalanceForRentExemption(
        0
      );
      if (0.01 * LAMPORTS_PER_SOL < minimumBalance) {
        throw new Error(`Account may not be rent exempt: ${address}`);
      }

      // Create an instruction to transfer native SOL from one wallet to another
      const transferSolInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey, // Sender's public key from wallet
        toPubkey: new PublicKey(address), // Receiver's public key
        lamports: 0.01 * LAMPORTS_PER_SOL, // Amount to send (0.01 SOL in lamports)
      });

      // Create a transaction and add the transfer instruction
      const tx = new Transaction().add(transferSolInstruction);

      // Fetch latest blockhash and add it to the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockhash; // Latest blockhash for the transaction

      // Create an Anchor provider to sign and send the transaction
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "finalized",
      });

      // Sign and send the transaction
      const signature = await provider.sendAndConfirm(tx);
      messageApi.success("Transaction successful");
      console.log("Transaction successful with signature:", signature);
    } catch (error: any) {
      // Log full details of the error including logs
      if (error instanceof web3.SendTransactionError && error.logs) {
        console.error("Transaction failed with logs:", error.logs);
      } else {
        console.error("Transaction failed:", error);
      }
      messageApi.error("Transaction failed");
    }
  };

  const columns = [
    ...accountGroupColumns.map((col: any) => {
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
    // {
    //   title: "Operation",
    //   width: "60px",
    //   dataIndex: "operation",
    //   render: (_: any, record: any) => (
    //     <div className="flex flex-col gap-2">
    //       <Popconfirm
    //         title="Sure to delete?"
    //         onConfirm={() => handleDelete(record.key)}
    //       >
    //         <Button className="text-[#06d6a0]">Delete</Button>
    //       </Popconfirm>

    //       <Button
    //         onClick={() => sendToken(record.address)}
    //         className="text-[#06d6a0]"
    //       >
    //         Send
    //       </Button>
    //       <Button
    //         onClick={() => sendToken(record.address)}
    //         className="text-[#06d6a0]"
    //       >
    //         Receive
    //       </Button>
    //     </div>
    //   ),
    // },
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
          const updatedDataSource = localDataSource.map((item) =>
            item.address === record.address
              ? { ...item, balance: response.totalValue || 0 }
              : item
          );
          setLocalDataSource(updatedDataSource);

          // Expand the row
          setExpandedRows((prev) => [...prev, record.address]);
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
    <Row>
      <Col span={24} className="!min-h-0">
        {contextHolder}
        <Collapse
          ghost
          collapsible="disabled"
          defaultActiveKey={["1"]}
          className="bg-[#141414] text-base"
          items={[
            {
              key: "1",
              showArrow: false,
              label: (
                <div
                  onClick={() => console.log("SR")}
                  className="flex justify-between items-center mx-2"
                >
                  <div className="text-white text-lg font-bold">
                    <EditableField
                      value={groupData.groupName}
                      onSave={handleGroupNameChange} // Handler to update group name
                      placeholder="Enter group name"
                    />
                  </div>
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
                          <Empty className="min-h-52 flex flex-col justify-center items-center" />
                        </div>
                      ),
                    }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          columns={balanceColumns}
                          dataSource={addressTokenList[record.address] || []}
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
