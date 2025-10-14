import React, { useState, useMemo, useEffect } from "react";
import { Column } from "@ant-design/plots";
import { Card, Space, Table, Row, Col, Select } from "antd";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Line } from "@ant-design/plots";

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

  "VGS Andruckstation 1": [
    "Geschwindigkeit [mm/s]",
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
  ],
  "VGS Andruckstation 2": [
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
    "Mehler 1 [%]",
  ],
  "VGS Andruckstation 3": [
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
    "Mehler 2 [%]",
  ],
  "VGS Transportband": [
    "Start [-]",
    "Schrittlänge [mm]",
    "Drehzahl [%]",
    "Heben [-]",
    "Senken [-]",
    "Position Zentrier vor Stanze [-]",
    "Position Zentrier Stanze [-]",
    "Austragung [mm]",
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
const schichtLabels = ["Frühschicht", "Spätschicht", "Nachtschicht"];
const schichtKeys = ["früh", "spät", "nacht"] as const;

type SchichtValue = {
  tag: string;
  früh: number;
  spät: number;
  nacht: number;
};
type BearbSchichtValue = {
  tag: string;
  früh: "Bearbeitung" | "Keine Bearbeitung";
  spät: "Bearbeitung" | "Keine Bearbeitung";
  nacht: "Bearbeitung" | "Keine Bearbeitung";
};

type DataRow = {
  aggregat: string;
  parameter: string;
  min: number;
  max: number;
  werte: SchichtValue[]; // 1-14 gün için schicht değerleri
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
  const [selectedAggregat, setSelectedAggregat] = useState("Dosiersystem");
  const [selectedParameter, setSelectedParameter] = useState(
    parameterMapping["Dosiersystem"][0]
  );
  const parameterOptions = useMemo(
    () => parameterMapping[selectedAggregat] || [],
    [selectedAggregat]
  );

  const [selectedBearbAggregat, setSelectedBearbAggregat] =
    useState("Dosiersystem");
  const [selectedSchicht, setSelectedSchicht] = useState("früh");

  const rawData: DataRow[] = useMemo(
    () => [
      {
        aggregat: "Dosiersystem",
        parameter: "Chargengröße [kg]",
        min: 205,
        max: 220,
        werte: [
          { tag: "13.10", früh: 210, spät: 205, nacht: 210 },

        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Rückteigmenge [kg]",
        min: 30,
        max: 45,
        werte: [
          { tag: "13.10", früh: 30, spät: 30, nacht: 30 },

        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Wasser Korrekturwert [kg]",
        min: -1.3,
        max: -0.4,
        werte: [
          { tag: "13.10", früh: -0.6, spät: -0.6, nacht: -0.6 },

        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Hefe Korrekturwert [°C]",
        min: -1.6,
        max: -0.9,
        werte: [
          { tag: "13.10", früh: -1.6, spät: -1.6, nacht: -1.6 },

        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Wassertemperatur [°C]",
        min: 2,
        max: 13,
        werte: [
          { tag: "13.10", früh: 3, spät: 2, nacht: 2 },

        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Teigtemperatur [°C]",
        min: 24,
        max: 35,
        werte: [
          { tag: "13.10", früh: 24, spät: 24, nacht: 24 },

        ],
      },

      // Kopfmaschine
      {
        aggregat: "Kopfmaschine",
        parameter: "Teigeinwaage [g]",
        min: 46,
        max: 66,
        werte: [
          { tag: "13.10", früh: 46, spät: 46, nacht: 46 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbewegung [-]",
        min: 170,
        max: 183,
        werte: [
          { tag: "13.10", früh: 170, spät: 170, nacht: 170 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirken quer/längst [%]",
        min: 65,
        max: 85,
        werte: [
          { tag: "13.10", früh: 62, spät: 62, nacht: 62 },
        ]
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandspannung [-]",
        min: 65,
        max: 85,
        werte: [
          { tag: "13.10", früh: 65, spät: 65, nacht: 62 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandposition vertikal [mm]",
        min: 9,
        max: 19,
        werte: [
          { tag: "13.10", früh: 9, spät: 9, nacht: 9 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 1 (getaktet) [%]",
        min: 3,
        max: 14,
        werte: [
          { tag: "13.10", früh: 2, spät: 2, nacht: 2 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 2 (getaktet) [%]",
        min: 3,
        max: 17,
        werte: [
          { tag: "13.10", früh: 3, spät: 3, nacht: 3 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 3 (getaktet) [%]",
        min: 2,
        max: 22,
        werte: [
          { tag: "13.10", früh: 3, spät: 3, nacht: 3 },

        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 4 (optional) [%]",
        min: 1,
        max: 20,
        werte: [
          { tag: "13.10", früh: 1, spät: 1, nacht: 1 },

        ],
      },

      // Vorgärschrank Andruckstationen

      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Geschwindigkeit [mm/s]",
        min: 106,
        max: 110,
        werte: [
          { tag: "13.10", früh: 106, spät: 106, nacht: 106 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Oberband [%]",
        min: 0,
        max: 15,
        werte: [
          { tag: "13.10", früh: 0, spät: 0, nacht: 0 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Unterband [mm]",
        min: 196,
        max: 216,
        werte: [
          { tag: "13.10", früh: 196, spät: 196, nacht: 196 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Position Einlauf [-]",
        min: 40,
        max: 60,
        werte: [
          { tag: "13.10", früh: 40, spät: 40, nacht: 40 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Position Auslauf [-]",
        min: 34,
        max: 54,
        werte: [
          { tag: "13.10", früh: 34, spät: 34, nacht: 34 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Heben [-]",
        min: 105,
        max: 125,
        werte: [
          { tag: "13.10", früh: 105, spät: 105, nacht: 105 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 1",
        parameter: "Senken [-]",
        min: 180,
        max: 200,
        werte: [
          { tag: "13.10", früh: 180, spät: 180, nacht: 180 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Oberband [%]",
        min: 0,
        max: 15,
        werte: [
          { tag: "13.10", früh: 0, spät: 0, nacht: 0 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Unterband [mm]",
        min: 250,
        max: 260,
        werte: [
          { tag: "13.10", früh: 250, spät: 250, nacht: 250 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Position Einlauf [-]",
        min: 23,
        max: 30,
        werte: [
          { tag: "13.10", früh: 23, spät: 23, nacht: 23 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Position Auslauf [-]",
        min: 22,
        max: 25,
        werte: [
          { tag: "13.10", früh: 22, spät: 22, nacht: 22 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Heben [-]",
        min: 210,
        max: 220,
        werte: [
          { tag: "13.10", früh: 210, spät: 210, nacht: 210 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Senken [-]",
        min: 180,
        max: 200,
        werte: [
          { tag: "13.10", früh: 200, spät: 200, nacht: 200 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 2",
        parameter: "Mehler 1 [%]",
        min: 0,
        max: 5,
        werte: [
          { tag: "13.10", früh: 1, spät: 1, nacht: 1 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Oberband [%]",
        min: 0,
        max: 15,
        werte: [
          { tag: "13.10", früh: 0, spät: 0, nacht: 0 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Unterband [mm]",
        min: 193,
        max: 210,
        werte: [
          { tag: "13.10", früh: 193, spät: 193, nacht: 193 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Position Einlauf [-]",
        min: 37,
        max: 60,
        werte: [
          { tag: "13.10", früh: 37, spät: 37, nacht: 37 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Position Auslauf [-]",
        min: 36,
        max: 54,
        werte: [
          { tag: "13.10", früh: 36, spät: 36, nacht: 36 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Heben [-]",
        min: 160,
        max: 180,
        werte: [
          { tag: "13.10", früh: 160, spät: 160, nacht: 160 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Senken [-]",
        min: 5,
        max: 10,
        werte: [
          { tag: "13.10", früh: 5, spät: 5, nacht: 5 },

        ],
      },
      {
        aggregat: "VGS Andruckstation 3",
        parameter: "Mehler 2 [%]",
        min: 2,
        max: 5,
        werte: [
          { tag: "13.10", früh: 2, spät: 2, nacht: 2 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Start [-]",
        min: 76,
        max: 80,
        werte: [
          { tag: "13.10", früh: 76, spät: 76, nacht: 76 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Schrittlänge [mm]",
        min: 222,
        max: 230,
        werte: [
          { tag: "13.10", früh: 222, spät: 222, nacht: 222 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Drehzahl [%]",
        min: 73,
        max: 80,
        werte: [
          { tag: "13.10", früh: 73, spät: 73, nacht: 73 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Heben [-]",
        min: 95,
        max: 100,
        werte: [
          { tag: "13.10", früh: 95, spät: 95, nacht: 95 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Senken [-]",
        min: 50,
        max: 60,
        werte: [
          { tag: "13.10", früh: 50, spät: 50, nacht: 50 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Position Zentrier vor Stanze [-]",
        min: 55,
        max: 65,
        werte: [
          { tag: "13.10", früh: 55, spät: 65, nacht: 65 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Position Zentrier Stanze [-]",
        min: 1,
        max: 2,
        werte: [
          { tag: "13.10", früh: 1.2, spät: 1.1, nacht: 1.1 },

        ],
      },
      {
        aggregat: "VGS Transportband",
        parameter: "Austragung [mm]",
        min: 410,
        max: 420,
        werte: [
          { tag: "13.10", früh: 410, spät: 410, nacht: 410 },

        ],
      },

      // Gärschrank
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Zone 1 [°C]",
        min: 39,
        max: 55,
        werte: [
          { tag: "13.10", früh: 40, spät: 40, nacht: 40 },

        ],
      },
      {
        aggregat: "Gärschrank",
        parameter: "Feuchtigkeit Zone 1 [%]",
        min: 65,
        max: 80,
        werte: [
          { tag: "13.10", früh: 65, spät: 65, nacht: 65 },

        ],
      },
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Absteifzone [°C]",
        min: 19,
        max: 30,
        werte: [
          { tag: "13.10", früh: 18, spät: 19, nacht: 19 },

        ],
      },

      // Fettbackwanne
      {
        aggregat: "Fettbackwanne",
        parameter: "Einlauf Reihenabstand [mm]",
        min: 107,
        max: 120,
        werte: [
          { tag: "13.10", früh: 107, spät: 107, nacht: 107 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Temperatur [°C]",
        min: 178,
        max: 190,
        werte: [
          { tag: "13.10", früh: 178, spät: 178, nacht: 178 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Füllhöhe [mm]",
        min: 105,
        max: 125,
        werte: [
          { tag: "13.10", früh: 105, spät: 105, nacht: 105 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Auslauf Reihenabstand [mm]",
        min: 224,
        max: 234,
        werte: [
          { tag: "13.10", früh: 224, spät: 224, nacht: 224 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Höhenverstellung [°]",
        min: 140,
        max: 160,
        werte: [
          { tag: "13.10", früh: 140, spät: 140, nacht: 140 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Stopper Start [-]",
        min: 260,
        max: 280,
        werte: [
          { tag: "13.10", früh: 260, spät: 260, nacht: 260 },

        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Dauer [s]",
        min: 355,
        max: 365,
        werte: [
          { tag: "13.10", früh: 355, spät: 355, nacht: 355 },

        ],
      },

      // Sollich
      {
        aggregat: "Sollich",
        parameter: "Bodentunkwalze [%]",
        min: 85,
        max: 100,
        werte: [
          { tag: "13.10", früh: 90, spät: 77, nacht: 77 },

        ],
      },
      {
        aggregat: "Sollich",
        parameter: "Temperatur Sollich [°C]",
        min: 44.4,
        max: 53,
        werte: [
          { tag: "13.10", früh: 44.9, spät: 44.9, nacht: 44.9 },

        ],
      },

      // Vibrationsstreuer
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne Geschwindigkeit [%]",
        min: 65,
        max: 77,
        werte: [
          { tag: "13.10", früh: 70, spät: 70, nacht: 70 },

        ],
      },
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne vor Bunkerblech [mm]",
        min: 7,
        max: 17,
        werte: [
          { tag: "13.10", früh: 7, spät: 7, nacht: 7 },

        ],
      },
    ],
    []
  );


  const tagOptions = useMemo(
    () => {
      // Tüm rawData'daki günleri topla (tekrarsız)
      const allTags = rawData.flatMap((row) => row.werte.map((w) => w.tag));
      return Array.from(new Set(allTags));
    },
    [rawData]
  );
  const [selectedBearbZeitraum, setSelectedBearbZeitraum] =
    useState<string>(tagOptions[0] ?? "");
  const [selectedZeitraum, setSelectedZeitraum] = useState<string>(
    tagOptions[0] ?? ""
  );

  const bearbRawData: BearbSchichtValue[] = [
    {
      tag: "13.10",
      früh: "Bearbeitung",
      spät: "Keine Bearbeitung",
      nacht: "Bearbeitung",
    },
  ];

  // --- Abweichungsanalyse nach Aggregat + Parameter ---
  const filteredData = useMemo(
    () =>
      rawData.filter(
        (d) =>
          d.aggregat === selectedAggregat &&
          d.parameter === selectedParameter &&
          d.werte.some((w) => w.tag === selectedZeitraum)
      ),
    [selectedAggregat, selectedParameter, rawData, selectedZeitraum]
  );

  const abweichungData = useMemo(() => {
    const data = filteredData[0];
    if (!data || !data.werte) return [];


    const arr: { time: string; value: number }[] = [];
    data.werte
      .filter((w) => w.tag === selectedZeitraum)
      .forEach((w) => {
        arr.push({ time: `${w.tag} - Frühschicht`, value: w.früh });
        arr.push({ time: `${w.tag} - Spätschicht`, value: w.spät });
        arr.push({ time: `${w.tag} - Nachtschicht`, value: w.nacht });
      });
    return arr;
  }, [filteredData, selectedZeitraum]);

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
      legend: true,
      color: [
        "rgba(24, 144, 255, 1)",
        "rgba(24,144,255,0.45)",
        "rgba(24,144,255,0.45)",
        "#da072e",
      ],
    };
  }

  // --- Säulendiagramm Top Änderungsgründe nach Aggregat ---

  // Beispiel für manuell änderbare Werte:
  const aenderungsgruendeData: Record<string, { grund: string; anzahl: number }[]> = {
    Dosiersystem: [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 1 },
      { grund: "Formschwankungen", anzahl: 1 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Teig zu fest", anzahl: 0 },
      { grund: "Teig zu weich", anzahl: 0 },
      { grund: "Dosierverzögerung", anzahl: 1 },
    ],
    Kopfmaschine: [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Teig zu fest", anzahl: 0 },
      { grund: "Teig zu weich", anzahl: 0 },
    ],
    "VGS Andruckstation 1": [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung heben", anzahl: 0 },
      { grund: "Zentrierung senken", anzahl: 0 },
    ],
    "VGS Andruckstation 2": [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung heben", anzahl: 0 },
      { grund: "Zentrierung senken", anzahl: 0 },
    ],
    "VGS Andruckstation 3": [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 2 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung heben", anzahl: 0 },
      { grund: "Zentrierung senken", anzahl: 0 },
    ],
    "VGS Transportband": [
      { grund: "Zentrierung heben", anzahl: 0 },
      { grund: "Zentrierung senken", anzahl: 0 },
      { grund: "Ablage zu ungenau", anzahl: 0 },
    ],
    Gärschrank: [
      { grund: "Temperatur zu hoch", anzahl: 0 },
      { grund: "Feuchtigkeit zu niedrig", anzahl: 0 },
      { grund: "Temperatur Absteifzone", anzahl: 0 },
    ],
    Fettbackwanne: [
      { grund: "Verschmutzungen", anzahl: 0 },
      { grund: "Sonstige", anzahl: 0 },
    ],
    Sollich: [
      { grund: "Bodentunkwalze Problem", anzahl: 0 },
      { grund: "Temperatur Sollich zu hoch", anzahl: 0 },
    ],
    Vibrationsstreuer: [
      { grund: "Streurinne Geschwindigkeit", anzahl: 0 },
      { grund: "Streurinne vor Bunkerblech", anzahl: 0 },
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

  const [selectedTableSchicht, setSelectedTableSchicht] = useState<string>(
    "Frühschicht"
  );

  const maxTage = useMemo(() => {
    const data = filteredData[0];
    return data?.werte?.length ?? 0;
  }, [filteredData]);

  const tableMaxTage = useMemo(() => {
    return abweichungData.length > 0 ? abweichungData.length / 3 : 0;
  }, [abweichungData]);


  const schichtOptions = schichtLabels;
  const [selectedTableTag, setSelectedTableTag] = useState<string>("13.10");
  const filteredTableData = useMemo(() => {
    if (!filteredData.length) return [];
    const data = filteredData[0];
    if (!data || !data.werte) return [];
    const arr: any[] = [];
    data.werte
      .filter((wert) => wert.tag === selectedTableTag)
      .forEach((wert) => {
        schichtKeys.forEach((schicht, idx) => {
          if (schichtLabels[idx] === selectedTableSchicht) {
            arr.push({
              parameter: data.parameter,
              min: data.min,
              max: data.max,
              tag: wert.tag,
              schicht: schichtLabels[idx],
              value: wert[schicht],
            });
          }
        });
      });
    return arr;
  }, [filteredData, selectedTableTag, selectedTableSchicht]);

  const columns = [
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    { title: "Min", dataIndex: "min", key: "min" },
    { title: "Max", dataIndex: "max", key: "max" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
    { title: "Schicht", dataIndex: "schicht", key: "schicht" },
    { title: "Wert", dataIndex: "value", key: "value" },
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
          label: "Min",
          data: abweichungData.map(() => minVal),
          borderColor: "rgba(24,144,255,0.45)",
          borderDash: [4, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: "+1",
          backgroundColor: "rgba(24,144,255,0.10)",
          order: 1,
        },

        {
          label: "Max",
          data: abweichungData.map(() => maxVal),
          borderColor: "rgba(24,144,255,0.45)",
          borderDash: [4, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          backgroundColor: "rgba(24,144,255,0.10)",
          order: 2,
        },

        {
          label: "Wert",
          data: abweichungData.map((d) => d.value),
          borderColor: "rgba(24, 144, 255, 1)",
          backgroundColor: "rgba(24, 144, 255, 0.1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(24, 144, 255, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          order: 3,
        },

        {
          label: "Average",
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
          order: 4,
        },
      ],
    };
  }, [abweichungData, filteredData]);

  const abwLineOptions = useMemo(
    () => ({
      responsive: true,
      animation: false,
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.label;
              const value = ctx.parsed.y;
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          min: (filteredData[0]?.min ?? 0) - Math.abs(filteredData[0]?.min ?? 0) * 0.02,
          max: (filteredData[0]?.max ?? 0) + Math.abs(filteredData[0]?.max ?? 0) * 0.02,
          title: {
            display: true,
            text: filteredData[0]?.parameter || "",
          },
          ticks: {
            stepSize: 1,
            callback: function (value: number) {
              const min = Math.ceil(filteredData[0]?.min ?? 0);
              const max = Math.floor(filteredData[0]?.max ?? 0);
              if (value < min || value > max) return "";
              if (Number.isInteger(value)) return value;
              return "";
            },
          },
        },

        x: {
          title: { display: true, text: "Tag - Schicht" },
        },
      },
    }),
    [filteredData]
  );
  // --- Bearbeitungsverhalten Chart.js Line Chart ---
  const bearbAbweichungData = useMemo(() => {
    const arr: { time: string; value: number }[] = [];
    bearbRawData
      .filter((bearb) => bearb.tag === selectedBearbZeitraum)
      .forEach((bearb) => {
        schichtLabels.forEach((schicht, idx) => {
          const status = bearb[schichtKeys[idx]];
          arr.push({
            time: `${bearb.tag} - ${schicht}`,
            value: status === "Bearbeitung" ? 1 : 0,
          });
        });
      });
    return arr;
  }, [bearbRawData, selectedBearbZeitraum, schichtLabels, schichtKeys]);

  const bearbLineData = useMemo(
    () => ({
      labels: bearbAbweichungData.map((d) => d.time),
      datasets: [
        {
          label: "Bearbeitung",
          data: bearbAbweichungData.map((d) => d.value),
          borderColor: "#52c41a",
          backgroundColor: "#52c41a33",
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#52c41a",
        },
      ],
    }),
    [bearbAbweichungData]
  );

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
  const bearbPieData = useMemo(() => {
    let bearbeitung = 0;
    let keineBearbeitung = 0;

    bearbRawData.forEach((bearb) => {
      schichtKeys.forEach((schicht) => {
        if (bearb[schicht] === "Bearbeitung") {
          bearbeitung++;
        } else {
          keineBearbeitung++;
        }
      });
    });

    return {
      labels: ["Bearbeitung", "Keine Bearbeitung"],
      datasets: [
        {
          data: [bearbeitung, keineBearbeitung],
          backgroundColor: ["#35d078ff", "#c1d412ff"],
          borderWidth: 1,
        },
      ],
    };
  }, [bearbRawData]);

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
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Datum:</span>
            <Select
              value={selectedZeitraum}
              onChange={setSelectedZeitraum}
              style={{ width: 180 }}
            >
              {tagOptions.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
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
          <Space
            size="large"
            wrap
            style={{
              marginBottom: 16,
              backgroundColor: "#e6f0ff", // Diğer filtre kartlarıyla aynı
              padding: 8,
              borderRadius: 8,
            }}
          >
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Datum:</span>
            <Select
              value={selectedTableTag}
              onChange={setSelectedTableTag}
              style={{ width: 100 }}
            >
              {tagOptions.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Schicht:</span>
            <Select
              value={selectedTableSchicht}
              onChange={setSelectedTableSchicht}
              style={{ width: 140 }}
            >
              {schichtOptions.map((schicht) => (
                <Option key={schicht} value={schicht}>
                  {schicht}
                </Option>
              ))}
            </Select>
          </Space>
          <Table
            dataSource={filteredTableData}
            columns={columns}
            pagination={false}
            rowKey={(_, idx) => (idx !== undefined ? idx : 0)}
          />
        </Card>
        {/* Bearbeitungsverhalten */}
        <Card
          title="🟩 Bearbeitungsverhalten"
          style={{ borderRadius: 12, overflowX: "auto" }}
        >
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
            <span style={{ color: "#1890ff", fontWeight: 500 }}>Datum:</span>
            <Select
              value={selectedBearbZeitraum}
              onChange={setSelectedBearbZeitraum}
              style={{ width: 180 }}
            >
              {tagOptions.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
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
              <Card
                bodyStyle={{
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
