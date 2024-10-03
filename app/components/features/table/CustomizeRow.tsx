import { CSS } from "@dnd-kit/utilities";
import { Button, Tag, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import { useSortable } from "@dnd-kit/sortable";
import { HolderOutlined } from "@ant-design/icons";
import { Form, Input, InputRef, Select } from "antd";
import React, { useContext, useState, useRef, useEffect, useMemo } from "react";

// Editable Context
const EditableContext = React.createContext<FormInstance<any> | null>(null);

// Row Context for Drag Handle
interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: any;
}

const RowContext = React.createContext<RowContextProps>({});

// Editable + Draggable Row
const EditableDraggableRow: React.FC<{
  index: number;
  "data-row-key": string;
  style?: React.CSSProperties;
}> = ({ index, "data-row-key": rowKey, ...props }) => {
  const [form] = Form.useForm();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowKey });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9 } : {}),
    ...(rowKey === undefined ? { cursor: "default" } : {}), // Disable for empty rows
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <RowContext.Provider value={contextValue}>
          <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
      </EditableContext.Provider>
    </Form>
  );
};

// Editable Cell
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  type: string;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
  [key: string]: any;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  type = "input", // Default to input
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const selectRef = useRef<any>(null);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (editing) {
      if (type === "input" && inputRef.current) {
        inputRef.current.focus();
      } else if (type === "select" && selectRef.current) {
        selectRef.current.focus();
      }
    }
  }, [editing, type]);

  const toggleEdit = () => {
    setEditing(!editing);
    if (form) {
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    }
  };

  const save = async () => {
    try {
      if (form) {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      }
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  // Check if the column is editable and what type it is
  if (editable) {
    if (editing) {
      childNode =
        type === "select" ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            // rules={[{ required: true, message: `${title} is required.` }]}
          >
            <Select
              ref={selectRef}
              mode="tags"
              style={{ width: "200px" }}
              onBlur={save}
              tokenSeparators={[","]}
            />
          </Form.Item>
        ) : (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            // rules={[{ required: true, message: `${title} is required.` }]}
          >
            <Input ref={inputRef} onPressEnter={save} onBlur={save} />
          </Form.Item>
        );
    } else {
      // Display tags or the input value in a read-only format
      const tags = Array.isArray(record[dataIndex]) ? record[dataIndex] : [];
      childNode =
        type === "select" ? (
          <div
            className="editable-cell-value-wrap"
            style={{ paddingRight: 24 }}
            onClick={toggleEdit}
          >
            {tags.length === 0
              ? "-"
              : tags.map((tag: string) => {
                  const isLongTag = tag.length > 20;
                  return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                      <Tag>{`${tag.slice(0, 4)}...${tag.slice(-4)}`}</Tag>
                    </Tooltip>
                  ) : (
                    <Tag key={tag}>{tag}</Tag>
                  );
                })}
          </div>
        ) : (
          <div
            className="editable-cell-value-wrap"
            style={{ paddingRight: 24 }}
            onClick={toggleEdit}
          >
            {Array.isArray(children) && children[1] === "" ? "-" : children}
          </div>
        );
    }
  }

  return <td {...restProps}>{childNode}</td>;
};

// Combine editable + draggable components
const combinedComponents = {
  body: {
    row: EditableDraggableRow,
    cell: EditableCell,
  },
};

// Drag Handle
const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined style={{ color: "#f1f1f1" }} />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

export { combinedComponents, DragHandle };
