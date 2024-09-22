"use client";

import QRReader from "../features/QRReader";
import { CloseOutlined } from "@ant-design/icons";
import { encryptData } from "../../utils/encryption";
import React, { ChangeEvent, useState } from "react";
import { Button, Divider, message, Modal, QRCode, Upload } from "antd";

interface LoadStorageManagerProps {
  localSource: any;
  onDataImport: (data: any[]) => void;
}

const LoadStorageManager = ({
  localSource,
  onDataImport,
}: LoadStorageManagerProps) => {
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  //   console.log("localSource", encryptData(JSON.stringify(localSource)));

  //   function doDownload(url: string, fileName: string) {
  //     const a = document.createElement("a");
  //     a.download = fileName;
  //     a.href = url;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //   }

  //   const downloadQRCode = () => {
  //     const canvas = document
  //       .getElementById("myqrcode")
  //       ?.querySelector<HTMLCanvasElement>("canvas");
  //     if (canvas) {
  //       const url = canvas.toDataURL();
  //       doDownload(url, "DashySetup.png");
  //     }
  //   };

  //   const handleScanSuccess = (result: string) => {
  //     console.log(result);
  //     messageApi.open({
  //       type: "success",
  //       content: "QR Code Scanned Successfully",
  //     });
  //   };

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
          onDataImport(JSON.parse(content));
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

  //   const [imageFile, setImageFile] = useState(null);
  //   const [decodedText, setDecodedText] = useState("");

  //   const qrCodeReader = new BrowserQRCodeReader();

  //   const handleFileChange1 = (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //       setImageFile(file);
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         const imageElement = new Image();
  //         imageElement.src = reader.result as string;
  //         imageElement.onload = () => {
  //           qrCodeReader
  //             .decodeFromImage(imageElement)
  //             .then((result) => {
  //               setDecodedText(result.getText());
  //             })
  //             .catch((error) => {
  //               console.error("Error decoding QR code:", error);
  //             });
  //         };
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  return (
    <div>
      {contextHolder}
      <Button className="custom-button" onClick={() => setOpen(true)}>
        Import/Export Setup
      </Button>

      <Modal
        open={open}
        footer={null}
        title="Export Local Storage"
        onCancel={() => setOpen(false)}
        closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
      >
        {/* <div
          id="myqrcode"
          className="flex flex-col items-center justify-center"
        >
          <QRCode value={encryptData(JSON.stringify(localSource))} />
          <Button className="w-full" onClick={downloadQRCode}>
            Download
          </Button>
        </div> */}
        <div className="text-sm text-gray-500 pb-2">
          Note: Exporting local storage will download a JSON file containing
        </div>
        <Button onClick={exportLocalStorage} className="w-full">
          Export Setup
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
        {/* <QRReader onScanSuccess={handleScanSuccess} /> */}
        {/* <input type="file" accept="image/*" onChange={handleFileChange1} />
        <Upload
          accept="image/*"
          beforeUpload={(file) => {
            // handleImageUpload(file);
            return false; // Prevent automatic upload
          }}
          showUploadList={false}
        >
          <Button>Upload QR Code Image</Button>
        </Upload> */}
      </Modal>
    </div>
  );
};

export default LoadStorageManager;
