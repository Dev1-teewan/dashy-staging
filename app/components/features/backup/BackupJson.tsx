"use client";

import nacl from "tweetnacl";
import { Button } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const BackupJson = () => {
  const { publicKey } = useWallet();
  const [encryptedData, setEncryptedData] = useState<Uint8Array | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  // Random private key for the app (keep it secure in practice)
  const appPrivateKey = useMemo(() => nacl.randomBytes(32), []);

  const encryptData = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not connected.");
      }

      const userPublicKey = publicKey.toBytes(); // Get the public key as bytes
      console.log(userPublicKey);
      const jsonMessage = JSON.stringify(localStorage.getItem("dashy"));
      const messageBytes = new TextEncoder().encode(jsonMessage);

      // Generate the shared secret using app's private key and user's public key
      const sharedSecret = nacl.scalarMult(appPrivateKey, userPublicKey);

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

  const uploadToIPFS = async (data: Uint8Array) => {
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
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  const decryptData = async () => {
    try {
      if (!ipfsUrl || !publicKey) {
        throw new Error("No IPFS URL or wallet not connected.");
      }

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

      const userPublicKey = publicKey.toBytes(); // Get the public key as bytes

      // Split the encrypted data into the nonce and the actual encrypted message
      const nonce = encryptedDataFromIPFS.slice(0, nacl.secretbox.nonceLength);
      const encryptedMessage = encryptedDataFromIPFS.slice(
        nacl.secretbox.nonceLength
      );

      // Generate the shared secret again using app's private key and user's public key
      const sharedSecret = nacl.scalarMult(appPrivateKey, userPublicKey);

      // Decrypt the message
      const decrypted = nacl.secretbox.open(
        encryptedMessage,
        nonce,
        sharedSecret
      );

      if (decrypted) {
        const decryptedText = new TextDecoder().decode(decrypted);
        setDecryptedMessage(decryptedText);
        console.log("Decrypted message:", decryptedText);
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
  return (
    <div>
      {publicKey ? (
        <div>
          <Button onClick={encryptData}>Encrypt and Upload to IPFS</Button>
          <Button onClick={decryptData} disabled={!encryptedData}>
            Decrypt Data
          </Button>
          {/* {decryptedMessage && <p>Decrypted Message: {decryptedMessage}</p>} */}
          {/* {ipfsUrl && (
            <p>
              IPFS URL: <a href={ipfsUrl}>{ipfsUrl}</a>
            </p>
          )} */}
        </div>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
};

export default BackupJson;
