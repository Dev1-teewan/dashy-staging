import { NextRequest, NextResponse } from "next/server";

// Function to fetch the latest blockhash
export async function POST(req: NextRequest) {
  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "getLatestBlockhash",
          params: [
            {
              commitment: "processed",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data && data.result) {
      return NextResponse.json({
        status: "success",
        blockhash: data.result.value.blockhash,
        lastValidBlockHeight: data.result.value.lastValidBlockHeight,
      });
    } else {
      throw new Error("No blockhash found in the response");
    }
  } catch (error) {
    console.error("Error fetching latest blockhash:", error);
    return NextResponse.json({ status: "error", data: error }, { status: 500 });
  }
}
