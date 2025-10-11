import React, { useState, useMemo, useEffect } from "react";
import { Column } from "@ant-design/plots";
import { Card, Space, Table, Row, Col, Select } from "antd";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Line } from "@ant-design/plots";
import { values } from "lodash";

// Chart.js imports
import { Line as ChartLine, Pie as ChartPie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const { Option } = Select;

// Aggregat -> Parameter Mapping
const parameterMapping: Record<string, string[]> = {
  Dosiersystem: [
    "Chargengröße [kg]",
    "Rückteigmenge [kg]",
    "Wasser Korrekturwert [kg]",
    "Hefe Korrekturwert [°C]",
    "Soll-Wassertemperatur [°C]",
    "Soll-Teigtemperatur [°C]",
  ],
  Kopfmaschine: [
    "Teigeinwaage [g]",
    "Wirkbewegung [-]",
    "Wirken quer/längst [%]",
    "Wirkbandspannung [-]",
    "Wirkbandposition vertikal [mm]",
  ],
  Vorgärschrank: [
    "Geschwindigkeit [mm/s]",
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Unterlauf [-]",
    "Heben [-]",
    "Senken [-]",
  ],
  Gärschrank: [
    "Temperatur Zone 1 [°C]",
    "Feuchtigkeit Zone 1 [%]",
    "Temperatur Absteifzone [°C]",
  ],
  Fettbackwanne: [
    "Einlauf Reihenabstand [mm]",
    "Temperatur [°C]",
    "Füllhöhe [mm]",
    "Auslauf Reihenabstand [mm]",
  ],
  Sollich: ["Bodentunkwalze [%]", "Temperatur Sollich [°C]"],
  Vibrationsstreuer: [
    "Streurinne Geschwindigkeit [%]",
    "Streurinne vor Bunkerblech [mm]",
  ],
};

type DataRow = {
  aggregat: string;
  parameter: string;
  min: number;
  max: number;
  tag1?: number;
  tag2?: number;
  tag3?: number;
  // Add more tags if needed, e.g. tag4?: number; tag5?: number;
};

// --- Machine Data Live Chart ---
export const MachineDataLiveChart: React.FC<{ color?: string }> = ({
  color = "rgb(82,196,26)",
}) => {
  const [liveData, setLiveData] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      time: +(i * 0.1).toFixed(1),
      value: 175 + Math.random() * 5,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => {
        const lastValue = prev[prev.length - 1].value;
        const nextValue = Math.max(
          170,
          Math.min(185, lastValue + (Math.random() - 0.5) * 1.5)
        );
        const nextTime = +(prev[prev.length - 1].time + 0.1).toFixed(1);
        return [
          ...prev.slice(-29),
          { time: nextTime, value: Number(nextValue.toFixed(1)) },
        ];
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const config = {
    data: liveData,
    xField: "time",
    yField: "value",
    smooth: true,
    // remove top labels so descriptions are displayed on the x-axis at the bottom
    label: false,
    // show x-axis labels at the bottom, rotated to avoid overlap and offset for spacing
    lineStyle: { stroke: color, lineWidth: 2.5 },
    area: {
      style: { fill: color.replace(")", ",0.2)").replace("rgb", "rgba") },
    },
    xAxis: { title: { text: "Zeit [s]" } },
    yAxis: { title: { text: "Maschinenwert [°C]" }, min: 170, max: 185 },
    animation: { update: { duration: 120, easing: "linear" } },
    autoFit: true,
    height: 300,
  };

  return <Line {...config} />;
};

// --- ReportList ---
export const ReportList: React.FC = () => {
  const [selectedZeitraum, setSelectedZeitraum] = useState("letzte 3 Tage");
  const [selectedAggregat, setSelectedAggregat] = useState("Dosiersystem");
  const [selectedParameter, setSelectedParameter] = useState(
    parameterMapping["Dosiersystem"][0]
  );
  const parameterOptions = useMemo(
    () => parameterMapping[selectedAggregat] || [],
    [selectedAggregat]
  );

  const [selectedBearbZeitraum, setSelectedBearbZeitraum] =
    useState("letzte 3 Tage");
  const [selectedBearbAggregat, setSelectedBearbAggregat] =
    useState("Dosiersystem");
  const [selectedSchicht, setSelectedSchicht] = useState("früh");

  // Beispiel-Daten mit Aggregat-Feld
  const rawData: DataRow[] = useMemo(
    () => [
      // Dosiersystem
      {
        aggregat: "Dosiersystem",
        parameter: "Chargengröße [kg]",
        min: 210,
        max: 220,
        tag1: 210,
        tag2: 210,
        tag3: 215,
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Rückteigmenge [kg]",
        min: 30,
        max: 45,
        tag1: 30,
        tag2: 30,
        tag3: 30,
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Wasser Korrekturwert [kg]",
        min: -1.3,
        max: -0.4,
        tag1: -0.6,
        tag2: -0.6,
        tag3: -1.3,
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Hefe Korrekturwert [°C]",
        min: -1.6,
        max: -0.9,
        tag1: -1.6,
        tag2: -1.6,
        tag3: -1.2,
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Wassertemperatur [°C]",
        min: 2,
        max: 13,
        tag1: 2,
        tag2: 2,
        tag3: 3,
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Teigtemperatur [°C]",
        min: 24,
        max: 35,
        tag1: 24,
        tag2: 24,
        tag3: 24,
      },

      // Kopfmaschine
      {
        aggregat: "Kopfmaschine",
        parameter: "Teigeinwaage [g]",
        min: 46,
        max: 66,
        tag1: 46,
        tag2: 46,
        tag3: 46,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbewegung [-]",
        min: 170,
        max: 183,
        tag1: 170,
        tag2: 170,
        tag3: 170,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirken quer/längst [%]",
        min: 65,
        max: 85,
        tag1: 65,
        tag2: 65,
        tag3: 65,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandspannung [-]",
        min: 65,
        max: 85,
        tag1: 65,
        tag2: 65,
        tag3: 65,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandposition vertikal [mm]",
        min: 9,
        max: 19,
        tag1: 9,
        tag2: 9,
        tag3: 9,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 1 (getaktet) [%]",
        min: 3,
        max: 14,
        tag1: 3,
        tag2: 3,
        tag3: 3,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 2 (getaktet) [%]",
        min: 3,
        max: 17,
        tag1: 3,
        tag2: 3,
        tag3: 3,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 3 (getaktet) [%]",
        min: 2,
        max: 22,
        tag1: 2,
        tag2: 2,
        tag3: 2,
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 4 (optional) [%]",
        min: 1,
        max: 20,
        tag1: 1,
        tag2: 1,
        tag3: 1,
      },

      // Vorgärschrank Andruckstationen
      {
        aggregat: "Vorgärschrank",
        parameter: "Geschwindigkeit [mm/s]",
        min: 106,
        max: 126,
        tag1: 106,
        tag2: 106,
        tag3: 106,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Oberband [%]",
        min: 0,
        max: 15,
        tag1: 0,
        tag2: 0,
        tag3: 0,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Unterband [mm]",
        min: 196,
        max: 216,
        tag1: 196,
        tag2: 196,
        tag3: 196,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Position Einlauf [-]",
        min: 40,
        max: 60,
        tag1: 40,
        tag2: 40,
        tag3: 40,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Position Auslauf [-]",
        min: 34,
        max: 54,
        tag1: 34,
        tag2: 34,
        tag3: 34,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Heben [-]",
        min: 105,
        max: 125,
        tag1: 105,
        tag2: 105,
        tag3: 105,
      },
      {
        aggregat: "Vorgärschrank",
        parameter: "Senken [-]",
        min: 180,
        max: 200,
        tag1: 180,
        tag2: 180,
        tag3: 180,
      },

      // Gärschrank
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Zone 1 [°C]",
        min: 39,
        max: 55,
        tag1: 40,
        tag2: 40,
        tag3: 39,
      },
      {
        aggregat: "Gärschrank",
        parameter: "Feuchtigkeit Zone 1 [%]",
        min: 65,
        max: 80,
        tag1: 65,
        tag2: 65,
        tag3: 65,
      },
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Absteifzone [°C]",
        min: 19,
        max: 30,
        tag1: 19,
        tag2: 19,
        tag3: 19,
      },

      // Fettbackwanne
      {
        aggregat: "Fettbackwanne",
        parameter: "Einlauf Reihenabstand [mm]",
        min: 107,
        max: 120,
        tag1: 107,
        tag2: 107,
        tag3: 107,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Temperatur [°C]",
        min: 178,
        max: 190,
        tag1: 178,
        tag2: 178,
        tag3: 178,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Füllhöhe [mm]",
        min: 105,
        max: 120,
        tag1: 105,
        tag2: 105,
        tag3: 105,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Auslauf Reihenabstand [mm]",
        min: 224,
        max: 234,
        tag1: 224,
        tag2: 224,
        tag3: 224,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Höhenverstellung [°]",
        min: 140,
        max: 160,
        tag1: 140,
        tag2: 140,
        tag3: 140,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Stopper Start [-]",
        min: 260,
        max: 280,
        tag1: 260,
        tag2: 260,
        tag3: 260,
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Dauer [s]",
        min: 355,
        max: 365,
        tag1: 355,
        tag2: 355,
        tag3: 355,
      },

      // Sollich
      {
        aggregat: "Sollich",
        parameter: "Bodentunkwalze [%]",
        min: 85,
        max: 100,
        tag1: 85,
        tag2: 85,
        tag3: 85,
      },
      {
        aggregat: "Sollich",
        parameter: "Temperatur Sollich [°C]",
        min: 44.4,
        max: 53,
        tag1: 44.4,
        tag2: 45,
        tag3: 44.4,
      },

      // Vibrationsstreuer
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne Geschwindigkeit [%]",
        min: 65,
        max: 77,
        tag1: 65,
        tag2: 65,
        tag3: 65,
      },
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne vor Bunkerblech [mm]",
        min: 7,
        max: 17,
        tag1: 7,
        tag2: 7,
        tag3: 7,
      },
    ],
    []
  );

  // --- Abweichungsanalyse nach Aggregat + Parameter ---
  const filteredData = useMemo(
    () =>
      rawData.filter(
        (d) =>
          d.aggregat === selectedAggregat && d.parameter === selectedParameter
      ),
    [selectedAggregat, selectedParameter, rawData]
  );

  const tageCount =
    selectedZeitraum === "letzter Tag"
      ? 1
      : selectedZeitraum === "letzte 3 Tage"
        ? 3
        : selectedZeitraum === "letzte 7 Tage"
          ? 7
          : 30;

  const abweichungData = filteredData.flatMap((item) =>
    Array.from({ length: tageCount }, (_, i) => {
      const tagKey = `tag${i + 1}` as keyof DataRow;
      return {
        time: `Tag ${i + 1}`,
        value: item[tagKey] ?? item.tag1, // Falls kein Wert, nutze Tag 1
      };
    })
  );
  // Build a stable config for the Abweichungsanalyse line chart.
  // Use fixed height and autoFit:false so the chart doesn't jump/rescale when filters change.
  let lineConfig1: any = {
    data: abweichungData,
    xField: "time",
    yField: "value",
    smooth: true,
    point: { size: 4 },
    xAxis: { title: { text: "Produktionstag" } },
    autoFit: false,
    height: 300,
  };

  if (filteredData.length) {
    // set y-axis min/max based on the parameter min/max
    let minVal = filteredData[0].min;
    let maxVal = filteredData[0].max;

    // if min and max are identical, add a small padding so the region is visible
    if (minVal === maxVal) {
      const pad = Math.max(0.5, Math.abs(minVal) * 0.01);
      minVal = Number((minVal - pad).toFixed(2));
      maxVal = Number((maxVal + pad).toFixed(2));
    }

    // create three series: Actual, Min, Max so we avoid annotation encoding issues
    const actualSeries = abweichungData.map((d) => ({ ...d, series: "Wert" }));
    const minSeries = abweichungData.map((d) => ({
      time: d.time,
      value: minVal,
      series: "MIN",
    }));
    const maxSeries = abweichungData.map((d) => ({
      time: d.time,
      value: maxVal,
      series: "MAX",
    }));
    const averageSeries = abweichungData.map((d) => ({
      time: d.time,
      value: minVal + Math.random() * (maxVal - minVal), // min-max arası random değer
      series: "AVERAGE",
    }));

    const merged = [...actualSeries, ...minSeries, ...maxSeries, ...averageSeries];

    lineConfig1 = {
      data: merged,
      xField: "time",
      yField: "value",
      seriesField: "series",
      smooth: true,
      autoFit: true,
      height: 300,
      xAxis: { title: { text: "Produktionstag" } },
      yAxis: {
        min: minVal - 5,
        max: maxVal + 5,
        title: { text: filteredData[0].parameter },
      },
      point: (datum: any) =>
        datum.series === "AVERAGE"
          ? { size: 4, shape: "circle", style: { fill: "#e01227ff" } }
          : false,
      lineStyle: (datum: any) => {
        if (datum.series === "MIN" || datum.series === "MAX")
          return { lineDash: [4, 4] };
        if (datum.series === "AVERAGE")
          return { lineDash: [6, 2], lineWidth: 2 };
        return { lineWidth: 2 };
      },
      legend: true, // <-- Bunu true yap!
      color: [
        "rgba(24, 144, 255, 1)",      // Wert (actual)
        "rgba(24,144,255,0.45)",      // MIN
        "rgba(24,144,255,0.45)",      // MAX
        "#da072e",                    // AVERAGE (ör: kırmızı)
      ],
    };
  }

  // --- Säulendiagramm Top Änderungsgründe nach Aggregat ---

  // Beispiel für manuell änderbare Werte:
  const aenderungsgruendeData: Record<string, { grund: string; anzahl: number }[]> = {
    Dosiersystem: [
      { grund: "Produkte zu groß", anzahl: 7 },
      { grund: "Produkte zu klein", anzahl: 3 },
      { grund: "Formschwankungen", anzahl: 5 },
      { grund: "Rundheit", anzahl: 2 },
      { grund: "Teig zu fest", anzahl: 1 },
      { grund: "Teig zu weich", anzahl: 4 },
      { grund: "Dosierverzögerung", anzahl: 2 },
    ],
    Kopfmaschine: [
      { grund: "Produkte zu groß", anzahl: 6 },
      { grund: "Produkte zu klein", anzahl: 2 },
      { grund: "Formschwankungen", anzahl: 4 },
      { grund: "Rundheit", anzahl: 3 },
      { grund: "Teig zu fest", anzahl: 1 },
      { grund: "Teig zu weich", anzahl: 2 },
    ],
    Vorgärschrank: [
      { grund: "Geschwindigkeit zu hoch", anzahl: 4 },
      { grund: "Oberband Problem", anzahl: 2 },
      { grund: "Unterband Problem", anzahl: 3 },
      { grund: "Position Einlauf falsch", anzahl: 1 },
      { grund: "Position Auslauf falsch", anzahl: 2 },
      { grund: "Heben Fehler", anzahl: 2 },
      { grund: "Senken Fehler", anzahl: 1 },
    ],
    Gärschrank: [
      { grund: "Temperatur zu hoch", anzahl: 3 },
      { grund: "Feuchtigkeit zu niedrig", anzahl: 2 },
      { grund: "Temperatur Absteifzone", anzahl: 1 },
    ],
    Fettbackwanne: [
      { grund: "Verschmutzungen", anzahl: 2 },
      { grund: "Sonstige", anzahl: 1 },
    ],
    Sollich: [
      { grund: "Bodentunkwalze Problem", anzahl: 2 },
      { grund: "Temperatur Sollich zu hoch", anzahl: 1 },
    ],
    Vibrationsstreuer: [
      { grund: "Streurinne Geschwindigkeit", anzahl: 2 },
      { grund: "Streurinne vor Bunkerblech", anzahl: 1 },
    ],
  };

  // Die Werte sind absteigend sortiert
  const columnData = useMemo(() => {
    const data = aenderungsgruendeData[selectedAggregat] || [];
    return [...data].sort((a, b) => b.anzahl - a.anzahl);
  }, [selectedAggregat]);
  console.log(columnData);
  const columnConfig = {
    data: columnData,
    xField: "grund",
    yField: "anzahl",
    label: false,
    columnWidthRatio: 0.6,
    autoFit: true,

    xAxis: {
      type: "cat",
      label: {
        autoHide: false,
        autoRotate: false,
        rotate: -30,
        offset: 36,
        style: { textAlign: "end", fontSize: 12, fill: "#333" },
        formatter: (text: any) => {
          const s = String(text || "");
          return s.length > 18 ? `${s.slice(0, 18)}…` : s;
        },
      },
      line: { style: { stroke: "#aaa" } },
    },
    // tooltip: {formatter: (datum: any) => ({ name: datum.grund, value: datum.anzahl }),},
    yAxis: { min: 0, title: { text: "Anzahl" }, nice: false },
    // add larger bottom padding to ensure labels are fully outside the plot area
    appendPadding: [20, 20, 120, 40],
    legend: false,
    interactions: [{ type: "element-active" }],
    minColumnWidth: 16,
    maxColumnWidth: 36,
    height: 300,
    // round the top corners slightly so labels have a bit of separation visually
    columnStyle: { radius: [6, 6, 0, 0] },
  };

  // Bearbeitungsverhalten-Daten
  const filteredBearbData = useMemo(() => {
    const tage =
      selectedBearbZeitraum === "letzter Tag"
        ? 1
        : selectedBearbZeitraum === "letzte 3 Tage"
          ? 3
          : selectedBearbZeitraum === "letzte 7 Tage"
            ? 7
            : 30;
    return Array.from({ length: tage }, (_, i) => {
      const statusNum = Math.round(Math.random()); // 0 veya 1
      return {
        tag: `Tag ${i + 1}`,
        status: statusNum === 1 ? "Bearbeitung" : "Keine Bearbeitung",
        statusValue: statusNum, // Grafikte kullanmak için
      };
    });
  }, [selectedBearbZeitraum]);
  console.log(filteredBearbData);

  const pieData = useMemo(() => {
    const bearbeitungCount = filteredBearbData.filter(d => d.statusValue === 1).length;
    const keineCount = filteredBearbData.filter(d => d.statusValue === 0).length;
    return [
      { type: "Bearbeitung", value: bearbeitungCount },
      { type: "Keine Bearbeitung", value: keineCount },
    ];
  }, [filteredBearbData]);

  const columns = [
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    { title: "MIN", dataIndex: "min", key: "min" },
    { title: "MAX", dataIndex: "max", key: "max" },
    { title: "Tag 1", dataIndex: "tag1", key: "tag1" },
    { title: "Tag 2", dataIndex: "tag2", key: "tag2" },
    { title: "Tag 3", dataIndex: "tag3", key: "tag3" },
  ];

  // --- Abweichungsanalyse Chart.js Line Chart ---
  const abwLineData = useMemo(() => {
    const minVal = filteredData[0]?.min ?? 0;
    const maxVal = filteredData[0]?.max ?? 0;
    const averageVal = (minVal + maxVal) / 2;

    return {
      labels: abweichungData.map((d) => d.time),
      datasets: [
        {
          label: "Wert",
          data: abweichungData.map(() =>
            minVal + Math.random() * (maxVal - minVal)
          ),
          borderColor: "rgba(24, 144, 255, 1)",
          backgroundColor: "rgba(24, 144, 255, 0.1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(24, 144, 255, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: "MIN",
          data: abweichungData.map(() => minVal),
          borderColor: "rgba(24,144,255,0.85)",
          borderDash: [4, 4],
          borderWidth: 3,
          pointRadius: 0,
          fill: false,
          tension: 0,
          animations: false, // <-- Animasyonu kapat!
        },
        {
          label: "MAX",
          data: abweichungData.map(() => maxVal),
          borderColor: "rgba(24,144,255,0.85)",
          borderDash: [4, 4],
          borderWidth: 3,
          pointRadius: 0,
          fill: false,
          tension: 0,
          animations: false, // <-- Animasyonu kapat!
        },
        {
          label: "AVERAGE",
          data: abweichungData.map(() => averageVal),
          borderColor: "#da072e",
          borderDash: [6, 2],
          borderWidth: 2,
          pointBackgroundColor: "rgba(218,7,46,0.2)",
          pointRadius: 0,
          pointBorderColor: "#da072e",
          pointBorderWidth: 1,
          fill: false,
          tension: 0.2,
        },
      ],
    };
  }, [abweichungData, filteredData]);

  const abwLineOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {},
    },
    scales: {
      y: {
        min: filteredData[0]?.min ?? 0,
        max: filteredData[0]?.max ?? 0,
        title: {
          display: true,
          text: filteredData[0]?.parameter || "",
        },
      },
      x: {
        title: { display: true, text: "Produktionstag" },
      },
    },
  }), [filteredData]);

  // --- Bearbeitungsverhalten Chart.js Line Chart ---
  const bearbLineData = useMemo(() => ({
    labels: filteredBearbData.map((d) => d.tag),
    datasets: [
      {
        label: "Bearbeitung",
        data: filteredBearbData.map((d) => d.statusValue),
        borderColor: "#52c41a",
        backgroundColor: "#52c41a33",
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#52c41a",
      },
    ],
  }), [filteredBearbData]);

  const bearbLineOptions = {
    responsive: true,
    clip: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ctx.parsed.y === 1 ? "Bearbeitung" : "Keine Bearbeitung",
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: (val: number) =>
            val === 1 ? "Bearbeitung" : "Keine Bearbeitung",
        },
        title: { display: true, text: "Status" },
      },
      x: {
        title: { display: true, text: "Tag" },
      },
    },
  };

  // --- Bearbeitungsverhalten Chart.js Pie Chart ---
  const bearbPieData = useMemo(() => ({
    labels: ["Bearbeitung", "Keine Bearbeitung"],
    datasets: [
      {
        data: [
          filteredBearbData.filter((d) => d.statusValue === 1).length,
          filteredBearbData.filter((d) => d.statusValue === 0).length,
        ],
        backgroundColor: ["#52c41a", "#faad14"],
        borderWidth: 1,
      },
    ],
  }), [filteredBearbData]);

  const bearbPieOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.label}: ${ctx.parsed} (${(
              (ctx.parsed /
                (ctx.dataset.data.reduce((a: number, b: number) => a + b, 0) ||
                  1)) *
              100
            ).toFixed(1)}%)`,
        },
      },
    },
  };

  return (
    <ListContent>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Filter Card */}
        <Card
          style={{ backgroundColor: "#e6f0ff", borderRadius: 12 }}
          bodyStyle={{ padding: "16px" }}
        >
          <Space size="large" wrap>
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
            <Select
              value={selectedZeitraum}
              onChange={setSelectedZeitraum}
              style={{ width: 180 }}
            >
              <Option value="letzter Tag">Letzter Tag</Option>
              <Option value="letzte 3 Tage">Letzte 3 Tage</Option>
              <Option value="letzte 7 Tage">Letzte 7 Tage</Option>
              <Option value="letzte 30 Tage">Letzte 30 Tage</Option>
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
            <Select
              value={selectedAggregat}
              onChange={(agg) => {
                setSelectedAggregat(agg);
                setSelectedParameter(parameterMapping[agg][0]);
              }}
              style={{ width: 220 }}
            >
              {Object.keys(parameterMapping).map((agg) => (
                <Option key={agg} value={agg}>
                  {agg}
                </Option>
              ))}
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>
              Parameter:
            </span>
            <Select
              value={selectedParameter}
              onChange={setSelectedParameter}
              style={{ width: 260 }}
            >
              {parameterOptions.map((param) => (
                <Option key={param} value={param}>
                  {param}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        {/* Diagramme */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="📈 Abweichungsanalyse">
              <div style={{ width: "100%", height: 300 }}>
                <ChartLine
                  data={abwLineData as any}
                  options={abwLineOptions as any}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🧾 Top Änderungsgründe">
              <Column {...columnConfig} />
            </Card>
          </Col>
        </Row>

        {/* Machine Data */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="⚙️ Machine Data – Sensor A">
              <MachineDataLiveChart color="rgb(82,196,26)" />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="⚙️ Machine Data – Sensor B">
              <MachineDataLiveChart color="rgb(255,165,0)" />
            </Card>
          </Col>
        </Row>

        {/* Tabelle */}
        <Card title="📊 Produktionsdaten (statisch)">
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={false}
            rowKey="parameter"
          />
        </Card>

        {/* Bearbeitungsverhalten */}
        <Card title="🟩 Bearbeitungsverhalten" style={{ borderRadius: 12, overflowX: "auto" }}>
          <Space
            size="large"
            wrap
            style={{
              marginBottom: 16,
              backgroundColor: "#e6f0ff",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
            <Select
              value={selectedBearbZeitraum}
              onChange={setSelectedBearbZeitraum}
              style={{ width: 180 }}
            >
              <Option value="letzter Tag">Letzter Tag</Option>
              <Option value="letzte 3 Tage">Letzte 3 Tage</Option>
              <Option value="letzte 7 Tage">Letzte 7 Tage</Option>
              <Option value="letzte 30 Tage">Letzte 30 Tage</Option>
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
            <Select
              value={selectedBearbAggregat}
              onChange={setSelectedBearbAggregat}
              style={{ width: 220 }}
            >
              {Object.keys(parameterMapping).map((agg) => (
                <Option key={agg} value={agg}>
                  {agg}
                </Option>
              ))}
            </Select>

            <span style={{ color: "#1890ff", fontWeight: 500 }}>Schicht:</span>
            <Select
              value={selectedSchicht}
              onChange={setSelectedSchicht}
              style={{ width: 180 }}
            >
              <Option value="früh">Früh</Option>
              <Option value="spät">Spät</Option>
              <Option value="nacht">Nacht</Option>
            </Select>
          </Space>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card bodyStyle={{ padding: 16 }}>
                <div style={{ width: "100%", height: 300 }}>
                  <ChartLine
                    data={bearbLineData}
                    options={bearbLineOptions as any}

                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bodyStyle={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 400, height: 300 }}>
                  <ChartPie
                    data={bearbPieData}
                    options={bearbPieOptions as any}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </ListContent>
  );
};
