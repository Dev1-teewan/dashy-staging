import idl from "@/smart-contract/target/idl/smart_contract.json";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  AnchorProvider,
  Idl,
  Program,
  Wallet,
  BN,
} from "@project-serum/anchor";

const programID = new PublicKey(idl.metadata.address);

const getProvider = (connection: Connection, wallet: Wallet) => {
  if (!wallet) {
    throw new Error("Wallet is not connected");
  }
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return provider;
};

export const fetchCID = async (connection: Connection, wallet: Wallet) => {
  try {
    const anchorProvider = getProvider(connection, wallet);
    const program = new Program(idl as Idl, programID, anchorProvider);

    const setupSeeds = [
      Buffer.from("setup"),
      anchorProvider.wallet.publicKey.toBuffer(),
    ];

    const [setupAccount] = await PublicKey.findProgramAddress(
      setupSeeds,
      program.programId
    );

    const cidData = await program.account.setupAccount.fetch(setupAccount);

    return { status: "success", data: cidData };
  } catch (error) {
    console.error("Error reading user's setup CID:", error);
    return { status: "error", data: error };
  }
};

export const handleUploadSetup = async (
  connection: Connection,
  wallet: Wallet,
  cid: String,
  version: String
) => {
  try {
    const anchorProvider = getProvider(connection, wallet);
    const program = new Program(idl as Idl, programID, anchorProvider);

    const setupSeeds = [
      Buffer.from("setup"),
      anchorProvider.wallet.publicKey.toBuffer(),
    ];

    const [setupAccount] = await PublicKey.findProgramAddress(
      setupSeeds,
      program.programId
    );

    // Get the current timestamp in seconds as an i64
    const timestamp = new BN(Math.floor(Date.now() / 1000));

    await program.methods
      .uploadSetup(cid, version, timestamp)
      .accounts({
        setupAccount: setupAccount,
        signer: anchorProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();

    return { status: "success", data: setupAccount };
  } catch (error) {
    return { status: "error", data: error };
  }
};

export const handleRemoveSetup = async (
  connection: Connection,
  wallet: Wallet,
  cid: String
) => {
  try {
    const anchorProvider = getProvider(connection, wallet);
    const program = new Program(idl as Idl, programID, anchorProvider);

    const setupSeeds = [
      Buffer.from("setup"),
      anchorProvider.wallet.publicKey.toBuffer(),
    ];

    const [setupAccount] = await PublicKey.findProgramAddress(
      setupSeeds,
      program.programId
    );

    await program.methods
      .removeSetup(cid)
      .accounts({
        setupAccount: setupAccount,
        signer: anchorProvider.wallet.publicKey,
      })
      .signers([])
      .rpc();

    return { status: "success", data: setupAccount };
  } catch (error) {
    return { status: "error", data: error };
  }
};
