import Transactions from "../components/Dashboard/Transactions";

const page = () => {
  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">
        Transaction History
      </div>
      <Transactions />
    </div>
  );
};

export default page;
