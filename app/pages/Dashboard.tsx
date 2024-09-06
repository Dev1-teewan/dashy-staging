import Balance from "../components/Dashboard/Balance";

const Dashboard = () => {
  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
      <Balance />
    </div>
  );
};

export default Dashboard;
