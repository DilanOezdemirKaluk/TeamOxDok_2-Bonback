import React, { useState, useMemo, useEffect } from "react";
import { Column, Line } from "@ant-design/plots";
import { Card, Space, Table, Row, Col, Select } from "antd";
import { ListContent } from "../../../shared/components/ListContent/ListContent";

const { Option } = Select;

// Aggregat -> Parameter Mapping
const parameterMapping: Record<string, string[]> = {
  Dosiersystem: ["Chargengröße [kg]", "Rückteigmenge [kg]", "Wasser Korrekturwert [kg]", "Hefe Korrekturwert [°C]", "Soll-Wassertemperatur [°C]", "Soll-Teigtemperatur [°C]"],
  Kopfmaschine: ["Teigeinwaage [g]", "Wirkbewegung [-]", "Wirken quer/längst [%]", "Wirkbandspannung [-]", "Wirkbandposition vertikal [mm]", "Mehler 1 (getaktet) [%]", "Mehler 2 (getaktet) [%]", "Mehler 3 (getaktet) [%]", "Mehler 4 (optional) [%]"],
  Vorgärschrank: ["Laderband Geschwindigkeit [mm/s]", "Andruckstation 1 Oberband [%]", "Andruckstation 1 Unterband [mm]", "Andruckstation 1 Position Einlauf [-]", "Andruckstation 1 Position Auslauf [-]", "Andruckstation 1 Heben [-]", "Andruckstation 1 Senken [-]", "Andruckstation 2 Oberband [%]", "Andruckstation 2 Unterband [mm]", "Andruckstation 2 Position Einlauf [-]", "Andruckstation 2 Position Auslauf [-]", "Andruckstation 2 Heben [-]", "Andruckstation 2 Senken [-]", "Andruckstation 2 Mehler 1 [%]", "Andruckstation 3 Oberband [%]", "Andruckstation 3 Unterband [mm]", "Andruckstation 3 Position Einlauf [-]", "Andruckstation 3 Position Auslauf [-]", "Andruckstation 3 Heben [-]", "Andruckstation 3 Senken [-]", "Andruckstation 3 Mehler 2 [%]", "Transportband Start [-]", "Transportband Schrittlänge [mm]", "Transportband Drehzahl [%]", "Transportband Heben [-]", "Transportband Senken [-]", "Transportband Position Zentrier vor Stanze [-]", "Transportband Position Zentrier Stanze [-]", "Transportband Austragung [mm]"],
  Gärschrank: ["Temperatur Zone 1 [°C]", "Feuchtigkeit Zone 1 [%]", "Temperatur Absteifzone [°C]"],
  Fettbackwanne: ["Einlauf Reihenabstand [mm]", "Temperatur [°C]", "Füllhöhe [mm]", "Auslauf Reihenabstand [mm]", "Höhenverstellung [°]", "Stopper Start [-]", "Dauer [s]"],
  Sollich: ["Bodentunkwalze [%]", "Temperatur Sollich [°C]"],
  Vibrationsstreuer: ["Streurinne Geschwindigkeit [%]", "Streurinne vor Bunkerblech [mm]"]
};

type DataRow = { parameter: string; min: number; max: number; tag1: number; tag2: number; tag3: number; };

