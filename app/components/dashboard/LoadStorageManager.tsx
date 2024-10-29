"use client";

import React, { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Button, message, Modal, Tabs } from "antd";
import { ClusterType } from "@/app/utils/Versioning";
import LoadStorageManagerSC from "./LoadStorageManagerSC";
import LoadStorageManagerFile from "./LoadStorageManagerFile";

interface LoadStorageManagerProps {
  localSource: ClusterType;
  onDataImport: (data: ClusterType) => void;
}

const LoadStorageManager = ({
  localSource,
  onDataImport,
}: LoadStorageManagerProps) => {
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div>
      {contextHolder}
      <Button className="custom-button" onClick={() => setOpen(true)}>
        Restore/Backup Setup
      </Button>

      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title={<span className="text-xl">Manage Your Configuration</span>}
        closeIcon={<CloseOutlined className="!text-[#f1f1f1] text-xl p-2" />}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "JSON File",
              label: "JSON File",
              children: (
                <LoadStorageManagerFile
                  localSource={localSource}
                  onDataImport={onDataImport}
                  messageApi={messageApi}
                  onClose={() => setOpen(false)}
                />
              ),
            },
            {
              key: "Smart Contract",
              label: "Smart Contract",
              children: (
                <LoadStorageManagerSC
                  localSource={localSource}
                  onDataImport={onDataImport}
                  onClose={() => setOpen(false)}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default LoadStorageManager;
