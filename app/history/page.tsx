import { Suspense } from "react";
import Transactions from "../components/engage/Transactions";

const page = () => {
  return (
    <Suspense fallback={"Loading..."}>
      <div className="max-w-[85vw] w-full">
        <div className="text-left mt-3 mb-7 text-2xl font-bold">
          Transaction History
        </div>
        <Transactions />
      </div>
    </Suspense>
  );
};

export default page;
