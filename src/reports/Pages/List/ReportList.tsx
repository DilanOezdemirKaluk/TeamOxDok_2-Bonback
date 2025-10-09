import React from "react";
import { Column, Line } from "@ant-design/plots";
import { Card, Space, Table, Row, Col } from "antd";
import { ListContent } from "../../../shared/components/ListContent/ListContent";

type DataRow = {
  parameter: string;
  min: number;
  max: number;
  tag1: number;
  tag2: number;
  tag3: number;
};

export const ReportList: React.FC = () => {
  const rawData: DataRow[] = [
    {
      parameter: "Chargengröße [kg]",
      min: 210,
      max: 220,
      tag1: 215,
      tag2: 217,
      tag3: 219,
    },
    {
      parameter: "Wassertemperatur [°C]",
      min: 2,
      max: 6,
      tag1: 5,
      tag2: 3,
      tag3: 4,
    },
    {
      parameter: "Soll-Teigtemperatur [°C]",
      min: 24,
      max: 27,
      tag1: 25,
      tag2: 26,
      tag3: 24,
    },
    {
      parameter: "Teigeinwaage [g]",
      min: 46,
      max: 48,
      tag1: 47,
      tag2: 46.5,
      tag3: 47.5,
    },
    {
      parameter: "Fettwanne Temp [°C]",
      min: 175,
      max: 180,
      tag1: 178,
      tag2: 176,
      tag3: 179,
    },
  ];

  const chargenIndex = 0;
  const abweichungData = [
    { time: "Tag 1", value: rawData[chargenIndex].tag1 },
    { time: "Tag 2", value: rawData[chargenIndex].tag2 },
    { time: "Tag 3", value: rawData[chargenIndex].tag3 },
  ];

  const lineConfig1 = {
    data: abweichungData,
    xField: "time",
    yField: "value",
    smooth: true,
    animation: false,
    point: { size: 4 },
    xAxis: { title: { text: "Produktionstag" } },
    yAxis: {
      min: rawData[chargenIndex].min - 5,
      max: rawData[chargenIndex].max + 5,
      title: { text: rawData[chargenIndex].parameter },
    },
  };

  const columnData = rawData.map((item) => {
    const allTags = [item.tag1, item.tag2, item.tag3];
    const outOfTol = allTags.filter((v) => v < item.min || v > item.max).length;
    return { grund: item.parameter, anzahl: outOfTol };
  });

  const columnConfig = {
    data: columnData,
    xField: "grund",
    yField: "anzahl",
    label: { position: "top" as const },
    columnWidthRatio: 0.6,
    xAxis: { label: { autoHide: true } },
    yAxis: { title: { text: "Außerhalb Toleranz" } },
  };

  const toleranceData = rawData.map((item) => {
    const avg = (item.tag1 + item.tag2 + item.tag3) / 3;
    return {
      parameter: item.parameter,
      status: avg >= item.min && avg <= item.max ? 1 : 0,
    };
  });

  const lineConfig2 = {
    data: toleranceData,
    xField: "parameter",
    yField: "status",
    smooth: false,
    stepType: "hv" as const,
    yAxis: {
      min: 0,
      max: 1,
      tickCount: 2,
      title: { text: "Toleranz erfüllt" },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: "Status",
        value: datum.status === 1 ? "Innerhalb Toleranz" : "Außerhalb Toleranz",
      }),
    },
  };

  const fettwanneIndex = 4;
  const fettData = [
    { time: "Tag 1", value: rawData[fettwanneIndex].tag1 },
    { time: "Tag 2", value: rawData[fettwanneIndex].tag2 },
    { time: "Tag 3", value: rawData[fettwanneIndex].tag3 },
  ];

  const liveConfig = {
    data: fettData,
    xField: "time",
    yField: "value",
    smooth: true,
    animation: false,
    point: { size: 4 },
    xAxis: { title: { text: "Produktionstag" } },
    yAxis: {
      min: rawData[fettwanneIndex].min - 5,
      max: rawData[fettwanneIndex].max + 5,
      title: { text: rawData[fettwanneIndex].parameter },
    },
  };

  const columns = [
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    { title: "MIN", dataIndex: "min", key: "min" },
    { title: "MAX", dataIndex: "max", key: "max" },
    { title: "Tag 1", dataIndex: "tag1", key: "tag1" },
    { title: "Tag 2", dataIndex: "tag2", key: "tag2" },
    { title: "Tag 3", dataIndex: "tag3", key: "tag3" },
  ];

  return (
    <ListContent>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="📈 Abweichungsanalyse – Chargengröße">
              <Line {...lineConfig1} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🧾 Änderungsgründe (Toleranzverletzung)">
              <Column {...columnConfig} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🟩 Bearbeitungsverhalten">
              <Line {...lineConfig2} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🌡️ Maschinendaten – Fettwanne Temperatur">
              <Line {...liveConfig} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>

        <Card title="📊 Produktionsdaten (statisch)">
          <Table
            dataSource={rawData}
            columns={columns}
            pagination={false}
            rowKey="parameter"
          />
        </Card>
      </Space>
    </ListContent>
  );
};
