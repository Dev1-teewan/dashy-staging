"use client";

import { balanceColumns } from "../features/TableColumns";
import { Col, Collapse, Row, Table } from "antd";
import { CreditCardFilled } from "@ant-design/icons";
import { useFetchAssets } from "@/app/hooks/useFetchAssets";

const Balance = () => {
  const { dataSource = [], totalValue } = useFetchAssets("balance");

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
              label: (
                <div className="flex justify-between text-xl font-bold pl-2">
                  <div>
                    <CreditCardFilled className="pr-3 text-[#06d6a0]" />
                    Balance
                  </div>
                  <div>${totalValue}</div>
                </div>
              ),
              children: (
                <Table
                  dataSource={dataSource}
                  columns={balanceColumns}
                  pagination={dataSource.length > 10 ? {} : false}
                />
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default Balance;
