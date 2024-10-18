"use client";

import { FundFilled } from "@ant-design/icons";
import { useFetchAssets } from "@/app/hooks/useFetchAssets";
import { transactionColumns } from "../features/TableColumns";
import { Col, Collapse, Empty, Row, Table, Typography } from "antd";

const Transactions = () => {
  const { transactions = [], contextHolder } = useFetchAssets("transactions");

  return (
    <Row>
      {contextHolder}
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
                <div className="text-xl font-bold pl-2">
                  <FundFilled className="pr-3 text-[#06d6a0]" />
                  Transactions
                </div>
              ),
              children: (
                <Table
                  className="w-full"
                  tableLayout="fixed"
                  dataSource={transactions}
                  columns={transactionColumns}
                  scroll={{ x: "max-content" }}
                  pagination={transactions.length > 10 ? {} : false}
                  locale={{
                    emptyText: (
                      <Empty
                        className="min-h-[219px] flex flex-col justify-center items-center"
                        description={
                          <Typography.Text>
                            Please connect your wallet!
                          </Typography.Text>
                        }
                      />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default Transactions;
