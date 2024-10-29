import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { mapResponseAssets } from "@/app/utils/HeliusRPC";

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  if (!address) {
    return NextResponse.json(
      { status: "error", message: "Address required" },
      { status: 400 }
    );
  }

  try {
    let response;

    new PublicKey(address);

    response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "asset-id",
          method: "searchAssets",
          params: {
            ownerAddress: address,
            tokenType: "fungible",
            displayOptions: {
              showNativeBalance: true,
              showGrandTotal: true,
              showZeroBalance: false,
            },
          },
        }),
      }
    );

    const jsonResponse = await response.json();
    const mappedResponse = mapResponseAssets(jsonResponse);

    return NextResponse.json({
      status: "success",
      dataSource: mappedResponse.mappedData,
      totalValue: mappedResponse.totalValue,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ status: "error", data: error }, { status: 500 });
  }
}
