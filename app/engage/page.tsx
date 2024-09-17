import { Suspense } from "react";
import TopAddresses from "../components/engage/TopAddresses";
import Balance from "../components/engage/Balance";
import LedgerComponent from "../components/engage/Ledger";

const page = () => {
  return (
    <Suspense fallback={"Loading..."}>
      <div className="max-w-[75vw] w-full">
        <div className="text-left mt-3 mb-7 text-2xl font-bold">
          Dashboard (Old)
        </div>
        <div className="flex flex-col gap-5">
          <TopAddresses />
          {/* <LedgerComponent /> */}

          <Balance />
        </div>
      </div>
    </Suspense>
  );
};

export default page;
