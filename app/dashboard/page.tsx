"use client";

import { Button } from "antd";
import { DndContext } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import AccountGroup from "../components/dashboard/AccountGroup";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import LoadStorageManager from "../components/dashboard/LoadStorageManager";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ClusterType,
  defaultCluster,
  removeSetupVersion,
} from "@/app/utils/Versioning";

const Dashboard = () => {
  // State to store the cluster data
  const [clusters, setClusters] = useState<any>({});
  const [clusterCount, setClusterCount] = useState<number>(1);
  const [dashboardBalance, setDashboardBalance] = useState<number>(0);
  const [expandAllCluster, setExpandAllCluster] = useState<boolean>(false);
  const [localSource, setLocalSource] = useLocalStorage<ClusterType>(
    "dashy",
    defaultCluster
  );

  useEffect(() => {
    // Initialize the clusters state with the local storage data
    // TODO: potential empty localSource during deployment
    setClusters(removeSetupVersion(localSource));

    // Get the highest cluster index
    const lastClusterIndex = Math.max(
      ...Object.values(clusters).map((cluster: any) => cluster.index || 0)
    );
    setClusterCount(lastClusterIndex + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(clusters).length > 0) {
      // Update the local storage
      console.log(clusters, "Local Storage");
      setLocalSource(clusters);

      const updatedLocalSource = { ...clusters }; // Create a shallow copy of localSource to avoid direct mutation

      Object.keys(updatedLocalSource).forEach((clusterKey) => {
        const cluster = updatedLocalSource[clusterKey];

        // Calculate the total balance for each cluster's accounts
        const totalBalance = cluster.accounts.reduce(
          (sum: number, account: any) => {
            return sum + (parseFloat(account.balance) || 0); // Ensure balance is a valid number
          },
          0
        );

        // Update the cluster's total balance
        updatedLocalSource[clusterKey].totalBalance = totalBalance;
      });

      // Also update the dashboard balance, summing all cluster balances
      const totalDashboardBalance = Object.values(updatedLocalSource).reduce(
        (sum: number, cluster: any) => sum + cluster.totalBalance,
        0
      );
      setDashboardBalance(totalDashboardBalance);
    }
  }, [clusters, setLocalSource]);

  const addNewCluster = () => {
    const newClusterKey = `cluster${clusterCount}`;
    const newCluster = {
      index: clusterCount,
      clusterName: "",
      tags: [],
      accounts: [],
      totalBalance: 0,
    };

    setClusters({
      ...clusters,
      [newClusterKey]: newCluster,
    });
    setClusterCount(clusterCount + 1);
  };

  const updateCluster = (clusterKey: string, updatedCluster: any) => {
    console.log("Updated Cluster", updatedCluster);
    setClusters({
      ...clusters,
      [clusterKey]: updatedCluster,
    });
  };

  const deleteCluster = (clusterKey: string) => {
    const updatedClusters = { ...clusters };
    delete updatedClusters[clusterKey];
    setClusters(updatedClusters);
  };

  const handleDataImport = (importedData: any) => {
    setClusters(removeSetupVersion(importedData));
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
    const updatedAccount = (clusters: any) => {
      const temp = { ...clusters };
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
    setClusters(updatedAccount);
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

    const updatedAccount = (clusters: any) => {
      const temp = { ...clusters };

      if (!targetContainer) {
        if (!targetContainer) {
          const sourceIndex = over.id;
          console.log("Source Index", sourceIndex);

          // Ensure accounts array exists for the target cluster (sourceIndex)
          if (!temp[sourceIndex].accounts) {
            temp[sourceIndex].accounts = []; // Initialize if not present
          }

          // Check if the account already exists in the target cluster
          if (
            temp[sourceIndex].accounts.some(
              (acc: any) => acc?.key === active.id.toString()
            )
          ) {
            console.log("Account already exists in the cluster, skipping add");
            return temp;
          }

          const draggingAccount = temp[initialContainer].accounts.find(
            (acc: any) => acc.key === active.id.toString()
          );

          // Only add the dragging account if it's defined
          if (draggingAccount) {
            temp[sourceIndex].accounts.push(draggingAccount);
            console.log(
              "Added account to new cluster",
              temp[sourceIndex].accounts
            );

            // Ensure no undefined accounts exist in the final list
            temp[sourceIndex].accounts = temp[sourceIndex].accounts.filter(
              (acc: any) => acc !== undefined
            );
          } else {
            console.error("draggingAccount is undefined");
          }

          // Filter out the account from the initial cluster
          temp[initialContainer].accounts = temp[
            initialContainer
          ].accounts.filter((acc: any) => acc.key !== active.id.toString());

          console.log("Final Temp Object", temp);
          return temp;
        }
      }

      if (initialContainer !== targetContainer) {
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
      }

      return temp;
    };

    setClusters(updatedAccount);
  };

  return (
    <div className="max-w-[85vw] w-full">
      <div className="flex justify-between items-center mt-3 mb-3 text-3xl font-bold text-outline">
        <div>Dashboard Balance: ${dashboardBalance.toFixed(2)}</div>
      </div>
      <div className="flex gap-3 mb-5">
        <LoadStorageManager
          localSource={localSource}
          onDataImport={handleDataImport}
        />
        <div>
          <Button
            className="custom-button"
            onClick={() => {
              setExpandAllCluster((prev) => !prev);
            }}
          >
            {expandAllCluster === true ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      </div>

      <DndContext onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="grid grid-cols-2 gap-10">
          {Object.keys(clusters).map((clusterKey, index) => {
            const cluster = clusters[clusterKey];
            if (!cluster) return null; // Safeguard against undefined cluster
            return (
              <SortableContext
                key={clusterKey}
                id={clusterKey}
                items={cluster.accounts
                  .filter((account: any) => account != null)
                  .map((account: any) => account?.key)}
                strategy={verticalListSortingStrategy}
              >
                <AccountGroup
                  clusterData={cluster}
                  clusterIndex={clusterKey}
                  updateCluster={updateCluster}
                  deleteCluster={() => deleteCluster(clusterKey)}
                  displayFull={expandAllCluster}
                />
              </SortableContext>
            );
          })}
        </div>

        <Button className="mt-4 border-dashed" block onClick={addNewCluster}>
          Add New Cluster
        </Button>
      </DndContext>
    </div>
  );
};

export default Dashboard;
