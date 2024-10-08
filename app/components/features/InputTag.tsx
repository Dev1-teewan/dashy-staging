"use client";

import type { InputRef } from "antd";
import { arraysEqual } from "@/app/utils/Utils";
import { Flex, Input, Tag, theme, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: "100%",
  marginInlineEnd: 8,
};

interface InputTagProps {
  initialTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const InputTag: React.FC<InputTagProps> = ({ initialTags, onTagsChange }) => {
  const { token } = theme.useToken();
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const [editInputIndex, setEditInputIndex] = useState<number | null>(null);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  // Sync localTags with initialTags on prop change
  useEffect(() => {
    setLocalTags(initialTags);
  }, [initialTags]);

  // Notify parent of tags changes
  useEffect(() => {
    if (!arraysEqual(localTags, initialTags)) onTagsChange(localTags); // Trigger parent update with current tags
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTags]);

  const handleClose = (removedTag: string) => {
    const updatedTags = localTags.filter((tag) => tag !== removedTag);
    setLocalTags(updatedTags);
  };

  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !localTags.includes(inputValue)) {
      const updatedTags = [...localTags, inputValue];
      setLocalTags(updatedTags);
      setInputVisible(false);
      setInputValue("");
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    if (editInputIndex !== null) {
      const updatedTags = [...localTags];
      updatedTags[editInputIndex] = editInputValue;
      setLocalTags(updatedTags);
      setEditInputIndex(null);
      setEditInputValue("");
    }
  };

  const tagPlusStyle: React.CSSProperties = {
    height: "100%",
    background: "#141414",
    borderColor: token.colorBorder,
    borderStyle: "dashed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  };

  return (
    <Flex gap="4px 0" wrap className="!h-full">
      {localTags.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size="small"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }
        const isLongTag = tag.length > 20;
        const tagElem = (
          <Tag
            key={tag}
            closeIcon={<CloseOutlined style={{ color: "#f1f1f1" }} />}
            className="flex items-center justify-center"
            style={{ userSelect: "none" }}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  setEditInputIndex(index);
                  setEditInputValue(tag);
                  e.preventDefault();
                }
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag
          style={tagPlusStyle}
          icon={<PlusOutlined />}
          onClick={showInput}
        ></Tag>
      )}
    </Flex>
  );
};

export default InputTag;
