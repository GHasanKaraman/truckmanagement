import { useState, useRef } from "react";
import React, { useContext, useEffect } from "react";
import { Input, Tag, Form, Select } from "antd";
import Highlighter from "react-highlight-words";

const { Option } = Select;

//======================================================
//Editable Table Components
//======================================================

const colors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
  "black",
];

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  selectOptions,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {type === "input" ? (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        ) : type === "colorSelect" ? (
          <Select ref={inputRef} onBlur={save} showSearch={true}>
            {colors.map((color) => {
              return (
                <Option key={color} value={color}>
                  <Tag color={color}>
                    <p style={{ height: 8 }}>{color}</p>
                  </Tag>
                </Option>
              );
            })}
          </Select>
        ) : type === "select" ? (
          <Select
            ref={inputRef}
            onBlur={save}
            showSearch={true}
            options={selectOptions}
          ></Select>
        ) : (
          <Select
            ref={inputRef}
            onBlur={save}
            showSearch={true}
            options={selectOptions}
            mode="multiple"
            allowClear
          ></Select>
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const searchColumn = (dataIndex, searchText) => ({
  filteredValue: [searchText],
  onFilter: (value, record) => {
    if (record[dataIndex]) {
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    }
  },
  render: (text) => {
    if (searchText === "") {
      return text;
    } else {
      return (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      );
    }
  },
});

export { EditableRow, EditableCell, searchColumn };
