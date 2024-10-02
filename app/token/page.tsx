import { Suspense } from "react";
import Balance from "../components/token/Balance";
import LedgerComponent from "../components/engage/Ledger";
import TopAddresses from "../components/engage/TopAddresses";

const page = () => {
  return (
    <Suspense fallback={"Loading..."}>
      <div className="max-w-[85vw] w-full">
        <div className="text-left mt-3 mb-7 text-2xl font-bold">
          Token Balance
        </div>
        <div className="flex flex-col gap-5">
          {/* <TopAddresses /> */}
          {/* <LedgerComponent /> */}

          <Balance />
        </div>
      </div>
    </Suspense>
  );
};

export default page;
