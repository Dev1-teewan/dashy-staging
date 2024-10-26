"use client";

import bs58 from "bs58";
import nacl from "tweetnacl";
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Wallet } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchCID, handleUploadCID } from "@/app/utils/SmartContract";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

const BackupJson = () => {
  const { publicKey } = useWallet();
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [encryptedData, setEncryptedData] = useState<any>(null);

  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;
  const [messageApi, contextHolder] = message.useMessage();

  const appPrivateKey = bs58.decode(process.env.NEXT_PUBLIC_DASHY_KEY!);

  const { data: session, status } = useSession();

  const encryptData = async () => {
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
        throw new Error("User public key is not available.");
      }

      const jsonMessage = JSON.stringify(localStorage.getItem("dashy"));
      const messageBytes = new TextEncoder().encode(jsonMessage);

      // Generate the shared secret using app's private key and user's public key
      const sharedSecret = nacl.scalarMult(appPrivateKey, userSignKey);

      // Nonce (must be random for each encryption)
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Encrypt the message
      const encrypted = nacl.secretbox(messageBytes, nonce, sharedSecret);

      // Combine nonce and encrypted data for storage
      const combinedData = new Uint8Array([...nonce, ...encrypted]);
      setEncryptedData(combinedData);

      // Upload to IPFS
      await uploadToIPFS(combinedData);
    } catch (error) {
      console.error("Error encrypting data:", error);
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
      console.log(response);
      setIpfsUrl(ipfsUrl);
      console.log("Uploaded to IPFS:", ipfsUrl);
      messageApi.destroy();

      uploadCID(ipfsUrl);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  const uploadCID = async (ipfsUrl: string) => {
    messageApi.open({
      type: "loading",
      content: "Transaction in progress..",
      duration: 0,
    });

    let response = await handleUploadCID(connection, wallet, ipfsUrl, "v1.0.1");

    messageApi.destroy();
    if (response.status === "success") {
      messageApi.open({
        type: "success",
        content: "User profile created successfully",
      });
    } else {
      console.log("Error creating user profile:", response);
      messageApi.open({
        type: "error",
        content: "Error creating user profile",
      });
    }
  };

  const decryptData = async () => {
    try {
      if (!ipfsUrl || !publicKey || !session) {
        throw new Error("No IPFS URL or wallet not connected to Dashy.");
      }

      messageApi.open({
        type: "loading",
        content: "Fetching and decrypting data..",
        duration: 0,
      });

      // Fetch the encrypted data from IPFS
      const response = await fetch(ipfsUrl);

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to fetch data from IPFS");
      }

      // Convert the response to ArrayBuffer, then to Uint8Array
      const arrayBuffer = await response.arrayBuffer();
      const encryptedDataFromIPFS = new Uint8Array(arrayBuffer);
      console.log(arrayBuffer, encryptedDataFromIPFS);

      const userSignKey = session.wallet?.signature
        ? bs58.decode(session.wallet.signature).slice(0, 32)
        : null;
      if (!userSignKey) {
        throw new Error("User public key is not available.");
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

      if (decrypted) {
        const decryptedText = new TextDecoder().decode(decrypted);
        console.log("Decrypted message:", decryptedText);

        localStorage.setItem("dashy", JSON.parse(decryptedText));
        // location.reload();
        messageApi.destroy();
        messageApi.open({
          type: "success",
          content: "Setup restore successfully",
        });
      } else {
        console.error("Failed to decrypt the message.");
      }
    } catch (error) {
      console.error("Error decrypting data:", error);
    }
  };

  useEffect(() => {
    if (encryptedData) {
      console.log("Encrypted data available for decryption.");
    }
  }, [encryptedData]);

  useEffect(() => {
    const getCID = async () => {
      if (!connection || !wallet) return;

      let response = await fetchCID(connection, wallet as Wallet);
      if (response.status === "success") {
        console.log("CID data:", response.data);
      }
    };

    // getCID();
  }, [connection, wallet]);

  return (
    <div>
      {contextHolder}
      {publicKey && (
        <>
          <Button onClick={encryptData}>Encrypt and Upload to IPFS</Button>
          <Button onClick={decryptData} disabled={!encryptedData}>
            Decrypt Data
          </Button>
        </>
      )}
    </div>
  );
};

export default BackupJson;
