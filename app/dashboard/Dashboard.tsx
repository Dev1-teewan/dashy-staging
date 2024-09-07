import Balance from "../components/Dashboard/Balance";
import TopAddresses from "../components/Dashboard/TopAddresses";

const Dashboard = () => {
  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
      <div className="flex flex-col gap-5">
        <TopAddresses />
        <Balance />
      </div>
    </div>
  );
};

export default Dashboard;
