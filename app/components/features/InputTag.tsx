"use client";

import type { InputRef } from "antd";
import { Flex, Input, Tag, theme, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: "100%",
  marginInlineEnd: 8,
};

const InputTag: React.FC = () => {
  const { token } = theme.useToken();

  const [tags, setTags] = useState<string[]>([]);
  const [groupTag, setGroupTag] = useLocalStorage("tagG1", "[]");

  const [inputValue, setInputValue] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  // Update tags from localStorage
  useEffect(() => {
    try {
      const parsedTags = JSON.parse(groupTag);
      if (Array.isArray(parsedTags)) {
        setTags(parsedTags);
      } else {
        setTags([]);
      }
    } catch {
      setTags([]);
    }
  }, [groupTag]);

  // Update localStorage when tags change
  useEffect(() => {
    // Only set localStorage when tags is updated
    if (tags.length > 0) {
      setGroupTag(JSON.stringify(tags));
    }
  }, [tags, setGroupTag]);

  // Focus input when visible
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // Focus edit input when editing
  useEffect(() => {
    if (editInputIndex !== null) {
      editInputRef.current?.focus();
    }
  }, [editInputIndex]);

  // Handle tag removal
  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags); // Update state, which will trigger localStorage update
  };

  // Show input field
  const showInput = () => {
    setInputVisible(true);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Confirm new tag input
  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];
      setTags(newTags); // Update state, which will trigger localStorage update
    }
    setInputVisible(false);
    setInputValue("");
  };

  // Handle editing input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  // Confirm edited tag
  const handleEditInputConfirm = () => {
    if (editInputIndex !== null) {
      const newTags = [...tags];
      newTags[editInputIndex] = editInputValue;
      setTags(newTags); // Update state, which will trigger localStorage update
      setEditInputIndex(-1);
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
      {tags.map((tag, index) => {
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
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          New Tag
        </Tag>
      )}
    </Flex>
  );
};

export default InputTag;
