"use client";

import { CloseOutlined } from "@ant-design/icons";
import React, { ChangeEvent, useState } from "react";
import { Button, Divider, message, Modal, Upload } from "antd";
import { ClusterType, updateToLatestVersion } from "@/app/utils/Versioning";

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    importLocalStorage(event);
    event.target.value = ""; // Reset the file input after each upload
  };

  const importLocalStorage = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      messageApi.error("No file selected. Please upload a valid JSON file.");
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      try {
        if (typeof content === "string") {
          const parsedContent = JSON.parse(content);
          const updatedContent = updateToLatestVersion(parsedContent); // Update the data to the latest version
          onDataImport(updatedContent); // Set the imported data to trigger the update
          messageApi.success("Local storage has been restored successfully!");
          setOpen(false);
        }
      } catch (error) {
        console.error("Invalid JSON format", error);
        messageApi.error(
          "Invalid JSON format. Please upload a valid JSON file."
        );
      }
    };

    reader.readAsText(file); // Read the file as text
  };

  const exportLocalStorage = () => {
    if (!localSource) {
      messageApi.error("No data to export. 'dashy' is empty.");
      return;
    }

    const localStorageData = JSON.stringify(localSource); // Convert localStorage to a JSON string

    const blob = new Blob([localStorageData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dashySetup.json"; // The file name for the download
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up
    messageApi.success("Dashy setup exported successfully!");
  };

  return (
    <div>
      {contextHolder}
      <Button className="custom-button" onClick={() => setOpen(true)}>
        Import/Export Setup
      </Button>

      <Modal
        open={open}
        footer={null}
        title="Export Setup"
        onCancel={() => setOpen(false)}
        closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
      >
        <div className="text-sm text-gray-500 pb-2">
          Note: Exporting local storage will download a JSON file containing
        </div>
        <Button onClick={exportLocalStorage} className="w-full">
          Export Local Storage
        </Button>
        <Divider style={{ borderColor: "#003628" }} />

        <div className="text-[16px] font-semibold mb-2">Import Setup</div>
        <div className="text-sm text-gray-500 pb-2">
          Note: Importing local storage will overwrite your current data.
        </div>
        <Upload
          accept="application/json"
          beforeUpload={(file) => {
            const event = {
              target: {
                files: [file],
                value: "",
              },
            } as unknown as ChangeEvent<HTMLInputElement>;
            handleFileChange(event);
            return false; // Prevent automatic upload
          }}
          showUploadList={false}
        >
          <Button>Import Local Storage</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default LoadStorageManager;
