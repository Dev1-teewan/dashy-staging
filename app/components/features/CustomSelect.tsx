import { Select } from "antd";
import { useState } from "react";
import type { SelectProps } from "antd";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

const CustomSelect = ({ address }: { address: string }) => {
  // const { publicKey } = useWallet();
  // const key = publicKey?.toString() || "default_key";

  // const [getLocalStorage, setLocalStorage] = useLocalStorage(key);
  // const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // const localValue = getLocalStorage()[address]?.toString().split(",");

  // const options: SelectProps["options"] = [
  //   { value: "tag1", label: "Tag1" },
  //   { value: "tag2", label: "Tag2" },
  // ];

  // const handleChange = (value: string[]) => {
  //   if (value.length === 0) {
  //     const oldStorage = getLocalStorage();
  //     delete oldStorage[address];
  //     setLocalStorage(oldStorage);
  //   } else {
  //     const oldStorage = getLocalStorage();
  //     setLocalStorage({
  //       ...oldStorage,
  //       [address]: value.join(","),
  //     });
  //   }
  //   setSelectedValues(getLocalStorage());
  // };

  return (
    // <Select
    //   mode="tags"
    //   placeholder="Tags Mode"
    //   onChange={handleChange}
    //   options={options}
    //   className="w-full"
    //   value={localValue}
    // />
    <></>
  );
};

export default CustomSelect;
