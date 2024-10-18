export const latestVersion = "v1.0.1";

interface Account {
  key: string;
  alias: string;
  address: string;
  connections: string[];
  purpose: string;
  balance: string;
}

export interface ClusterDataType {
  clusterName: string;
  accounts: Account[];
  tags: string[];
  totalBalance: number;
}

export interface ClusterType {
  version: string;
  [key: string]: ClusterDataType | string;
}

export const defaultCluster = {
  version: latestVersion,
  cluster1: {
    index: 1,
    clusterName: "Cluster 1",
    tags: [],
    accounts: [],
    totalBalance: 0,
  },
};

// Function to check if the version is the latest
const checkVersion = (currentVersion: string) => {
  return currentVersion === latestVersion;
};

// Function to remove the version from the data
export const removeSetupVersion = (localSource: ClusterType) => {
  const { version, ...clustersWithoutVersion } = localSource;
  return clustersWithoutVersion;
};

// Function to update settings to the latest version
export const updateToLatestVersion = (localSource: any) => {
  // If the version is already the latest, return the data as is
  if (checkVersion(localSource.version)) return localSource;

  // Create a new object to hold the updated data
  const updatedClusters: any = {};

  // Iterate over the stored clusters
  Object.keys(localSource).forEach((key) => {
    // Skip the version key
    if (key === "version") return;

    // Rename the cluster keys from 'group' to 'cluster'
    const newKey = key.replace("group", "cluster");

    // Update each account inside the cluster
    const updatedAccounts = localSource[key].accounts.map((account: any) => {
      return {
        ...account,
        connections: [...(account.to || [])], // Use 'to' as connections
      };
    });

    // Remove 'to' and 'from' from each account
    updatedAccounts.forEach((account: any) => {
      delete account.to;
      delete account.from;
    });

    // Update the cluster itself with the updated accounts
    const updatedCluster = {
      ...localSource[key],
      accounts: updatedAccounts, // Use updated accounts
    };

    // Remove the old 'groupName' key
    delete updatedClusters.groupName;

    // Add the updated cluster with the new key to the updatedClusters object
    updatedClusters[newKey] = updatedCluster;
  });

  // Return the updated object with the new structure
  return {
    version: latestVersion, // Ensure the latest version is set
    ...updatedClusters, // Add the newly transformed clusters
  };
};
