"use client";

import bs58 from "bs58";
import SolanaApp from "@ledgerhq/hw-app-solana";
import React, { useEffect, useState, useRef } from "react";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";

// Function to connect to Ledger
async function connectLedger(): Promise<SolanaApp> {
  const transport = await TransportWebHID.create();
  const solanaApp = new SolanaApp(transport);

  const version = await solanaApp.getAppConfiguration();
  console.log("Ledger Solana App Version:", version);

  return solanaApp;
}

// Function to get public key from Ledger and convert to Base58 string
async function getPublicKey(
  solanaApp: SolanaApp,
  index: number
): Promise<string> {
  const path = `44'/501'/${index}'`; // Adjust path if necessary
  try {
    const publicKeyResponse = await solanaApp.getAddress(path);
    // Convert Uint8Array to Base58 string
    const publicKeyString = bs58.encode(publicKeyResponse.address);
    console.log(`Public Key ${index}:`, publicKeyString);
    return publicKeyString;
  } catch (error) {
    // If there's an error (like an invalid index), throw an error to break the loop
    throw new Error(`Failed to get public key for index ${index}`);
  }
}

const LedgerComponent: React.FC = () => {
  const [publicKeys, setPublicKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Ref to track if the Ledger is already connected
  const isLedgerConnected = useRef<boolean>(false);

  useEffect(() => {
    const initializeLedger = async () => {
      if (isLedgerConnected.current) return; // Prevent multiple connections

      setIsConnecting(true);
      try {
        // Connect to Ledger
        const solanaApp = await connectLedger();
        isLedgerConnected.current = true;

        // Retrieve public keys for accounts until an error occurs
        let index = 0;
        const keys: string[] = [];
        while (true) {
          try {
            const key = await getPublicKey(solanaApp, index);
            keys.push(key);
            index++;
          } catch (err) {
            // Break the loop when an error occurs (no more accounts)
            break;
          }
        }
        setPublicKeys(keys);
      } catch (err) {
        console.error("Error connecting to Ledger:", err);
        setError("Failed to connect to Ledger");
      } finally {
        setIsConnecting(false);
      }
    };

    initializeLedger();
  }, []); // Empty dependency array ensures it runs once on component mount

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          <h2>Ledger Public Keys:</h2>
          {isConnecting ? (
            <p>Connecting to Ledger...</p>
          ) : publicKeys.length > 0 ? (
            publicKeys.map((key, index) => <p key={index}>{key}</p>)
          ) : (
            <p>No public keys found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LedgerComponent;
