import idl from "../assets/idl.json";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Idl, Program, Wallet } from "@project-serum/anchor";

const programID = new PublicKey("EXw23UNSmLC3abGuUQNvZYv5t93HLGBRpjXEywPWnFBp");

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

export const handleUploadCID = async (
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

    await program.methods
      .uploadCid(cid, version)
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

export const handleRemoveCID = async (
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
      .removeCid(cid)
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
