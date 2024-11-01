import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { formatAmount, formatToken } from "./Utils";

export const mapResponseTxn = (data: any, targetAddress: string) => {
  // Filter to only include transfer transactions
  let filteredData = data.filter((txn: any) => txn.type === "TRANSFER");

  // Map the filtered data to the required DataType
  let mappedData = filteredData.map((txn: any, index: number) => {
    // Determine if the transaction is a native transfer or a token transfer
    const isNativeTransfer =
      txn.nativeTransfers && txn.nativeTransfers.length > 0;
    const isTokenTransfer = txn.tokenTransfers && txn.tokenTransfers.length > 0;

    // Initialize from and to addresses, amount, and token details
    let fromAddress = "";
    let toAddress = "";
    let amount = 0;
    let ingoing = "";
    let outgoing = "";
    let transferType = "Unknown"; // Track the type of transfer (Native/Token)
    let tokenSymbol = ""; // Track the token symbol

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
        transferType = "Native";

        // Format dynamically to show up to 9 decimal places without trailing zeros
        let formattedAmount = amount.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 9,
        });

        // Determine if it's ingoing or outgoing
        if (fromAddress === targetAddress) {
          outgoing = formattedAmount;
        } else if (toAddress === targetAddress) {
          ingoing = formattedAmount;
        }
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
        // tokenDecimals = tokenTransfer.decimals || 6; // Default to 6 decimals if not specified
        // amount = tokenTransfer.tokenAmount / Math.pow(10, tokenDecimals); // Normalize token amount by decimals
        transferType = "Token";

        // Extract token symbol from the description using the regex
        if (txn.description) {
          tokenSymbol = txn.description.split(" ")[3]; // Extracted token symbol
        }

        // Determine if it's ingoing or outgoing
        if (fromAddress === targetAddress) {
          outgoing = txn.description.split(" ")[2];
        } else if (toAddress === targetAddress) {
          ingoing = txn.description.split(" ")[2];
        }
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
      outgoing,
      ingoing,
      tokenSymbol: transferType === "Token" ? tokenSymbol : null, // Add token symbol if it's a token transfer
      type: fromAddress === targetAddress ? "Send" : "Receive",
      transferType,
    };
  });

  return mappedData;
};

// Filter top interacted addresses (Disabled for now)
/*
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

  // Limit the RPC Calling rate to 1 address
  const topAddress = sortedAddresses.slice(0, 1);
  const remainingAddresses = sortedAddresses.slice(1);

  // Fetch balances for top 6 addresses
  const topBalances = await Promise.all(
    topAddress.map(async ([address], index) => {
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
    key: `${index + 1}`, // Offset the key to avoid duplication
    address, // Set the address field
    count: addressCount[address], // Set the count field
    balance: -1, // Set balance to -1
  }));

  // Combine the results
  return [...topBalances, ...remainingBalances];
};
*/

// Get the balance of USDC for a target address (Disabled for now)
/*
export const getBalanceOnUSDC = async (targetAddress: string) => {
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

  // console.log(response);
  // Extract the token accounts from the response
  const tokenAccounts = response.result.value;
  const usdcBalance = tokenAccounts.reduce(
    (acc: number, account: any) =>
      acc + parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount),
    0
  );
  // console.log(usdcBalance);
  return usdcBalance;
};
*/

export const mapResponseAssets = (data: any) => {
  // Map the data to the required DataType
  let mappedData = data.result.items
    .filter((item: any) => item.token_info?.price_info?.total_price > 0.01)
    .map((item: any, index: number) => ({
      key: index.toString(),
      asset: {
        icon: item.content?.links?.image || item.content?.files[0]?.uri || "",
        name:
          item.token_info.symbol || item.content.metadata?.name || "Unknown",
        link: `https://explorer.solana.com/address/${item.id}?cluster=mainnet`,
      },
      amount: (() => {
        const balance = item.token_info?.balance || 0; // Fallback to 0 if balance is undefined
        const decimals = item.token_info?.decimals || 0; // Fallback to 0 if decimals are undefined
        const value = balance / Math.pow(10, decimals); // Convert based on decimals
        return formatToken(value); // Format the amount
      })(), // Self-executing function to handle amount formatting
      price: {
        value: `$${item.token_info?.price_info?.price_per_token || 0}`,
        change: "N/A", // Need another CoinGecko API
        color: "rgb(9, 155, 103)",
      },
      value: `$${formatAmount(item.token_info?.price_info?.total_price) || 0}`,
    }));

  // console.log("Check native", data.result);

  // Check if nativeBalance exists and if it has lamports
  const nativeBalanceData = data.result.nativeBalance?.lamports
    ? {
        key: "native",
        asset: {
          icon: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png",
          name: "SOL",
          link: "https://explorer.solana.com",
        },
        amount: (() => {
          const value = data.result.nativeBalance.lamports / Math.pow(10, 9); // Convert lamports to SOL
          return formatToken(value); // Format the amount
        })(),
        price: {
          value: `$${data.result.nativeBalance.price_per_sol || 0}`,
          change: "N/A", // Assuming you don't have the change data from the API
          color: "rgb(9, 155, 103)", // Assuming green as a placeholder
        },
        value: `$${formatAmount(data.result.nativeBalance.total_price) || 0}`,
      }
    : null; // Return null if nativeBalance doesn't exist or doesn't have lamports

  // Combine the data
  if (nativeBalanceData) {
    mappedData = [...mappedData, nativeBalanceData];
  }

  // Sum up all values
  const totalValue = mappedData.reduce((sum: number, item: any) => {
    // Extract numerical value from string (e.g., "$5.16") and add to sum
    const value = parseFloat(item.value.replace(/[$,]/g, ""));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  return { mappedData, totalValue };
};

// Fetch the latest blockhash from the Solana RPC to use in transactions
export const getLatestBlockhash = async () => {
  try {
    const response = await fetch("/api/helius/getLatestBlockhash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching latest blockhash:", error);
    return { status: "error", data: error };
  }
};
