"use client";

import React, { Suspense } from "react";
import { Col, Divider, Row } from "antd";
import { useLocalStorage } from "../hooks/useLocalStorage";
import LoadStorageManagerBackup from "../components/dashboard/LoadStorageManagerBackup";
import LoadStorageManagerSetting from "../components/dashboard/LoadStorageManagerSetting";
import {
  ClusterType,
  defaultCluster,
  updateToLatestVersion,
} from "../utils/Versioning";

const Settings = () => {
  const [localSource, setLocalSource] = useLocalStorage<ClusterType>(
    "dashy",
    defaultCluster
  );

  return (
    <Suspense fallback={"Loading..."}>
      <div className="max-w-[85vw] w-full">
        <div className="text-left mt-3 mb-7 text-4xl font-bold">
          Settings
          <div className="text-xl mt-2 font-light">
            Manage your account settings and preferences.
          </div>
        </div>
        <Divider style={{ margin: 0, background: "#A9A9A9" }} />
        {/* <Tabs
          type="card"
          size={"large"}
          className="mt-5"
          items={new Array(1).fill(null).map((_, i) => {
            const id = String(i + 1);
            return {
              label: "Import/ Export Setup",
              key: id,
              children: `Content of Tab Pane ${id}`,
            };
          })}
        /> */}
        <div className="text-2xl mt-4 font-bold underline">
          Import/ Export Setup
        </div>
        <Row className="items-center">
          <Col span={10}>
            <div className="text-left mt-5 mb-7 text-xl font-semibold">
              JSON file
              <div className="text-sm font-light">
                Save or restore your configuration data easily with a JSON file.
              </div>
            </div>
          </Col>
          <Col span={14} className="items-center">
            <LoadStorageManagerSetting
              localSource={localSource}
              onDataImport={(data) =>
                setLocalSource(updateToLatestVersion(data))
              }
            />
          </Col>
        </Row>
        <Divider style={{ margin: 0, background: "#3b3b3b" }} />
        <Row className="items-center">
          <Col span={10}>
            <div className="text-left mt-5 mb-7 text-xl font-semibold">
              Smart Contract
              <div className="text-sm font-light">
                Securely save or retrieve your configuration data using IPFS and
                encryption with a connected wallet.
              </div>
            </div>
          </Col>
          <Col span={14} className="items-center">
            <LoadStorageManagerBackup
              localSource={localSource}
              onDataImport={(data) =>
                setLocalSource(updateToLatestVersion(data))
              }
            />
          </Col>
        </Row>
      </div>
    </Suspense>
  );
};

export default Settings;