// --- Machine Data Live Chart ---
export const MachineDataLiveChart: React.FC<{ color?: string }> = ({ color = "rgb(82,196,26)" }) => {
  const [liveData, setLiveData] = useState(
    Array.from({ length: 30 }, (_, i) => ({ time: +(i * 0.1).toFixed(1), value: 175 + Math.random() * 5 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const nextValue = Math.max(170, Math.min(185, lastValue + (Math.random() - 0.5) * 1.5));
        const nextTime = +(prev[prev.length - 1].time + 0.1).toFixed(1);
        return [...prev.slice(-29), { time: nextTime, value: Number(nextValue.toFixed(1)) }];
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const config = {
    data: liveData,
    xField: "time",
    yField: "value",
    smooth: true,
    lineStyle: { stroke: color, lineWidth: 2.5 },
    area: { style: { fill: color.replace(")", ",0.2)").replace("rgb", "rgba") } },
    xAxis: { title: { text: "Zeit [s]" } },
    yAxis: { title: { text: "Maschinenwert [°C]" }, min: 170, max: 185 },
    animation: { update: { duration: 120, easing: "linear" } },
    autoFit: false,
    height: 300,
  };

  return <Line {...config} />;
};

// --- ReportList ---
export const ReportList: React.FC = () => {
  // Filter States
  const [selectedZeitraum, setSelectedZeitraum] = useState("letzte 3 Tage");
  const [selectedAggregat, setSelectedAggregat] = useState("Dosiersystem");
  const [selectedParameter, setSelectedParameter] = useState(parameterMapping["Dosiersystem"][0]);
  const parameterOptions = useMemo(() => parameterMapping[selectedAggregat] || [], [selectedAggregat]);

  const [selectedBearbZeitraum, setSelectedBearbZeitraum] = useState("letzte 3 Tage");
  const [selectedBearbAggregat, setSelectedBearbAggregat] = useState("Dosiersystem");
  const [selectedSchicht, setSelectedSchicht] = useState("früh");

  const rawData: DataRow[] = [
    { parameter: "Chargengröße [kg]", min: 210, max: 220, tag1: 215, tag2: 217, tag3: 219 },
    { parameter: "Wassertemperatur [°C]", min: 2, max: 6, tag1: 5, tag2: 3, tag3: 4 },
    { parameter: "Soll-Teigtemperatur [°C]", min: 24, max: 27, tag1: 25, tag2: 26, tag3: 24 },
    { parameter: "Teigeinwaage [g]", min: 46, max: 48, tag1: 47, tag2: 46.5, tag3: 47.5 },
    { parameter: "Fettwanne Temp [°C]", min: 175, max: 180, tag1: 178, tag2: 176, tag3: 179 },
  ];

  const filteredData = useMemo(() => rawData.filter(d => d.parameter === selectedParameter), [selectedParameter, rawData]);
  const abweichungData = filteredData.flatMap(item => [
    { time: "Tag 1", value: item.tag1 },
    { time: "Tag 2", value: item.tag2 },
    { time: "Tag 3", value: item.tag3 },
  ]);

  const lineConfig1 = filteredData.length ? {
    data: abweichungData,
    xField: "time",
    yField: "value",
    smooth: true,
    point: { size: 4 },
    xAxis: { title: { text: "Produktionstag" } },
    yAxis: { min: filteredData[0].min - 5, max: filteredData[0].max + 5, title: { text: filteredData[0].parameter } },
  } : {};

  const columnData = filteredData.map(item => {
    const allTags = [item.tag1, item.tag2, item.tag3];
    return { grund: item.parameter, anzahl: allTags.filter(v => v < item.min || v > item.max).length };
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

  // Bearbeitungsverhalten-Daten pro Tag
  const filteredBearbData = useMemo(() => {
    const tage = selectedBearbZeitraum === "letzte 3 Tage" ? 3 : selectedBearbZeitraum === "letzte 7 Tage" ? 7 : 30;
    return Array.from({ length: tage }, (_, i) => ({
      tag: `Tag ${i + 1}`,
      status: Math.random() > 0.5 ? "Bearbeitung" : "Keine Bearbeitung",
    }));
  }, [selectedBearbZeitraum, selectedBearbAggregat, selectedSchicht]);

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

        {/* Produktionsdaten Filter */}
        <Card style={{ backgroundColor: "#e6f0ff", borderRadius: 12 }} bodyStyle={{ padding: "16px" }}>
          <Space size="large" wrap>
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
            <Select value={selectedZeitraum} onChange={setSelectedZeitraum} style={{ width: 180 }}>
              <Option value="letzte 3 Tage">Letzte 3 Tage</Option>
              <Option value="letzte 7 Tage">Letzte 7 Tage</Option>
              <Option value="letzte 30 Tage">Letzte 30 Tage</Option>
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
            <Select value={selectedAggregat} onChange={agg => { setSelectedAggregat(agg); setSelectedParameter(parameterMapping[agg][0]); }} style={{ width: 220 }}>
              {Object.keys(parameterMapping).map(agg => <Option key={agg} value={agg}>{agg}</Option>)}
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>Parameter:</span>
            <Select value={selectedParameter} onChange={setSelectedParameter} style={{ width: 260 }}>
              {parameterOptions.map(param => <Option key={param} value={param}>{param}</Option>)}
            </Select>
          </Space>
        </Card>

        {/* Diagramme Abweichung & Änderungsgründe */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}><Card title="📈 Abweichungsanalyse – Chargengröße"><Line {...lineConfig1} style={{ height: 300 }} /></Card></Col>
          <Col xs={24} md={12}><Card title="🧾 Änderungsgründe (Toleranzverletzung)"><Column {...columnConfig} style={{ height: 300 }} /></Card></Col>
        </Row>

        {/* Machine Data Sensor A & B */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}><Card title="⚙️ Machine Data – Sensor A"><MachineDataLiveChart color="rgb(82,196,26)" /></Card></Col>
          <Col xs={24} md={12}><Card title="⚙️ Machine Data – Sensor B"><MachineDataLiveChart color="rgb(255,165,0)" /></Card></Col>
        </Row>

        {/* Produktionsdaten Tabelle */}
        <Card title="📊 Produktionsdaten (statisch)">
          <Table dataSource={filteredData} columns={columns} pagination={false} rowKey="parameter" />
        </Card>

        {/* Bearbeitungsverhalten Card */}
<Card title="🟩 Bearbeitungsverhalten" style={{ borderRadius: 12 }}>
  {/* Filter direkt unter dem Titel */}
  <Space size="large" wrap style={{ marginBottom: 16, backgroundColor: "#e6f0ff", padding: 8, borderRadius: 8 }}>
    <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
    <Select value={selectedBearbZeitraum} onChange={setSelectedBearbZeitraum} style={{ width: 180 }}>
      <Option value="letzte 3 Tage">Letzte 3 Tage</Option>
      <Option value="letzte 7 Tage">Letzte 7 Tage</Option>
      <Option value="letzte 30 Tage">Letzte 30 Tage</Option>
    </Select>

    <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
    <Select value={selectedBearbAggregat} onChange={setSelectedBearbAggregat} style={{ width: 220 }}>
      {Object.keys(parameterMapping).map(agg => <Option key={agg} value={agg}>{agg}</Option>)}
    </Select>

    <span style={{ color: "#1890ff", fontWeight: 500 }}>Schicht:</span>
    <Select value={selectedSchicht} onChange={setSelectedSchicht} style={{ width: 180 }}>
      <Option value="früh">Früh</Option>
      <Option value="spät">Spät</Option>
      <Option value="nacht">Nacht</Option>
    </Select>
  </Space>

  {/* Bearbeitungsverhalten Diagramm */}
  <Line
    data={filteredBearbData}
    xField="tag"
    yField="status"
    smooth={false}
    stepType="hv"
    yAxis={{
      type: 'cat',
      title: { text: "Bearbeitung" },
      values: ["Keine Bearbeitung", "Bearbeitung"], // Bearbeitung oben
    }}
    style={{ height: 300 }}
    tooltip={{
      formatter: (datum: any) => ({
        name: datum.tag,
        value: datum.status,
      }),
    }}
  />
</Card>
      </Space>
    </ListContent>
  );
};
