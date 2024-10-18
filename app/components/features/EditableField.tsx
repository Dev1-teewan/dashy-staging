import { Input } from "antd";
import React, { useState } from "react";
import { EditFilled } from "@ant-design/icons";

interface EditableFieldProps {
  messageApi: any;
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
}

const EditableField = ({
  messageApi,
  value,
  onSave,
  placeholder = "Enter cluster name",
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Handle saving the new value on blur
  const handleBlur = () => {
    if (!inputValue || inputValue.trim() === "") {
      messageApi.error("This field is required."); // Show error message if input is empty
      return; // Prevent saving
    }

    setIsEditing(false);
    if (inputValue !== value) {
      onSave(inputValue); // Call the parent handler to save the updated value
    }
  };

  // Handle pressing the Enter key to save
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur(); // Call handleBlur to save the value
    }
  };

  return isEditing ? (
    <Input
      autoFocus
      value={inputValue}
      onBlur={handleBlur}
      placeholder={placeholder}
      onKeyPress={handleKeyPress} // Save on Enter key press
      onFocus={(e) => e.target.select()} // Automatically select the text when focused
      onClick={(e) => e.stopPropagation()} // Prevent the input from closing on click
      onChange={(e) => setInputValue(e.target.value)}
    />
  ) : (
    <div className="flex flex-row items-center gap-3">
      <strong className={value ? "" : "text-gray-400"}>
        {value || placeholder}
      </strong>

      <EditFilled
        className="text-[#06d6a0]"
        onClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
      />
    </div>
  );
};

export default EditableField;
