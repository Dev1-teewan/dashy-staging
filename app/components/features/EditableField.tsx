import { Input, message } from "antd";
import React, { useState } from "react";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
}

const EditableField = ({ value, onSave, placeholder }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Handle saving the new value on blur
  const handleBlur = () => {
    if (inputValue.trim() === "") {
      message.error("This field is required."); // Show error message if input is empty
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
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={(e) => e.target.select()} // Automatically select the text when focused
      onKeyPress={handleKeyPress} // Save on Enter key press
      autoFocus
      placeholder={placeholder}
    />
  ) : (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer min-w-32">
      <strong>{value || placeholder}</strong>
    </div>
  );
};

export default EditableField;
