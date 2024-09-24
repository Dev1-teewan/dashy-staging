"use client";

import { Button } from "antd";
import { DndContext } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import AccountGroup from "../components/dashboard/AccountGroup";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import LoadStorageManager from "../components/dashboard/LoadStorageManager";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Dashboard = () => {
  const [groups, setGroups] = useState<any>({});
  const [groupCount, setGroupCount] = useState<number>(1);
  const [dashboardBalance, setDashboardBalance] = useState<number>(0);
  const [localSource, setLocalSource] = useLocalStorage<any>("dashy", {
    group1: {
      index: 1,
      groupName: "Group 1",
      tags: [],
      accounts: [],
      totalBalance: 0,
    },
  });

  useEffect(() => {
    const storedGroups = localStorage.getItem("dashy");
    setGroups(storedGroups ? JSON.parse(storedGroups) : {});
  }, []);

  useEffect(() => {
    if (Object.keys(localSource).length > 0) {
      console.log(localSource, "localSource");

      const updatedLocalSource = { ...localSource }; // Create a shallow copy of localSource to avoid direct mutation

      Object.keys(updatedLocalSource).forEach((groupKey) => {
        const group = updatedLocalSource[groupKey];

        // Calculate the total balance for the current group
        const totalBalance = group.accounts.reduce(
          (sum: number, account: any) => {
            return sum + (parseFloat(account.balance) || 0); // Ensure balance is a valid number
          },
          0
        );

        // Update the group's total balance
        updatedLocalSource[groupKey].totalBalance = totalBalance;
      });

      // Also update the dashboard balance, summing all group balances
      const totalDashboardBalance = Object.values(updatedLocalSource).reduce(
        (sum: number, group: any) => sum + group.totalBalance,
        0
      );
      setDashboardBalance(totalDashboardBalance);

      // Get the highest group index
      const lastGroupIndex = Math.max(
        ...Object.values(updatedLocalSource).map((group: any) => group.index)
      );
      setGroupCount(lastGroupIndex + 1);
    }
  }, [localSource]);

  const handleAddNewGroup = () => {
    const newGroupKey = `group${groupCount}`;
    const newGroup = {
      index: groupCount,
      groupName: `Group ${groupCount}`,
      tags: [],
      accounts: [],
      totalBalance: 0,
    };

    const updatedGroups = {
      ...groups,
      [newGroupKey]: newGroup,
    };

    setGroups(updatedGroups);
    setGroupCount(groupCount + 1);
    setLocalSource(updatedGroups);
  };

  const updateGroup = (groupKey: string, updatedGroup: any) => {
    console.log("Updated Group", updatedGroup);
    const updatedGroups = {
      ...groups,
      [groupKey]: updatedGroup,
    };
    setGroups(updatedGroups);
    setLocalSource(updatedGroups);
  };

  const deleteGroup = (groupKey: string) => {
    const updatedGroups = { ...groups };
    delete updatedGroups[groupKey];
    setGroups(updatedGroups);
    setLocalSource(updatedGroups);
  };

  const handleDataImport = (importedData: any) => {
    setGroups(importedData);
    setLocalSource(importedData);
  };

  const onDragEnd = (e: DragEndEvent) => {
    // Check if item is drag into unknown area
    if (!e.over || !e.active.data.current || !e.over.data.current) return;

    // Check if item position is the same
    if (e.active.id === e.over.id) return;

    // Check if item is moved outside of the column
    if (
      e.active.data.current.sortable.containerId !==
      e.over.data.current.sortable.containerId
    )
      return;

    // Sort the items list order based on item target position
    const containerName = e.active.data.current.sortable.containerId;
    const updatedAccount = (localSource: any) => {
      const temp = { ...localSource };
      if (!e.over) return temp;
      const oldIdx = temp[containerName].accounts.findIndex(
        (acc: any) => acc.key === e.active.id.toString()
      );
      const newIdx = temp[containerName].accounts.findIndex(
        (acc: any) => acc.key === e.over!.id.toString()
      );
      temp[containerName] = {
        ...temp[containerName],
        accounts: arrayMove(temp[containerName].accounts, oldIdx, newIdx),
      };
      return temp;
    };
    setGroups(updatedAccount);
    setLocalSource(updatedAccount);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log("No over");
      return;
    }

    const initialContainer = active.data.current?.sortable?.containerId;
    const targetContainer = over.data.current?.sortable?.containerId;

    if (!initialContainer) {
      console.log("No initial container");
      return;
    }

    const updatedAccount = (localSource: any) => {
      const temp = { ...localSource };

      if (!targetContainer) {
        if (!targetContainer) {
          const sourceIndex = over.id;
          console.log("Source Index", sourceIndex);

          // Ensure accounts array exists for the target group (sourceIndex)
          if (!temp[sourceIndex].accounts) {
            temp[sourceIndex].accounts = []; // Initialize if not present
          }

          // Check if the account already exists in the target group
          if (
            temp[sourceIndex].accounts.some(
              (acc: any) => acc?.key === active.id.toString()
            )
          ) {
            console.log("Account already exists in the group, skipping add");
            return temp;
          }

          const draggingAccount = temp[initialContainer].accounts.find(
            (acc: any) => acc.key === active.id.toString()
          );

          // Only add the dragging account if it's defined
          if (draggingAccount) {
            temp[sourceIndex].accounts.push(draggingAccount);
            console.log(
              "Added account to new group",
              temp[sourceIndex].accounts
            );

            // Ensure no undefined accounts exist in the final list
            temp[sourceIndex].accounts = temp[sourceIndex].accounts.filter(
              (acc: any) => acc !== undefined
            );
          } else {
            console.error("draggingAccount is undefined");
          }

          // Filter out the account from the initial group
          temp[initialContainer].accounts = temp[
            initialContainer
          ].accounts.filter((acc: any) => acc.key !== active.id.toString());

          console.log("Final Temp Object", temp);
          return temp;
        }
      }

      if (initialContainer === targetContainer) {
        // const oldIdx = temp[initialContainer].accounts.findIndex(
        //   (acc: any) => acc.key === active.id.toString()
        // );
        // const newIdx = temp[initialContainer].accounts.findIndex(
        //   (acc: any) => acc.key === over!.id.toString()
        // );
        // // Use the moveArrayItem function to swap items
        // const updatedAccounts = moveArrayItem(
        //   [...temp[initialContainer].accounts],
        //   oldIdx,
        //   newIdx
        // );
        // temp[initialContainer] = {
        //   ...temp[initialContainer],
        //   accounts: arrayMove(temp[initialContainer].accounts, oldIdx, newIdx),
        // };
      } else {
        const draggingAccount = temp[initialContainer].accounts.find(
          (acc: any) => acc.key === active.id.toString()
        );
        temp[targetContainer].accounts.push(draggingAccount);

        temp[targetContainer].accounts = temp[targetContainer].accounts.filter(
          (acc: any) => acc !== undefined
        );

        temp[initialContainer].accounts = temp[
          initialContainer
        ].accounts.filter((acc: any) => acc.key !== active.id.toString());
        console.log("Temp2222222", temp);
      }

      return temp;
    };

    setGroups(updatedAccount);
    setLocalSource(updatedAccount);
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

      <DndContext onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="flex flex-col gap-5">
          {Object.keys(groups).map((groupKey) => {
            const group = groups[groupKey];
            if (!group) return null; // Safeguard against undefined groups

            return (
              <SortableContext
                key={groupKey}
                id={groupKey}
                items={group.accounts
                  .filter((account: any) => account != null)
                  .map((account: any) => account?.key)}
                strategy={verticalListSortingStrategy}
              >
                <AccountGroup
                  groupData={group}
                  groupIndex={groupKey}
                  updateGroup={updateGroup}
                  deleteGroup={() => deleteGroup(groupKey)}
                />
              </SortableContext>
            );
          })}
        </div>
        <Button className="mt-2" block onClick={handleAddNewGroup}>
          Add New Group
        </Button>
      </DndContext>
    </div>
  );
};

export default Dashboard;
