import Image from "next/image";
import React, { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { getLatestBlockhash } from "@/app/utils/HeliusRPC";
import { Button, Input, Modal, Select, Form, message } from "antd";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

interface SendTokenProps {
  rowAccount: string;
  connections: string[];
}

const SendToken: React.FC<SendTokenProps> = ({ rowAccount, connections }) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const walletPublicKey = publicKey?.toString(); // Get wallet public key as a string
  const shortenAddress = `${rowAccount.slice(0, 4)}...${rowAccount.slice(-4)}`;

  const [sendForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const sendSol = async (toAddress: string, amount: number) => {
    if (!publicKey) {
      message.error("Wallet not connected");
      return;
    }

    try {
      message.loading("Creating transaction..", 0);
      // Create a new transaction
      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          // Add a transfer instruction
          fromPubkey: publicKey, // Sender's public key
          toPubkey: new PublicKey(toAddress), // Receiver's public key
          lamports: amount * LAMPORTS_PER_SOL, // Amount in SOL
        })
      );

      let blockhash = (await getLatestBlockhash()).blockhash;
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send and sign the transaction using the wallet adapter's sendTransaction
      if (!signTransaction) {
        message.error("Wallet not connected or signTransaction not available");
        return;
      }
      const signedTransaction = await signTransaction(transaction);
      const signature = await sendAndConfirmRawTransaction(
        connection,
        signedTransaction.serialize(),
        {
          skipPreflight: true,
        }
      );

      message.destroy();
      console.log("Transaction successful with signature:", signature);
      message.success(`Transaction successful with signature: ${signature}`);
    } catch (error) {
      message.destroy();
      message.error("Transaction failed");
      console.error("Transaction failed:", error);
    }
  };

  const sendUSDC = async (toAddress: string, amount: number) => {
    if (!publicKey) {
      message.error("Wallet not connected");
      return;
    }

    try {
      message.loading("Creating transaction..", 0);
      const tokenMintAddress = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
      const tokenDecimals = 6; // Adjust according to the token's decimals
      const adjustedAmount = amount * Math.pow(10, tokenDecimals); // Convert to correct token amount

      // Get the associated token addresses for the sender and receiver
      const fromTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        publicKey
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        new PublicKey(toAddress)
      );

      // Create a new transaction
      const transaction = new Transaction();

      // Check if the receiving account exists; if not, create it
      const toTokenAccountInfo = await connection.getAccountInfo(
        toTokenAccount
      );
      if (toTokenAccountInfo === null) {
        const createToAccountIx = createAssociatedTokenAccountInstruction(
          publicKey, // Payer of the transaction
          toTokenAccount, // Associated token account to be created
          new PublicKey(toAddress), // Receiver's public key
          tokenMintAddress // The token mint
        );
        transaction.add(createToAccountIx);
      }

      // Create a transfer instruction for SPL tokens
      const transferTokenInstruction = createTransferInstruction(
        fromTokenAccount, // Sender's associated token account
        toTokenAccount, // Receiver's associated token account
        publicKey, // Owner of the sender's account
        adjustedAmount // Number of tokens to send
      );

      transaction.add(transferTokenInstruction);

      let blockhash = (await getLatestBlockhash()).blockhash;
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send and sign the transaction using the wallet adapter's sendTransaction
      if (!signTransaction) {
        message.error("Wallet not connected or signTransaction not available");
        return;
      }
      const signedTransaction = await signTransaction(transaction);
      const signature = await sendAndConfirmRawTransaction(
        connection,
        signedTransaction.serialize(),
        {
          skipPreflight: true,
        }
      );

      message.destroy();
      console.log("Transaction successful with signature:", signature);
      message.success(`Transaction successful with signature: ${signature}`);
    } catch (error) {
      message.destroy();
      message.error("Transaction failed");
      console.error("Transaction failed:", error);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      if (connections.length === 0) {
        message.error("Please add a recipient address first. (Connections)");
        return;
      }

      await sendForm.validateFields();
      setConfirmLoading(true);
      if (sendForm.getFieldValue("token") === "sol") {
        await sendSol(
          sendForm.getFieldValue("recipient"),
          sendForm.getFieldValue("amount")
        );
      } else if (sendForm.getFieldValue("token") === "usdc") {
        await sendUSDC(
          sendForm.getFieldValue("recipient"),
          sendForm.getFieldValue("amount")
        );
      }
      setConfirmLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      message.error("Please fill all required fields.");
    }
  };

  const handleCancel = () => {
    message.destroy();
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal} className="text-[#06d6a0]">
        Transfer
      </Button>
      <Modal
        centered
        width={600}
        onOk={handleOk}
        open={isModalOpen}
        onCancel={handleCancel}
        style={{ zIndex: 999 }}
        confirmLoading={confirmLoading}
        closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
        title={
          <span className="text-xl">
            Make a transaction from {shortenAddress}
          </span>
        }
      >
        <div className="text-[16px]">
          <Form form={sendForm} layout="vertical">
            <div className="flex flex-col gap-2">
              {walletPublicKey && rowAccount !== walletPublicKey && (
                <div className="text-sm text-red-800">
                  Note: You are not login to the account.
                </div>
              )}
              {connections.length === 0 && (
                <div className="text-sm text-red-800 mb-1">
                  Note: You need to add a recipient address first.
                </div>
              )}

              <Form.Item
                name="recipient"
                label="Sending to"
                rules={[{ required: true, message: "Recipient is required" }]}
              >
                <Select
                  placeholder="Select recipient"
                  disabled={connections.length === 0}
                  style={{ flex: 1, marginRight: 20 }}
                  options={connections.map((address) => ({
                    value: address,
                    label: address,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="token"
                label="Token"
                rules={[{ required: true, message: "Token is required" }]}
              >
                <Select
                  placeholder="Select Token"
                  disabled={connections.length === 0}
                  style={{ flex: 1, marginRight: 20 }}
                  options={[
                    {
                      value: "sol",
                      label: (
                        <div className="flex gap-3 text-md items-center">
                          <Image
                            src={
                              "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png"
                            }
                            alt="Token icon"
                            className="!w-[14px] !h-[14px] rounded-full"
                            width={14}
                            height={14}
                          />
                          SOL
                        </div>
                      ),
                    },
                    {
                      value: "usdc",
                      label: (
                        <div className="flex gap-3 text-md items-center">
                          <Image
                            src={
                              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                            }
                            alt="Token icon"
                            className="!w-[14px] !h-[14px] rounded-full"
                            width={14}
                            height={14}
                          />
                          USDC
                        </div>
                      ),
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  { required: true, message: "Amount is required" },
                  {
                    pattern: /^\d+(\.\d{1,9})?$/,
                    message: "Enter a valid amount",
                  },
                ]}
              >
                <Input
                  placeholder="Amount"
                  disabled={connections.length === 0}
                  className="!border-[#1f1f1f] rounded-md"
                  style={{ flex: 1, marginRight: 20 }}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default SendToken;
