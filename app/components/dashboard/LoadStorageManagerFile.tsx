import React, { ChangeEvent } from "react";
import { Button, Divider, Upload } from "antd";
import { ClusterType, updateToLatestVersion } from "@/app/utils/Versioning";

interface LoadStorageManagerFileProps {
  localSource: ClusterType;
  onDataImport: (data: ClusterType) => void;
  messageApi: any;
  onClose: () => void;
}

const LoadStorageManagerFile: React.FC<LoadStorageManagerFileProps> = ({
  localSource,
  onDataImport,
  messageApi,
  onClose,
}) => {
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
          const updatedContent = updateToLatestVersion(parsedContent);
          onDataImport(updatedContent);
          messageApi.success("Local storage has been restored successfully!");
          onClose(); // Close the modal after success
        }
      } catch (error) {
        console.error("Invalid JSON format", error);
        messageApi.error(
          "Invalid JSON format. Please upload a valid JSON file."
        );
      }
    };

    reader.readAsText(file);
  };

  const exportLocalStorage = () => {
    if (!localSource) {
      messageApi.error("No data to export. 'dashy' is empty.");
      return;
    }

    const updatedContent = updateToLatestVersion(localSource);
    const localStorageData = JSON.stringify(updatedContent);

    const blob = new Blob([localStorageData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dashySetup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    messageApi.success("Dashy setup exported successfully!");
  };

  return (
    <>
      <div className="text-[16px] font-semibold mb-2">Export Setup</div>
      <div className="text-sm text-gray-500 pb-2">
        Note: Exporting local storage will download a JSON file containing your
        configuration.
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
    </>
  );
};

export default LoadStorageManagerFile;
