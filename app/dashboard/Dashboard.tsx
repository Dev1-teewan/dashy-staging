"use client";

import { Button } from "antd";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import AccountGroup from "../components/dashboard/AccountGroup";
import LoadStorageManager from "../components/dashboard/LoadStorageManager";

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupCount, setGroupCount] = useState<number>(1);
  const [dashboardBalance, setDashboardBalance] = useState<number>(0);
  const [localSource, setLocalSource] = useLocalStorage<any[]>("dashy", [
    {
      index: 1,
      groupName: "Group 1",
      tags: [],
      accounts: [],
      totalBalance: 0,
    },
  ]);

  useEffect(() => {
    if (localSource.length > 0) {
      setGroups(localSource);
      const lastGroup = localSource[localSource.length - 1];
      setGroupCount(lastGroup ? lastGroup.index + 1 : 1);
    }
  }, [localSource]);

  useEffect(() => {
    const total = groups.reduce((sum, group) => sum + group.totalBalance, 0);
    setDashboardBalance(total);
  }, [groups]);

  const handleAddNewGroup = () => {
    const newGroup = {
      index: groupCount,
      groupName: `Group ${groupCount}`,
      tags: [],
      accounts: [],
      totalBalance: 0,
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

  const deleteGroup = (index: number) => {
    const updatedGroups = groups.filter((_, i) => i !== index);
    setGroups(updatedGroups);
    setLocalSource(updatedGroups);
  };

  const handleDataImport = (importedData: any) => {
    setLocalSource(importedData);
  };

  return (
    <div className="max-w-[75vw] w-full">
      <div className="flex justify-between items-center mt-3 mb-7 text-2xl font-bold">
        <div className="flex gap-3">
          Dashboard
          <LoadStorageManager
            localSource={localSource}
            onDataImport={handleDataImport}
          />
        </div>
        <div className="text-lg font-bold">
          Total Dashboard Balance: ${dashboardBalance.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {groups.map((group, index) => (
          <AccountGroup
            key={index}
            groupData={group}
            groupIndex={index}
            updateGroup={updateGroup}
            deleteGroup={deleteGroup}
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
