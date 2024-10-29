import bs58 from "bs58";
import nacl from "tweetnacl";
import { useSession } from "next-auth/react";
import { Wallet } from "@project-serum/anchor";
import React, { useState, useEffect } from "react";
import { restoreColumns } from "../features/TableColumns";
import { useWallet } from "@solana/wallet-adapter-react";
import { CloseOutlined, DeleteFilled } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload } from "@fortawesome/free-solid-svg-icons";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  fetchCID,
  handleRemoveSetup,
  handleUploadSetup,
} from "@/app/utils/SmartContract";
import {
  ClusterType,
  latestVersion,
  updateToLatestVersion,
} from "@/app/utils/Versioning";
import {
  Button,
  Divider,
  Empty,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";

interface LoadStorageManagerSCProps {
  localSource: ClusterType;
  onDataImport: (data: ClusterType) => void;
  onClose: () => void;
}

interface CIDData {
  setup: {
    cid: string;
    version: string;
    timestamp: any;
  }[];
}

const LoadStorageManagerSC = ({
  localSource,
  onDataImport,
  onClose,
}: LoadStorageManagerSCProps) => {
  const [cid, setCid] = useState<any[]>([]);
  const [openRestore, setOpenRestore] = useState(false);

  const { publicKey } = useWallet();
  const { data: session } = useSession();
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;
  const [messageApi, contextHolder] = message.useMessage();
  const appPrivateKey = bs58.decode(process.env.NEXT_PUBLIC_DASHY_KEY!);

  const encryptAndUploadSetup = async () => {
    try {
      if (!publicKey || !session) {
        messageApi.error("Wallet is not connected to Dashy.");
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
      const sharedSecret = nacl.scalarMult(appPrivateKey, userSignKey);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const encrypted = nacl.secretbox(messageBytes, nonce, sharedSecret);
      const combinedData = new Uint8Array([...nonce, ...encrypted]);

      await uploadToIPFS(combinedData);
    } catch (error) {
      console.error("Error encrypting setup:", error);
      messageApi.destroy();
      messageApi.error("Error encrypting setup");
    }
  };

  const uploadToIPFS = async (data: any) => {
    try {
      const formData = new FormData();
      const blob = new Blob([data], { type: "application/octet-stream" });
      const file = new File([blob], "encrypted_data.bin", {
        type: "application/octet-stream",
      });
      formData.append("file", file);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload to IPFS");

      const { ipfsUrl } = await response.json();
      const CID = ipfsUrl.split("/").pop();
      uploadCID(CID);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      messageApi.destroy();
      messageApi.error("Error uploading to IPFS");
    }
  };

  const uploadCID = async (CID: string) => {
    messageApi.destroy();
    messageApi.open({
      type: "loading",
      content: "Transaction in progress...",
      duration: 0,
    });
    const response = await handleUploadSetup(
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
      messageApi.success("Local Storage backup successfully");
    } else {
      messageApi.error("Error backing up local storage");
    }
  };

  const deleteCID = async (cidToDelete: string) => {
    messageApi.open({
      type: "loading",
      content: "Deleting CID...",
      duration: 0,
    });
    const response = await handleRemoveSetup(connection, wallet, cidToDelete);
    messageApi.destroy();

    if (response.status === "success") {
      setCid((prev) => prev.filter((item) => item.cid !== cidToDelete));
      messageApi.success("CID deleted successfully");
    } else {
      messageApi.error("Error deleting CID");
    }
  };

  const decryptData = async (ipfs: string) => {
    try {
      if (!publicKey || !session)
        throw new Error("Wallet not connected to Dashy.");

      messageApi.loading("Fetching and decrypting data...");
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${ipfs}`
      );
      if (!response.ok) throw new Error("Failed to fetch data from IPFS");

      const arrayBuffer = await response.arrayBuffer();
      const encryptedDataFromIPFS = new Uint8Array(arrayBuffer);

      const userSignKey = session.wallet?.signature
        ? bs58.decode(session.wallet.signature).slice(0, 32)
        : null;
      if (!userSignKey) throw new Error("User signature is not available.");

      const nonce = encryptedDataFromIPFS.slice(0, nacl.secretbox.nonceLength);
      const encryptedMessage = encryptedDataFromIPFS.slice(
        nacl.secretbox.nonceLength
      );
      const sharedSecret = nacl.scalarMult(appPrivateKey, userSignKey);
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
        messageApi.success("Setup restored successfully");
        setOpenRestore(false);
        onClose();
      } else {
        messageApi.error("Failed to decrypt the message");
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
        <Space size="middle" className="items-center">
          <Tooltip title="Restore">
            <FontAwesomeIcon
              icon={faCloudUpload}
              aria-hidden="true"
              onClick={() => decryptData(record.cid)}
              className="cursor-pointer text-[20px] text-green-500 hover:text-green-600"
            />
          </Tooltip>
          <Tooltip title="Remove">
            <DeleteFilled
              className="text-[22px] text-red-500 hover:text-red-600 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                deleteCID(record.cid);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const getCID = async () => {
      try {
        if (!connection || !wallet) return;

        let response = await fetchCID(connection, wallet as Wallet);
        if (response.status === "success") {
          const dataWithKeys = (response.data as CIDData).setup.map(
            (item, index) => ({
              ...item,
              key: item.cid || index, // Use cid if available or fallback to index
              timestamp: item.timestamp.toNumber(),
            })
          );
          setCid(dataWithKeys);
        }
      } catch (error) {
        console.error("Error fetching CID:", error);
        setCid([]);
      }
    };

    getCID();
  }, [connection, wallet]);

  return (
    <>
      {contextHolder}
      <div className="text-[16px] font-semibold mb-2">Backup Setup</div>
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

      <Modal
        open={openRestore}
        footer={null}
        width={1080}
        title={<div className="text-2xl">Restore Setup</div>}
        onCancel={() => setOpenRestore(false)}
        closeIcon={<CloseOutlined className="!text-[#f1f1f1]" size={24} />}
      >
        <Table
          dataSource={cid}
          columns={columns}
          locale={{
            emptyText: (
              <Empty
                className="min-h-[219px] flex flex-col justify-center items-center"
                description={
                  <Typography.Text>
                    {!publicKey
                      ? "Please connect your wallet!"
                      : "You have no backup setup to restore."}
                  </Typography.Text>
                }
              />
            ),
          }}
        />
      </Modal>
    </>
  );
};

export default LoadStorageManagerSC;
