"use client";

import { CloseOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { restoreColumns } from "../features/TableColumns";
import { Button, Divider, message, Modal, Space, Table } from "antd";
import {
  ClusterType,
  latestVersion,
  updateToLatestVersion,
} from "@/app/utils/Versioning";

import bs58 from "bs58";
import nacl from "tweetnacl";
import { pinata } from "@/app/utils/config";
import { useSession } from "next-auth/react";
import { Wallet } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  fetchCID,
  handleRemoveCID,
  handleUploadCID,
} from "@/app/utils/SmartContract";


interface LoadStorageManagerProps {
  localSource: ClusterType;
  onDataImport: (data: ClusterType) => void;
}

interface CIDData {
  setup: {
    cid: string;
    version: string;
  }[];
}

const LoadStorageManagerBackup = ({
  localSource,
  onDataImport,
}: LoadStorageManagerProps) => {
  const [open, setOpen] = useState(false);
  const [cid, setCid] = useState<any[]>([]);
  const [openRestore, setOpenRestore] = useState(false);

  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;
  const [messageApi, contextHolder] = message.useMessage();
  const appPrivateKey = bs58.decode(process.env.NEXT_PUBLIC_DASHY_KEY!);

  const { data: session, status } = useSession();

  const encryptAndUploadSetup = async () => {
    try {
      if (!publicKey || !session) {
        throw new Error("Wallet is not connected to Dashy.");
      }
      messageApi.open({
        type: "loading",
        content: "Encrypting and Uploading to IPFS..",
        duration: 0,
      });
      const userSignKey = session.wallet?.signature
        ? bs58.decode(session.wallet.signature).slice(0, 32)
        : null;
      if (!userSignKey) {
        throw new Error("User signature is not available.");
      }

      const jsonMessage = JSON.stringify(localSource);
      const messageBytes = new TextEncoder().encode(jsonMessage);

      // Generate the shared secret using app's private key and user's public key
      const sharedSecret = nacl.scalarMult(appPrivateKey, userSignKey);

      // Nonce (must be random for each encryption)
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Encrypt the message
      const encrypted = nacl.secretbox(messageBytes, nonce, sharedSecret);

      // Combine nonce and encrypted data for storage
      const combinedData = new Uint8Array([...nonce, ...encrypted]);

      // Upload to IPFS
      await uploadToIPFS(combinedData);
    } catch (error) {
      console.error("Error encrypting setup:", error);
    }
  };

  const uploadToIPFS = async (data: any) => {
    try {
      const formData = new FormData();

      // Create a Blob from the Uint8Array
      const blob = new Blob([data], { type: "application/octet-stream" });

      // Create a file from the Blob
      const file = new File([blob], "encrypted_data.bin", {
        type: "application/octet-stream",
      });

      // Append the file to FormData
      formData.append("file", file);

      // Send the FormData to your server API endpoint that handles Pinata upload
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to upload to IPFS");
      }

      // Parse the JSON response to get the IPFS URL
      const { ipfsUrl } = await response.json();
      messageApi.destroy();

      const CID = ipfsUrl.split("/").pop();
      uploadCID(CID);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  const uploadCID = async (CID: string) => {
    messageApi.open({
      type: "loading",
      content: "Transaction in progress..",
      duration: 0,
    });

    let response = await handleUploadCID(
      connection,
      wallet,
      CID,
      latestVersion
    );

    messageApi.destroy();
    if (response.status === "success") {
      setCid((prev) => [
        ...prev,
        { key: CID, cid: CID, version: latestVersion },
      ]);
      messageApi.open({
        type: "success",
        content: "Local Storage backup successfully",
      });
    } else {
      console.log("Error backing up local storage:", response);
      messageApi.open({
        type: "error",
        content: "Error backing up local storage",
      });
    }
  };

  const removeCID = async (CID: string) => {
    messageApi.open({
      type: "loading",
      content: "Transaction in progress..",
      duration: 0,
    });

    let response = await handleRemoveCID(connection, wallet, CID);

    if (response.status === "success") {
      await pinata.unpin([CID]);
      setCid((prev) => prev.filter((cid) => cid.cid !== CID));
      messageApi.destroy();
      messageApi.open({
        type: "success",
        content: "Local Storage removed successfully",
      });
    } else {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Error removing up local storage",
      });
    }
  };

  const decryptData = async (ipfs: string) => {
    try {
      if (!publicKey || !session) {
        throw new Error("Wallet not connected to Dashy.");
      }

      messageApi.open({
        type: "loading",
        content: "Fetching and decrypting data..",
        duration: 0,
      });

      // Fetch the encrypted data from IPFS
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${ipfs}`
      );

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to fetch data from IPFS");
      }

      // Convert the response to ArrayBuffer, then to Uint8Array
      const arrayBuffer = await response.arrayBuffer();
      const encryptedDataFromIPFS = new Uint8Array(arrayBuffer);

      const userSignKey = session.wallet?.signature
        ? bs58.decode(session.wallet.signature).slice(0, 32)
        : null;
      if (!userSignKey) {
        throw new Error("User signature is not available.");
      }

      // Split the encrypted data into the nonce and the actual encrypted message
      const nonce = encryptedDataFromIPFS.slice(0, nacl.secretbox.nonceLength);
      const encryptedMessage = encryptedDataFromIPFS.slice(
        nacl.secretbox.nonceLength
      );

      // Generate the shared secret again using app's private key and user's public key
      const sharedSecret = nacl.scalarMult(appPrivateKey, userSignKey);

      // Decrypt the message
      const decrypted = nacl.secretbox.open(
        encryptedMessage,
        nonce,
        sharedSecret
      );

      messageApi.destroy();
      if (decrypted) {
        const decryptedText = new TextDecoder().decode(decrypted);

        const parsedContent = JSON.parse(decryptedText);
        const updatedContent = updateToLatestVersion(parsedContent);
        onDataImport(updatedContent);

        setOpen(false);
        setOpenRestore(false);
        messageApi.open({
          type: "success",
          content: "Setup restore successfully",
        });
      } else {
        setOpen(false);
        setOpenRestore(false);
        messageApi.open({
          type: "error",
          content: "Failed to decrypt the message",
        });
      }
    } catch (error) {
      console.error("Error decrypting data:", error);
    }
  };

  const columns = [
    ...restoreColumns,
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => decryptData(record.cid)}>Restore</a>
          <a onClick={() => removeCID(record.cid)}>Delete</a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const getCID = async () => {
      if (!connection || !wallet) return;

      let response = await fetchCID(connection, wallet as Wallet);
      if (response.status === "success") {
        const dataWithKeys = (response.data as CIDData).setup.map(
          (item, index) => ({
            ...item,
            key: item.cid || index, // Use cid if available or fallback to index
          })
        );
        setCid(dataWithKeys);
      }
    };

    getCID();
  }, [connection, wallet]);

  return (
    <div>
      {contextHolder}
      <Button className="custom-button !h-[40px]" onClick={() => setOpen(true)}>
        Backing up or restore encrypted setup through Smart Contract & IPFS
      </Button>

      <Modal
        centered
        open={open}
        footer={null}
        title="Backup Setup"
        onCancel={() => setOpen(false)}
        closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
      >
        <div className="text-sm text-gray-500 pb-2">
          Note: Backup local storage will require you to authorize Dashy to
          encrypt and upload your data to IPFS.
        </div>
        <Button onClick={encryptAndUploadSetup} className="w-full py-3">
          Backup Local Storage
        </Button>
        <Divider style={{ borderColor: "#003628" }} />

        <div className="text-[16px] font-semibold mb-2">Restore Setup</div>
        <div className="text-sm text-gray-500 pb-2">
          Note: Restoring local storage will overwrite your current data.
        </div>

        <Button onClick={() => setOpenRestore(true)} className="w-full py-3">
          Restore Local Storage
        </Button>
      </Modal>

      <Modal
        centered
        open={openRestore}
        footer={null}
        width={1080}
        title="Restore Setup"
        onCancel={() => setOpenRestore(false)}
        closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
      >
        <Table dataSource={cid} columns={columns} />
      </Modal>
    </div>
  );
};

export default LoadStorageManagerBackup;
