import { sampleData } from "./SampleBalance";
import { sampleData2 } from "./SampleBalance2";
import { SampleTxn } from "./SampleTxn";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const fetchTransactions = async (address: string) => {
  try {
    let response;
    if (address !== "") {
      new PublicKey(address);

      response = await fetch(
        `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((response) => response.json());
    } else {
      response = SampleTxn;
    }
    let mappedResponse = mapResponseTxn(response, address);
    return {
      status: "success",
      transactions: mappedResponse,
    };
  } catch (error) {
    console.log("Error fetching assets", error);
    return { status: "error", data: error };
  }
};

const mapResponseTxn = (data: any, address: string) => {
  // Filter to only include transfer transactions
  let filteredData = data.filter((txn: any) => txn.type === "TRANSFER");
  console.log(filteredData);

  // Map the filtered data to the required DataType
  let mappedData = filteredData.map((txn: any, index: number) => {
    // Determine if the transaction is a native transfer or a token transfer
    const isNativeTransfer =
      txn.nativeTransfers && txn.nativeTransfers.length > 0;
    const isTokenTransfer = txn.tokenTransfers && txn.tokenTransfers.length > 0;

    // Initialize from and to addresses
    let fromAddress = "";
    let toAddress = "";
    let amount = 0;

    // Handle native transfers
    if (isNativeTransfer) {
      const nativeTransfer = txn.nativeTransfers[0]; // Assuming there's only one transfer
      fromAddress = nativeTransfer.fromUserAccount;
      toAddress = nativeTransfer.toUserAccount;
      amount = nativeTransfer.amount / LAMPORTS_PER_SOL;
    }

    // Issue when send multiple account

    // Handle token transfers
    if (isTokenTransfer) {
      const tokenTransfer = txn.tokenTransfers[0]; // Assuming there's only one transfer
      fromAddress = tokenTransfer.fromUserAccount;
      toAddress = tokenTransfer.toUserAccount;
      amount = tokenTransfer.tokenAmount;
    }

    return {
      key: index.toString(),
      timestamp: txn.timestamp,
      txnID: txn.signature,
      platform: "Solana",
      fee: txn.feePayer === address ? txn.fee / LAMPORTS_PER_SOL : 0,
      fromAddress,
      toAddress,
      outgoing: amount,
      ingoing: 0,
      type: fromAddress === address ? "Send" : "Receive",
      transferType: isNativeTransfer
        ? "Native"
        : isTokenTransfer
        ? "Token"
        : "Unknown",
    };
  });

  return mappedData;
};

export const fetchAssets = async (address: string) => {
  try {
    let response;
    if (address !== "") {
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
