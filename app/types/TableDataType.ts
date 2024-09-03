export interface DataType {
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
