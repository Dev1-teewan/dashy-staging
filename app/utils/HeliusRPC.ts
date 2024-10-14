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
    let ingoing = 0;
    let outgoing = 0;
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

        // Determine if it's ingoing or outgoing
        if (fromAddress === targetAddress) {
          outgoing = amount;
        } else if (toAddress === targetAddress) {
          ingoing = amount;
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
          outgoing = Number(txn.description.split(" ")[2]);
        } else if (toAddress === targetAddress) {
          ingoing = Number(txn.description.split(" ")[2]);
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
  {
    /* Limit the RPC Calling rate */
  }
  const top3Addresses = sortedAddresses.slice(0, 1);
  const remainingAddresses = sortedAddresses.slice(1);

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
    key: `${index + 1}`, // Offset the key to avoid duplication
    address, // Set the address field
    count: addressCount[address], // Set the count field
    balance: -1, // Set balance to 0
  }));

  // Combine the results
  return [...top3Balances, ...remainingBalances];
};

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
  // Process the response as needed, for example:
  const tokenAccounts = response.result.value;
  const usdcBalance = tokenAccounts.reduce(
    (acc: number, account: any) =>
      acc + parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount),
    0
  );
  // console.log(usdcBalance);
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
                showZeroBalance: false,
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

        // Split into integer and decimal parts
        const [integerPart, decimalPart] = value.toFixed(4).split(".");

        // Format the integer part with commas
        const formattedIntegerPart = integerPart.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );

        // Determine the formatted decimal part
        let formattedDecimalPart;
        if (decimalPart) {
          // Remove trailing zeros from the decimal part
          const significantDecimal = decimalPart.replace(/0+$/, ""); // Remove trailing zeros
          formattedDecimalPart =
            significantDecimal.length > 0 ? significantDecimal : "00"; // Default to '00' if nothing left
          return `${formattedIntegerPart}.${formattedDecimalPart}`;
        } else {
          // If there is no decimal part, return with two decimal places
          return `${formattedIntegerPart}.00`;
        }
      })(), // Self-executing function to handle amount formatting
      price: {
        value: `$${item.token_info?.price_info?.price_per_token || 0}`,
        change: "N/A", // Need another CoinGecko API
        color: "rgb(9, 155, 103)",
      },
      value: `$${(item.token_info?.price_info?.total_price || 0).toFixed(2)}`,
    }));

  console.log("Check native", data.result);

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

          // Split into integer and decimal parts
          const [integerPart, decimalPart] = value.toFixed(4).split(".");

          // Format the integer part with commas
          const formattedIntegerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
          );

          // Determine the formatted decimal part
          if (decimalPart) {
            // Remove trailing zeros from the decimal part
            const significantDecimal = decimalPart.replace(/0+$/, ""); // Remove trailing zeros
            const formattedDecimalPart =
              significantDecimal.length > 0 ? significantDecimal : "00"; // Default to '00' if nothing left
            return `${formattedIntegerPart}.${formattedDecimalPart}`; // Combine both parts
          } else {
            // If there's no decimal part, return with one decimal place as '0'
            return `${formattedIntegerPart}.00`;
          }
        })(),
        price: {
          value: `$${data.result.nativeBalance.price_per_sol || 0}`,
          change: "N/A", // Assuming you don't have the change data from the API
          color: "rgb(9, 155, 103)", // Assuming green as a placeholder
        },
        value: `$${(data.result.nativeBalance.total_price || 0).toFixed(2)}`,
      }
    : null; // Return null if nativeBalance doesn't exist or doesn't have lamports

  // Combine the data
  if (nativeBalanceData) {
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

export const getLatestBlockhash = async () => {
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
      return {
        status: "success",
        blockhash: data.result.value.blockhash,
        lastValidBlockHeight: data.result.value.lastValidBlockHeight,
      };
    } else {
      throw new Error("No blockhash found in the response");
    }
  } catch (error) {
    console.error("Error fetching latest blockhash:", error);
    return { status: "error", data: error };
  }
};
