export const latestVersion = "v1.0.1";

interface Account {
  key: string;
  alias: string;
  address: string;
  from: string[];
  to: string[];
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
  const updatedGroups: any = {};

  // Iterate over the stored groups
  Object.keys(localSource).forEach((key) => {
    // Skip the version key
    if (key === "version") return;

    // Rename the group keys from 'group' to 'cluster'
    const newKey = key.replace("group", "cluster");

    // If the object has a 'groupName' key, rename it to 'clusterName'
    const updatedGroup = {
      ...localSource[key],
      clusterName: localSource[key].groupName || "", // Copy the groupName to clusterName
    };

    // Remove the old 'groupName' key
    delete updatedGroup.groupName;

    // Add the updated group with the new key to the updatedGroups object
    updatedGroups[newKey] = updatedGroup;
  });

  // Return the updated object with the new structure
  return {
    version: latestVersion, // Ensure the latest version is set
    ...updatedGroups, // Add the newly transformed groups
  };
};
