"use client";

import type { ColumnType } from "antd/lib/table";
import { Col, Collapse, Row, Table } from "antd";
import { topAddressColumns } from "./TableColumns";
import { BarChartOutlined } from "@ant-design/icons";
import { useFetchAssets } from "@/app/hooks/useFetchAssets";
import { topAddressDataType } from "@/app/types/TableDataType";

const columns: ColumnType<topAddressDataType>[] = topAddressColumns;

const TopAddress = () => {
  const { topAddresses } = useFetchAssets("transactions");

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
                <div className="text-xl font-bold pl-2">
                  <BarChartOutlined className="pr-3 text-[#06d6a0]" />
                  Top 10 Engaged Addresses
                </div>
              ),
              children: (
                <Table
                  dataSource={topAddresses}
                  columns={topAddressColumns}
                  pagination={false}
                  className="pb-4"
                />
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default TopAddress;
