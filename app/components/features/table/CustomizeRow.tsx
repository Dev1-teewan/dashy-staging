import { Button } from "antd";
import { CSS } from "@dnd-kit/utilities";
import { Form, Input, InputRef } from "antd";
import { FormInstance } from "antd/lib/form";
import { useSortable } from "@dnd-kit/sortable";
import { HolderOutlined } from "@ant-design/icons";
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
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
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
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
  [key: string]: any;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

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

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
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

// Combine editable + draggable components
const combinedComponents = {
  body: {
    row: EditableDraggableRow,
    cell: EditableCell,
  },
};

export { combinedComponents, DragHandle };
