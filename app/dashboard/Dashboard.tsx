import { Button } from "antd";
import AccountGroup from "../components/dashboard/AccountGroup";

const Dashboard = () => {
  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
      <div className="flex flex-col gap-5">
        <AccountGroup />
        <Button className="mt-2" block>
          Add New Group
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
