import { sampleData } from "./SampleBalance";
import { sampleData2 } from "./SampleBalance2";
import { SampleTxn } from "./SampleTxn";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const fetchTransactions = async (address: string) => {
  try {
    let mappedResponse, topAddresses;
    if (address !== "") {
      new PublicKey(address);

      const response = await fetch(
        `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((response) => response.json());
      mappedResponse = mapResponseTxn(response, address);
      topAddresses = await mapResponseTopAddresses(mappedResponse, address);
    } else {
      const response = SampleTxn;
      mappedResponse = mapResponseTxn(
        response,
        "FCHTRYx6npkQCogtpZtEFLJeevAFGbDHhJyvqvT6F4kX"
      );
      topAddresses = await mapResponseTopAddresses(
        mappedResponse,
        "FCHTRYx6npkQCogtpZtEFLJeevAFGbDHhJyvqvT6F4kX"
      );
    }
    return {
      status: "success",
      transactions: mappedResponse,
      topAddresses,
    };
  } catch (error) {
    console.log("Error fetching assets", error);
    return { status: "error", data: error };
  }
};

const mapResponseTxn = (data: any, targetAddress: string) => {
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
      const nativeTransfer = txn.nativeTransfers.find(
        (transfer: any) =>
          transfer.fromUserAccount === targetAddress ||
          transfer.toUserAccount === targetAddress
      );

      if (nativeTransfer) {
        fromAddress = nativeTransfer.fromUserAccount;
        toAddress = nativeTransfer.toUserAccount;
        amount = nativeTransfer.amount / LAMPORTS_PER_SOL;
      }
    }

    // Handle token transfers
    if (isTokenTransfer) {
      const tokenTransfer = txn.tokenTransfers.find(
        (transfer: any) =>
          transfer.fromUserAccount === targetAddress ||
          transfer.toUserAccount === targetAddress
      );

      if (tokenTransfer) {
        fromAddress = tokenTransfer.fromUserAccount;
        toAddress = tokenTransfer.toUserAccount;
        amount = tokenTransfer.tokenAmount;
      }
    }

    return {
      key: index.toString(),
      timestamp: txn.timestamp,
      txnID: txn.signature,
      platform: "Solana",
      fee: txn.feePayer === targetAddress ? txn.fee / LAMPORTS_PER_SOL : 0,
      fromAddress,
      toAddress,
      outgoing: amount,
      ingoing: 0,
      type: fromAddress === targetAddress ? "Send" : "Receive",
      transferType: isNativeTransfer
        ? "Native"
        : isTokenTransfer
        ? "Token"
        : "Unknown",
    };
  });

  return mappedData;
};
const mapResponseTopAddresses = async (data: any[], targetAddress: string) => {
  const addressCount: { [address: string]: number } = {};

  // Iterate over all transactions
  data.forEach((transaction) => {
    const { fromAddress, toAddress } = transaction;

    // Add `fromAddress` if it's not the target address
    if (fromAddress && fromAddress !== targetAddress) {
      addressCount[fromAddress] = (addressCount[fromAddress] || 0) + 1;
    }

    // Add `toAddress` if it's not the target address
    if (toAddress && toAddress !== targetAddress) {
      addressCount[toAddress] = (addressCount[toAddress] || 0) + 1;
    }
  });

  // Get the top 10 most engaged addresses
  const sortedAddresses = Object.entries(addressCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Get the top 10 most engaged addresses

  // Separate top 6 addresses for balance fetching
  const top3Addresses = sortedAddresses.slice(0, 6);
  const remainingAddresses = sortedAddresses.slice(6);

  // Fetch balances for top 6 addresses
  const top3Balances = await Promise.all(
    top3Addresses.map(async ([address], index) => {
      const balance = await getBalanceOnUSDC(address); // Await the balance
      return {
        key: `${index}`, // Set key for each entry
        address, // Set the address field
        count: addressCount[address], // Set the count field
        balance, // Set the resolved balance
      };
    })
  );

  // Set balance to 0 for remaining addresses
  const remainingBalances = remainingAddresses.map(([address], index) => ({
    key: `${index + 6}`, // Offset the key to avoid duplication
    address, // Set the address field
    count: addressCount[address], // Set the count field
    balance: -1, // Set balance to 0
  }));

  // Combine the results
  return [...top3Balances, ...remainingBalances];
};

const getBalanceOnUSDC = async (targetAddress: string) => {
  const response = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_KEY}`,
    {
      method: "POST", // Changed to POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner", // Correct method for fetching token accounts
        params: [
          targetAddress, // Use the target address passed to the function
          {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint address
          },
          {
            encoding: "jsonParsed",
          },
        ],
      }),
    }
  ).then((response) => response.json());

  console.log(response);
  // Process the response as needed, for example:
  const tokenAccounts = response.result.value;
  const usdcBalance = tokenAccounts.reduce(
    (acc: number, account: any) =>
      acc + parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount),
    0
  );
  console.log(usdcBalance);
  return usdcBalance;
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
