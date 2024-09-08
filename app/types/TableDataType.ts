export interface balanceDataType {
  key: string;
  asset: {
    icon: string;
    name: string;
    link: string;
  };
  amount: string;
  price: {
    value: string;
    change: string;
    color: string;
  };
  value: string;
}

export interface transactionDataType {
  key: string;
  timestamp: string;
  txnID: string;
  platform: string;
  fee: number;
  fromAddress: string;
  toAddress: string;
  ingoing: number;
  outgoing: number;
  transferType: "Native" | "Token" | "Unknown";
}

export interface topAddressDataType {
  key: string;
  address: string;
}
