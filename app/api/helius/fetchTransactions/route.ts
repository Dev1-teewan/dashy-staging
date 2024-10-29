import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { mapResponseTxn } from "@/app/utils/HeliusRPC";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { status: "error", message: "Address required" },
      { status: 400 }
    );
  }

  try {
    let mappedResponse;

    new PublicKey(address); // Validate the address

    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => res.json());

    mappedResponse = mapResponseTxn(response, address);

    return NextResponse.json({
      status: "success",
      transactions: mappedResponse,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ status: "error", data: error }, { status: 500 });
  }
}
