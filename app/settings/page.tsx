"use client";

import React, { Suspense, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Button, Col, Divider, message, Modal, Row } from "antd";
import LoadStorageManagerSC from "../components/dashboard/LoadStorageManagerSC";
import LoadStorageManagerFile from "../components/dashboard/LoadStorageManagerFile";
import {
  ClusterType,
  defaultCluster,
  updateToLatestVersion,
} from "../utils/Versioning";

const Settings = () => {
  const [openSC, setOpenSC] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [localSource, setLocalSource] = useLocalStorage<ClusterType>(
    "dashy",
    defaultCluster
  );

  return (
    <Suspense fallback={"Loading..."}>
      {contextHolder}
      <div className="max-w-[85vw] w-full">
        <div className="text-left mt-3 mb-7 text-4xl font-bold">
          Settings
          <div className="text-xl mt-2 font-light">
            Manage your account settings and preferences.
          </div>
        </div>
        <Divider style={{ margin: 0, background: "#A9A9A9" }} />

        <div className="text-2xl mt-4 font-bold underline">
          Manage Your Configuration
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
          <Col span={3} />
          <Col span={11} className="items-center">
            <Button
              className="custom-button !h-[40px]"
              onClick={() => setOpenFile(true)}
            >
              Upload or store setup through JSON file
            </Button>
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
          <Col span={3} />
          <Col span={11} className="items-center">
            <Button className="custom-button" onClick={() => setOpenSC(true)}>
              Backing up or restore encrypted setup through Smart Contract &
              IPFS
            </Button>
          </Col>
        </Row>

        {/* Model for JSON file pop out */}
        <Modal
          open={openFile}
          footer={null}
          onCancel={() => setOpenFile(false)}
          title={
            <span className="text-xl">
              Manage Your Configuration (JSON File)
            </span>
          }
          closeIcon={<CloseOutlined className="!text-[#f1f1f1] text-xl p-2" />}
        >
          <LoadStorageManagerFile
            localSource={localSource}
            onDataImport={(data) => setLocalSource(updateToLatestVersion(data))}
            messageApi={messageApi}
            onClose={() => setOpenFile(false)}
          />
        </Modal>

        {/* Model for Smart Contract pop out */}
        <Modal
          open={openSC}
          footer={null}
          onCancel={() => setOpenSC(false)}
          title={
            <span className="text-xl">
              Manage Your Configuration (Smart Contract)
            </span>
          }
          closeIcon={<CloseOutlined className="!text-[#f1f1f1] text-xl p-2" />}
        >
          <LoadStorageManagerSC
            localSource={localSource}
            onDataImport={(data) => setLocalSource(updateToLatestVersion(data))}
            onClose={() => setOpenSC(false)}
          />
        </Modal>
      </div>
    </Suspense>
  );
};

export default Settings;
