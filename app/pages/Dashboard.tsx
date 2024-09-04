"use client";

import { useEffect, useState } from "react";
import { fetchAssets } from "../utils/Utils";
import { Col, Collapse, Row, Table } from "antd";
import { columns } from "../components/TableColumns";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [dataSource, setDataSource] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  const searchParams = useSearchParams();
  const publicKey = searchParams.get("watching") ?? "";

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchAssets(publicKey);
  
      if (response.status === "success") {
        setDataSource(response.dataSource);
        setTotalValue(response.totalValue);
      } else {
        console.log("Error fetching assets", response);
        router.push("/");
      }
    };
  
    fetchData();
  }, [publicKey, router]);

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
