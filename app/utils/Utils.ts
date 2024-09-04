import { PublicKey } from "@solana/web3.js";
import { sampleData } from "../pages/SampleData";
import { sampleData2 } from "../pages/SampleData2";

export const fetchAssets = async (address: string) => {
  try {
    let response;
    if (address !== "") {
      let publicKey = new PublicKey(address);
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
              ownerAddress: address, // 4CEWqVTmpDxML9s5nEin8c9cDv6rDEiYMp2trcmDuEpZ, FCHTRYx6npkQCogtpZtEFLJeevAFGbDHhJyvqvT6F4kX
              tokenType: "fungible",
              displayOptions: {
                showNativeBalance: true,
                showGrandTotal: true,
              },
            },
          }),
        }
      ).then((response) => response.json());
    } else {
      response = sampleData;
    }
    let mappedResponse = mapResponseAssets(response);
    return {
      status: "success",
      dataSource: mappedResponse.mappedData,
      totalValue: mappedResponse.totalValue,
    };
  } catch (error) {
    console.log("Error fetching assets", error);
    return { status: "error", data: error };
  }
};

const mapResponseAssets = (data: any) => {
  // Map the data to the required DataType
  let mappedData = data.result.items
    .filter((item: any) => item.token_info?.price_info?.total_price > 0.9)
    .map((item: any, index: number) => ({
      key: index.toString(),
      asset: {
        icon: item.content?.links?.image || item.content?.files[0]?.uri || "",
        name:
          item.token_info.symbol || item.content.metadata?.name || "Unknown",
        link: `https://explorer.solana.com/address/${item.id}?cluster=mainnet`,
      },
      amount: (
        item.token_info?.balance / Math.pow(10, item.token_info?.decimals)
      )
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      price: {
        value: `$${item.token_info?.price_info?.price_per_token || 0}`,
        change: "N/A", // Need another Coincegko API
        color: "rgb(9, 155, 103)",
      },
      value: `$${(item.token_info?.price_info?.total_price || 0).toFixed(2)}`,
    }));

  // Include nativeBalance as a separate entry
  const nativeBalanceData = data.result.nativeBalance.lamports
    ? {
        key: "native",
        asset: {
          icon: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
          name: "SOL",
          link: "https://explorer.solana.com",
        },
        amount: (data.result.nativeBalance.lamports / Math.pow(10, 9)) // Convert lamports to SOL
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        price: {
          value: `$${data.result.nativeBalance.price_per_sol || 0}`,
          change: "N/A", // Assuming you don't have the change data from the API
          color: "rgb(9, 155, 103)", // Assuming green as a placeholder
        },
        value: `$${data.result.nativeBalance.total_price.toFixed(2)}`,
      }
    : {};

  // Combine the data
  if (nativeBalanceData.value) {
    mappedData = [...mappedData, nativeBalanceData];
  }

  // Sum up all values
  const totalValue = mappedData
    .reduce((sum: number, item: any) => {
      // Extract numerical value from string (e.g., "$5.16") and add to sum
      const value = parseFloat(item.value.replace("$", ""));
      return sum + (isNaN(value) ? 0 : value);
    }, 0)
    .toFixed(2);

  return { mappedData, totalValue };
};
