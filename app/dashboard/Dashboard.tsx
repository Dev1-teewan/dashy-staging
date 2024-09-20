"use client";

import { Button } from "antd";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import AccountGroup from "../components/dashboard/AccountGroup";

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupCount, setGroupCount] = useState<number>(1);
  const [localSource, setLocalSource] = useLocalStorage<any[]>("dashy", []);

  useEffect(() => {
    if (localSource.length > 0) {
      setGroups(localSource);
      setGroupCount(localSource.length + 1);
    }
  }, [localSource]);

  const handleAddNewGroup = () => {
    const newGroup = {
      groupName: `Group ${groupCount}`,
      tags: [],
      accounts: [],
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    setGroupCount(groupCount + 1);
    setLocalSource(updatedGroups);
  };

  const updateGroup = (index: number, updatedGroup: any) => {
    const updatedGroups = [...groups];
    updatedGroups[index] = updatedGroup;
    setGroups(updatedGroups);
    setLocalSource(updatedGroups);
  };

  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
      <div className="flex flex-col gap-5">
        {groups.map((group, index) => (
          <AccountGroup
            key={index}
            groupData={group}
            groupIndex={index}
            updateGroup={updateGroup}
          />
        ))}
        <Button className="mt-2" block onClick={handleAddNewGroup}>
          Add New Group
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
