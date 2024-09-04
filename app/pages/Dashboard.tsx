import { fetchAssets } from "../utils/Utils";
import { Col, Collapse, Row, Table } from "antd";
import { columns } from "../components/TableColumns";

const Dashboard = async () => {
  const response = await fetchAssets();
  let dataSource = [];
  let totalValue = 0;

  if (response.status === "success") {
    dataSource = response.dataSource;
    totalValue = response.totalValue;
  }

  return (
    <div className="max-w-[75vw] w-full">
      <div className="text-left mt-3 mb-7 text-2xl font-bold">Dashboard</div>
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
                  <div className="text-xl font-bold">
                    Balance - ${totalValue}
                  </div>
                ),
                children: (
                  <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={dataSource.length > 10 ? {} : false}
                  />
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
