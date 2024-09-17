"use client";

import { useState } from "react";
import InputTag from "../features/InputTag";
import { Col, Collapse, Empty, Row, Table } from "antd";
import { accountGroupColumns } from "../features/TableColumns";
import { EditableCell, EditableRow } from "../features/EditableCell";

const AccountGroup = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      alias: "Personal salary",
      address: "Cnc.....6qw",
      from: "Kraken company",
      to: "Raydium, DuY...8sH",
      purpose: "Yield Farming",
      balance: 0.12,
      token: "USDC",
    },
  ]);

  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = accountGroupColumns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title as string | undefined,
        handleSave,
      }),
    };
  });

  return (
    <Row>
      <Col span={24} className="!min-h-0">
        <Collapse
          ghost
          defaultActiveKey={["1"]}
          className="bg-[#141414] text-base"
          expandIconPosition="end"
          items={[
            {
              key: "1",
              label: <div className="text-xl font-bold pl-2">Group 1</div>,
              children: (
                <div className="pl-2">
                  <Row>
                    <Col span={4} className="font-bold text-lg">
                      Chain:
                    </Col>
                    <Col span={20}>Solana</Col>
                  </Row>
                  <Row>
                    <Col span={4} className="font-bold text-lg">
                      Group Name:
                    </Col>
                    <Col span={20}>
                      <InputTag />
                    </Col>
                  </Row>
                  <Table
                    components={components}
                    rowClassName={() => "editable-row"}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    className="mt-2"
                    locale={{ emptyText: <Empty /> }}
                    pagination={false}
                  />
                </div>
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default AccountGroup;
