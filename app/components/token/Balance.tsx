"use client";

import { Col, Collapse, Empty, Row, Table, Typography } from "antd";
import { CreditCardFilled } from "@ant-design/icons";
import { balanceColumns } from "../features/TableColumns";
import { useFetchAssets } from "@/app/hooks/useFetchAssets";

const Balance = () => {
  const {
    dataSource = [],
    totalValue,
    contextHolder,
  } = useFetchAssets("balance");

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
                <div className="flex justify-between text-xl font-bold pl-2">
                  <div>
                    <CreditCardFilled className="pr-3 text-[#06d6a0]" />
                    Assets
                  </div>
                  <div>${totalValue}</div>
                </div>
              ),
              children: (
                <Table
                  dataSource={dataSource}
                  columns={balanceColumns}
                  pagination={dataSource.length > 10 ? {} : false}
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

export default Balance;
