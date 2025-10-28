// Chart.js Annotation Plugin global registrieren
import "./chartjs-annotation-register";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Column, Pie } from "@ant-design/plots";
import { Card, Space, Table, Row, Col, Select, Button, Modal, Form, InputNumber } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Line } from "@ant-design/plots";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Chart.js imports
import { Line as ChartLine, Pie as ChartPie } from "react-chartjs-2";

// Chart.js + Annotation Plugin Registration
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
import annotationPlugin from "chartjs-plugin-annotation";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  annotationPlugin
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

  "VG Andruckstation 1": [
    "Geschwindigkeit [mm/s]",
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
  ],
  "VG Andruckstation 2": [
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
    "Mehler 1 [%]",
  ],
  "VG Andruckstation 3": [
    "Oberband [%]",
    "Unterband [mm]",
    "Position Einlauf [-]",
    "Position Auslauf [-]",
    "Heben [-]",
    "Senken [-]",
    "Mehler 2 [%]",
  ],
  "VG Transportband": [
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
  aggregat: string;
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
        smooth: false, // eckige Linien, keine Schwingung
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedAggregat, setSelectedAggregat] = useState("Dosiersystem");
  const [selectedParameter, setSelectedParameter] = useState(
    parameterMapping["Dosiersystem"][0]
  );
  const parameterOptions = useMemo(
    () => parameterMapping[selectedAggregat] || [],
    [selectedAggregat]
  );

  const [selectedBearbAggregat, setSelectedBearbAggregat] =
    useState("Alle Aggregate");
  const [selectedSchicht, setSelectedSchicht] = useState("früh");

  // State für KPI-Modal
  const [isKpiModalVisible, setIsKpiModalVisible] = useState(false);
  const [kpiValues, setKpiValues] = useState<Record<string, { oee: number; leistungsgrad: number; ausschuss: number }>>({});

  // Initialisiere KPI-Werte mit Standardwerten
  useEffect(() => {
    const initialValues: Record<string, { oee: number; leistungsgrad: number; ausschuss: number }> = {};
    const dates = ["13.10.2025", "14.10.2025", "15.10.2025", "16.10.2025", "17.10.2025", "18.10.2025", "19.10.2025"];
    const shifts = ["früh", "spät", "nacht"];
    dates.forEach(date => {
      shifts.forEach(shift => {
        const key = `${date}.${shift}`;
        initialValues[key] = {
          oee: Math.round(80 + Math.random() * 15),
          leistungsgrad: Math.round(85 + Math.random() * 10),
          ausschuss: Math.round(Math.random() * 10),
        };
      });
    });
    setKpiValues(initialValues);
  }, []);

  const rawData: DataRow[] = useMemo(
    () => [
      {
        aggregat: "Dosiersystem",
        parameter: "Chargengröße [kg]",
        min: 205,
        max: 210,
        werte: [
          { tag: "13.10.2025", früh: 210, spät: 205, nacht: 210 },
          { tag: "14.10.2025", früh: 210, spät: 210, nacht: 205 },
          { tag: "15.10.2025", früh: 205, spät: 205, nacht: 205 },
          { tag: "16.10.2025", früh: 205, spät: 210, nacht: 205 },
          { tag: "17.10.2025", früh: 205, spät: 205, nacht: 205 },
          { tag: "18.10.2025", früh: 205, spät: 205, nacht: 205 },
          { tag: "19.10.2025", früh: 205, spät: 205, nacht: 205 },
        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Rückteigmenge [kg]",
        min: 28,
        max: 33,
        werte: [
          { tag: "13.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "14.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "15.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "16.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "17.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "18.10.2025", früh: 30, spät: 30, nacht: 30 },
          { tag: "19.10.2025", früh: 30, spät: 30, nacht: 30 },
        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Wasser Korrekturwert [kg]",
        min: -1.6,
        max: -1,
        werte: [
          { tag: "13.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "14.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "15.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "16.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "17.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "18.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
          { tag: "19.10.2025", früh: -0.6, spät: -0.6, nacht: -0.6 },
        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Hefe Korrekturwert [°C]",
        min: -0.1,
        max: 0.3,
        werte: [
          { tag: "13.10.2025", früh: -1.6, spät: -1.6, nacht: -1.6 },
          { tag: "14.10.2025", früh: -1.6, spät: -1.6, nacht: -1.6 },
          { tag: "15.10.2025", früh: -1.6, spät: -1.6, nacht: -1.6 },
          { tag: "16.10.2025", früh: -1.6, spät: -1.6, nacht: -1.6 },
          { tag: "17.10.2025", früh: -1.6, spät: -1.6, nacht: -1.3 },
          { tag: "18.10.2025", früh: -1.8, spät: -1.8, nacht: -1.8 },
          { tag: "19.10.2025", früh: -1.8, spät: -1.8, nacht: -1.8 },
        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Wassertemperatur [°C]",
        min: 2,
        max: 6,
        werte: [
          { tag: "13.10.2025", früh: 3, spät: 2, nacht: 2 },
          { tag: "14.10.2025", früh: 3, spät: 3, nacht: 2 },
          { tag: "15.10.2025", früh: 2, spät: 3, nacht: 3 },
          { tag: "16.10.2025", früh: 2, spät: 3, nacht: 2 },
          { tag: "17.10.2025", früh: 3, spät: 2, nacht: 3 },
          { tag: "18.10.2025", früh: 3, spät: 2, nacht: 3 },
          { tag: "19.10.2025", früh: 2, spät: 3, nacht: 2 },
        ],
      },
      {
        aggregat: "Dosiersystem",
        parameter: "Soll-Teigtemperatur [°C]",
        min: 24,
        max: 27,
        werte: [
          { tag: "13.10.2025", früh: 24, spät: 24, nacht: 24 },
          { tag: "14.10.2025", früh: 24, spät: 24, nacht: 24 },
          { tag: "15.10.2025", früh: 24, spät: 24, nacht: 24 },
          { tag: "16.10.2025", früh: 24, spät: 24, nacht: 24 },
          { tag: "17.10.2025", früh: 24, spät: 24, nacht: 24 },
          { tag: "18.10.2025", früh: 24, spät: 25, nacht: 25 },
          { tag: "19.10.2025", früh: 24, spät: 24, nacht: 24 },
        ],
      },

      // Kopfmaschine
      {
        aggregat: "Kopfmaschine",
        parameter: "Teigeinwaage [g]",
        min: 46,
        max: 48,
        werte: [
          { tag: "13.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "14.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "15.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "16.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "17.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "18.10.2025", früh: 46, spät: 46, nacht: 46 },
          { tag: "19.10.2025", früh: 46, spät: 46, nacht: 46 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbewegung [-]",
        min: 155,
        max: 170,
        werte: [
          { tag: "13.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "14.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "15.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "16.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "17.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "18.10.2025", früh: 170, spät: 170, nacht: 170 },
          { tag: "19.10.2025", früh: 170, spät: 170, nacht: 170 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirken quer/längst [%]",
        min: 56,
        max: 60,
        werte: [
          { tag: "13.10.2025", früh: 62, spät: 62, nacht: 62 },
          { tag: "14.10.2025", früh: 62, spät: 62, nacht: 62 },
          { tag: "15.10.2025", früh: 62, spät: 65, nacht: 65 },
          { tag: "16.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "17.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "18.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "19.10.2025", früh: 65, spät: 65, nacht: 65 },
        ]
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandspannung [-]",
        min: 63,
        max: 68,
        werte: [
          { tag: "13.10.2025", früh: 65, spät: 65, nacht: 62 },
          { tag: "14.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "15.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "16.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "17.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "18.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "19.10.2025", früh: 65, spät: 65, nacht: 65 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Wirkbandposition vertikal [mm]",
        min: 6,
        max: 9,
        werte: [
          { tag: "13.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "14.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "15.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "16.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "17.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "18.10.2025", früh: 9, spät: 9, nacht: 9 },
          { tag: "19.10.2025", früh: 9, spät: 9, nacht: 9 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 1 (getaktet) [%]",
        min: 1,
        max: 3,
        werte: [
          { tag: "13.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "14.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "15.10.2025", früh: 3, spät: 2, nacht: 1 },
          { tag: "16.10.2025", früh: 1, spät: 2, nacht: 1 },
          { tag: "17.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "18.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "19.10.2025", früh: 2, spät: 2, nacht: 2 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 2 (getaktet) [%]",
        min: 1,
        max: 4,
        werte: [
          { tag: "13.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "14.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "15.10.2025", früh: 3, spät: 3, nacht: 2 },
          { tag: "16.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "17.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "18.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "19.10.2025", früh: 3, spät: 3, nacht: 3 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 3 (getaktet) [%]",
        min: 1,
        max: 3,
        werte: [
          { tag: "13.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "14.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "15.10.2025", früh: 3, spät: 3, nacht: 2 },
          { tag: "16.10.2025", früh: 2, spät: 3, nacht: 2 },
          { tag: "17.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "18.10.2025", früh: 3, spät: 3, nacht: 3 },
          { tag: "19.10.2025", früh: 3, spät: 3, nacht: 3 },
        ],
      },
      {
        aggregat: "Kopfmaschine",
        parameter: "Mehler 4 (optional) [%]",
        min: 0,
        max: 1,
        werte: [
          { tag: "13.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "14.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "15.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "16.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "17.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "18.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "19.10.2025", früh: 1, spät: 1, nacht: 1 },
        ],
      },

      // Vorgärschrank Andruckstationen

      {
        aggregat: "VG Andruckstation 1",
        parameter: "Geschwindigkeit [mm/s]",
        min: 104,
        max: 104,
        werte: [
          { tag: "13.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "14.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "15.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "16.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "17.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "18.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "19.10.2025", früh: 106, spät: 106, nacht: 106 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Oberband [%]",
        min: 0,
        max: 1,
        werte: [
          { tag: "13.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "14.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "15.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "16.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "17.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "18.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "19.10.2025", früh: 0, spät: 0, nacht: 0 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Unterband [mm]",
        min: 206,
        max: 208,
        werte: [
          { tag: "13.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "14.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "15.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "16.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "17.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "18.10.2025", früh: 196, spät: 196, nacht: 196 },
          { tag: "19.10.2025", früh: 196, spät: 196, nacht: 196 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Position Einlauf [-]",
        min: 38,
        max: 40,
        werte: [
          { tag: "13.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "14.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "15.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "16.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "17.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "18.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "19.10.2025", früh: 40, spät: 40, nacht: 40 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Position Auslauf [-]",
        min: 30,
        max: 35,
        werte: [
          { tag: "13.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "14.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "15.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "16.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "17.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "18.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "19.10.2025", früh: 34, spät: 34, nacht: 34 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Heben [-]",
        min: 160,
        max: 200,
        werte: [
          { tag: "13.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "14.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "15.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "16.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "17.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "18.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "19.10.2025", früh: 105, spät: 105, nacht: 105 },
        ],
      },
      {
        aggregat: "VG Andruckstation 1",
        parameter: "Senken [-]",
        min: 200,
        max: 300,
        werte: [
          { tag: "13.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "14.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "15.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "16.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "17.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "18.10.2025", früh: 180, spät: 180, nacht: 180 },
          { tag: "19.10.2025", früh: 180, spät: 180, nacht: 180 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Oberband [%]",
        min: 0,
        max: 2,
        werte: [
          { tag: "13.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "14.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "15.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "16.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "17.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "18.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "19.10.2025", früh: 0, spät: 0, nacht: 0 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Unterband [mm]",
        min: 245,
        max: 245,
        werte: [
          { tag: "13.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "14.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "15.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "16.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "17.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "18.10.2025", früh: 250, spät: 250, nacht: 250 },
          { tag: "19.10.2025", früh: 250, spät: 250, nacht: 250 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Position Einlauf [-]",
        min: 19,
        max: 21,
        werte: [
          { tag: "13.10.2025", früh: 23, spät: 23, nacht: 23 },
          { tag: "14.10.2025", früh: 22, spät: 22, nacht: 22 },
          { tag: "15.10.2025", früh: 21, spät: 21, nacht: 21 },
          { tag: "16.10.2025", früh: 20, spät: 20, nacht: 20 },
          { tag: "17.10.2025", früh: 21, spät: 21, nacht: 21 },
          { tag: "18.10.2025", früh: 21, spät: 21, nacht: 21 },
          { tag: "19.10.2025", früh: 21, spät: 21, nacht: 21 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Position Auslauf [-]",
        min: 17,
        max: 20,
        werte: [
          { tag: "13.10.2025", früh: 22, spät: 22, nacht: 22 },
          { tag: "14.10.2025", früh: 21, spät: 21, nacht: 21 },
          { tag: "15.10.2025", früh: 20, spät: 19, nacht: 20 },
          { tag: "16.10.2025", früh: 19, spät: 19, nacht: 19 },
          { tag: "17.10.2025", früh: 20, spät: 20, nacht: 20 },
          { tag: "18.10.2025", früh: 20, spät: 20, nacht: 20 },
          { tag: "19.10.2025", früh: 20, spät: 20, nacht: 20 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Heben [-]",
        min: 220,
        max: 230,
        werte: [
          { tag: "13.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "14.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "15.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "16.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "17.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "18.10.2025", früh: 210, spät: 210, nacht: 210 },
          { tag: "19.10.2025", früh: 210, spät: 210, nacht: 210 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Senken [-]",
        min: 150,
        max: 160,
        werte: [
          { tag: "13.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "14.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "15.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "16.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "17.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "18.10.2025", früh: 200, spät: 200, nacht: 200 },
          { tag: "19.10.2025", früh: 200, spät: 200, nacht: 200 },
        ],
      },
      {
        aggregat: "VG Andruckstation 2",
        parameter: "Mehler 1 [%]",
        min: 0,
        max: 1,
        werte: [
          { tag: "13.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "14.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "15.10.2025", früh: 1, spät: 0, nacht: 1 },
          { tag: "16.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "17.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "18.10.2025", früh: 1, spät: 1, nacht: 1 },
          { tag: "19.10.2025", früh: 1, spät: 1, nacht: 1 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Oberband [%]",
        min: -3,
        max: 0,
        werte: [
          { tag: "13.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "14.10.2025", früh: 0, spät: 0, nacht: -3 },
          { tag: "15.10.2025", früh: -3, spät: -3, nacht: 0 },
          { tag: "16.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "17.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "18.10.2025", früh: 0, spät: 0, nacht: 0 },
          { tag: "19.10.2025", früh: -3, spät: -3, nacht: -3 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Unterband [mm]",
        min: 200,
        max: 200,
        werte: [
          { tag: "13.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "14.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "15.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "16.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "17.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "18.10.2025", früh: 193, spät: 193, nacht: 193 },
          { tag: "19.10.2025", früh: 193, spät: 193, nacht: 193 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Position Einlauf [-]",
        min: 28,
        max: 33,
        werte: [
          { tag: "13.10.2025", früh: 37, spät: 37, nacht: 37 },
          { tag: "14.10.2025", früh: 36, spät: 36, nacht: 34 },
          { tag: "15.10.2025", früh: 33, spät: 32, nacht: 34 },
          { tag: "16.10.2025", früh: 33, spät: 33, nacht: 33 },
          { tag: "17.10.2025", früh: 35, spät: 35, nacht: 35 },
          { tag: "18.10.2025", früh: 35, spät: 35, nacht: 34 },
          { tag: "19.10.2025", früh: 34, spät: 34, nacht: 34 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Position Auslauf [-]",
        min: 28,
        max: 32,
        werte: [
          { tag: "13.10.2025", früh: 36, spät: 36, nacht: 36 },
          { tag: "14.10.2025", früh: 35, spät: 35, nacht: 33 },
          { tag: "15.10.2025", früh: 32, spät: 31, nacht: 33 },
          { tag: "16.10.2025", früh: 32, spät: 32, nacht: 32 },
          { tag: "17.10.2025", früh: 34, spät: 34, nacht: 34 },
          { tag: "18.10.2025", früh: 34, spät: 34, nacht: 35 },
          { tag: "19.10.2025", früh: 33, spät: 33, nacht: 33 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Heben [-]",
        min: 150,
        max: 180,
        werte: [
          { tag: "13.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "14.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "15.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "16.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "17.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "18.10.2025", früh: 160, spät: 160, nacht: 160 },
          { tag: "19.10.2025", früh: 160, spät: 160, nacht: 160 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Senken [-]",
        min: 250,
        max: 280,
        werte: [
          { tag: "13.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "14.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "15.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "16.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "17.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "18.10.2025", früh: 5, spät: 5, nacht: 5 },
          { tag: "19.10.2025", früh: 5, spät: 5, nacht: 5 },
        ],
      },
      {
        aggregat: "VG Andruckstation 3",
        parameter: "Mehler 2 [%]",
        min: 1,
        max: 2,
        werte: [
          { tag: "13.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "14.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "15.10.2025", früh: 4, spät: 4, nacht: 2 },
          { tag: "16.10.2025", früh: 2, spät: 2, nacht: 2 },
          { tag: "17.10.2025", früh: 4, spät: 3, nacht: 2 },
          { tag: "18.10.2025", früh: 4, spät: 4, nacht: 4 },
          { tag: "19.10.2025", früh: 3, spät: 4, nacht: 4 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Start [-]",
        min: 70,
        max: 80,
        werte: [
          { tag: "13.10.2025", früh: 76, spät: 76, nacht: 76 },
          { tag: "14.10.2025", früh: 76, spät: 76, nacht: 76 },
          { tag: "15.10.2025", früh: 76, spät: 76, nacht: 76 },
          { tag: "16.10.2025", früh: 76, spät: 76, nacht: 76 },
          { tag: "17.10.2025", früh: 76, spät: 76, nacht: 0 },
          { tag: "18.10.2025", früh: 76, spät: 76, nacht: 76 },
          { tag: "19.10.2025", früh: 76, spät: 76, nacht: 76 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Schrittlänge [mm]",
        min: 224,
        max: 232,
        werte: [
          { tag: "13.10.2025", früh: 222, spät: 222, nacht: 222 },
          { tag: "14.10.2025", früh: 222, spät: 222, nacht: 222 },
          { tag: "15.10.2025", früh: 222, spät: 222, nacht: 222 },
          { tag: "16.10.2025", früh: 222, spät: 222, nacht: 222 },
          { tag: "17.10.2025", früh: 222, spät: 220, nacht: 0 },
          { tag: "18.10.2025", früh: 220, spät: 220, nacht: 220 },
          { tag: "19.10.2025", früh: 222, spät: 222, nacht: 222 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Drehzahl [%]",
        min: 70,
        max: 80,
        werte: [
          { tag: "13.10.2025", früh: 73, spät: 73, nacht: 73 },
          { tag: "14.10.2025", früh: 73, spät: 73, nacht: 73 },
          { tag: "15.10.2025", früh: 73, spät: 73, nacht: 73 },
          { tag: "16.10.2025", früh: 73, spät: 73, nacht: 73 },
          { tag: "17.10.2025", früh: 73, spät: 73, nacht: 0 },
          { tag: "18.10.2025", früh: 73, spät: 73, nacht: 73 },
          { tag: "19.10.2025", früh: 73, spät: 73, nacht: 73 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Heben [-]",
        min: 80,
        max: 100,
        werte: [
          { tag: "13.10.2025", früh: 95, spät: 95, nacht: 95 },
          { tag: "14.10.2025", früh: 95, spät: 95, nacht: 95 },
          { tag: "15.10.2025", früh: 95, spät: 95, nacht: 95 },
          { tag: "16.10.2025", früh: 95, spät: 95, nacht: 95 },
          { tag: "17.10.2025", früh: 95, spät: 95, nacht: 0 },
          { tag: "18.10.2025", früh: 95, spät: 95, nacht: 95 },
          { tag: "19.10.2025", früh: 95, spät: 95, nacht: 95 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Senken [-]",
        min: 320,
        max: 330,
        werte: [
          { tag: "13.10.2025", früh: 50, spät: 50, nacht: 50 },
          { tag: "14.10.2025", früh: 50, spät: 50, nacht: 50 },
          { tag: "15.10.2025", früh: 50, spät: 50, nacht: 50 },
          { tag: "16.10.2025", früh: 50, spät: 50, nacht: 50 },
          { tag: "17.10.2025", früh: 50, spät: 50, nacht: 0 },
          { tag: "18.10.2025", früh: 50, spät: 50, nacht: 50 },
          { tag: "19.10.2025", früh: 50, spät: 50, nacht: 50 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Position Zentrier vor Stanze [-]",
        min: 65,
        max: 65,
        werte: [
          { tag: "13.10.2025", früh: 55, spät: 65, nacht: 65 },
          { tag: "14.10.2025", früh: 55, spät: 55, nacht: 55 },
          { tag: "15.10.2025", früh: 65, spät: 55, nacht: 54 },
          { tag: "16.10.2025", früh: 55, spät: 55, nacht: 55 },
          { tag: "17.10.2025", früh: 65, spät: 65, nacht: 0 },
          { tag: "18.10.2025", früh: 65, spät: 65, nacht: 55 },
          { tag: "19.10.2025", früh: 55, spät: 65, nacht: 65 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Position Zentrier Stanze [-]",
        min: 1.2,
        max: 1.4,
        werte: [
          { tag: "13.10.2025", früh: 1.2, spät: 1.1, nacht: 1.1 },
          { tag: "14.10.2025", früh: 1.2, spät: 1.2, nacht: 1.1 },
          { tag: "15.10.2025", früh: 1.3, spät: 1.1, nacht: 1.1 },
          { tag: "16.10.2025", früh: 1, spät: 1.1, nacht: 1.2 },
          { tag: "17.10.2025", früh: 1.2, spät: 1.1, nacht: 0 },
          { tag: "18.10.2025", früh: 1.1, spät: 1, nacht: 1.1 },
          { tag: "19.10.2025", früh: 1.1, spät: 1.3, nacht: 1.1 },
        ],
      },
      {
        aggregat: "VG Transportband",
        parameter: "Austragung [mm]",
        min: 348,
        max: 353,
        werte: [
          { tag: "13.10.2025", früh: 410, spät: 410, nacht: 410 },
          { tag: "14.10.2025", früh: 410, spät: 410, nacht: 410 },
          { tag: "15.10.2025", früh: 410, spät: 410, nacht: 410 },
          { tag: "16.10.2025", früh: 410, spät: 410, nacht: 410 },
          { tag: "17.10.2025", früh: 410, spät: 410, nacht: 0 },
          { tag: "18.10.2025", früh: 410, spät: 410, nacht: 410 },
          { tag: "19.10.2025", früh: 410, spät: 410, nacht: 410 },
        ],
      },

      // Gärschrank
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Zone 1 [°C]",
        min: 38,
        max: 39.5,
        werte: [
          { tag: "13.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "14.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "15.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "16.10.2025", früh: 40, spät: 0, nacht: 40 },
          { tag: "17.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "18.10.2025", früh: 40, spät: 40, nacht: 40 },
          { tag: "19.10.2025", früh: 40, spät: 40, nacht: 40 },
        ],
      },
      {
        aggregat: "Gärschrank",
        parameter: "Feuchtigkeit Zone 1 [%]",
        min: 60,
        max: 64,
        werte: [
          { tag: "13.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "14.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "15.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "16.10.2025", früh: 65, spät: 0, nacht: 65 },
          { tag: "17.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "18.10.2025", früh: 65, spät: 65, nacht: 65 },
          { tag: "19.10.2025", früh: 65, spät: 65, nacht: 65 },
        ],
      },
      {
        aggregat: "Gärschrank",
        parameter: "Temperatur Absteifzone [°C]",
        min: 18,
        max: 20,
        werte: [
          { tag: "13.10.2025", früh: 18, spät: 19, nacht: 19 },
          { tag: "14.10.2025", früh: 19, spät: 19, nacht: 19 },
          { tag: "15.10.2025", früh: 19, spät: 19, nacht: 19 },
          { tag: "16.10.2025", früh: 19, spät: 0, nacht: 19 },
          { tag: "17.10.2025", früh: 19, spät: 19, nacht: 19 },
          { tag: "18.10.2025", früh: 19, spät: 19, nacht: 19 },
          { tag: "19.10.2025", früh: 19, spät: 19, nacht: 19 },
        ],
      },

      // Fettbackwanne
      {
        aggregat: "Fettbackwanne",
        parameter: "Einlauf Reihenabstand [mm]",
        min: 104,
        max: 108,
        werte: [
          { tag: "13.10.2025", früh: 107, spät: 107, nacht: 107 },
          { tag: "14.10.2025", früh: 107, spät: 107, nacht: 105 },
          { tag: "15.10.2025", früh: 107, spät: 107, nacht: 107 },
          { tag: "16.10.2025", früh: 107, spät: 0, nacht: 107 },
          { tag: "17.10.2025", früh: 107, spät: 107, nacht: 107 },
          { tag: "18.10.2025", früh: 107, spät: 107, nacht: 107 },
          { tag: "19.10.2025", früh: 107, spät: 107, nacht: 107 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Temperatur [°C]",
        min: 175,
        max: 180,
        werte: [
          { tag: "13.10.2025", früh: 178, spät: 178, nacht: 178 },
          { tag: "14.10.2025", früh: 178, spät: 178, nacht: 178 },
          { tag: "15.10.2025", früh: 178, spät: 178, nacht: 178 },
          { tag: "16.10.2025", früh: 178, spät: 0, nacht: 178 },
          { tag: "17.10.2025", früh: 178, spät: 178, nacht: 178 },
          { tag: "18.10.2025", früh: 178, spät: 178, nacht: 178 },
          { tag: "19.10.2025", früh: 178, spät: 178, nacht: 178 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Füllhöhe [mm]",
        min: 101,
        max: 110,
        werte: [
          { tag: "13.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "14.10.2025", früh: 106, spät: 106, nacht: 106 },
          { tag: "15.10.2025", früh: 105, spät: 105, nacht: 108 },
          { tag: "16.10.2025", früh: 105, spät: 0, nacht: 105 },
          { tag: "17.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "18.10.2025", früh: 105, spät: 105, nacht: 105 },
          { tag: "19.10.2025", früh: 105, spät: 105, nacht: 105 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Auslauf Reihenabstand [mm]",
        min: 264,
        max: 280,
        werte: [
          { tag: "13.10.2025", früh: 224, spät: 224, nacht: 224 },
          { tag: "14.10.2025", früh: 224, spät: 224, nacht: 224 },
          { tag: "15.10.2025", früh: 224, spät: 224, nacht: 224 },
          { tag: "16.10.2025", früh: 224, spät: 0, nacht: 224 },
          { tag: "17.10.2025", früh: 224, spät: 224, nacht: 224 },
          { tag: "18.10.2025", früh: 224, spät: 224, nacht: 260 },
          { tag: "19.10.2025", früh: 224, spät: 224, nacht: 224 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Höhenverstellung [°]",
        min: 35,
        max: 45,
        werte: [
          { tag: "13.10.2025", früh: 140, spät: 140, nacht: 140 },
          { tag: "14.10.2025", früh: 140, spät: 140, nacht: 140 },
          { tag: "15.10.2025", früh: 140, spät: 140, nacht: 140 },
          { tag: "16.10.2025", früh: 140, spät: 0, nacht: 140 },
          { tag: "17.10.2025", früh: 140, spät: 140, nacht: 140 },
          { tag: "18.10.2025", früh: 140, spät: 140, nacht: 140 },
          { tag: "19.10.2025", früh: 140, spät: 140, nacht: 140 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Stopper Start [-]",
        min: 270,
        max: 290,
        werte: [
          { tag: "13.10.2025", früh: 260, spät: 260, nacht: 260 },
          { tag: "14.10.2025", früh: 260, spät: 260, nacht: 260 },
          { tag: "15.10.2025", früh: 260, spät: 260, nacht: 260 },
          { tag: "16.10.2025", früh: 260, spät: 0, nacht: 260 },
          { tag: "17.10.2025", früh: 260, spät: 260, nacht: 260 },
          { tag: "18.10.2025", früh: 260, spät: 260, nacht: 260 },
          { tag: "19.10.2025", früh: 260, spät: 260, nacht: 260 },
        ],
      },
      {
        aggregat: "Fettbackwanne",
        parameter: "Dauer [s]",
        min: 350,
        max: 350,
        werte: [
          { tag: "13.10.2025", früh: 355, spät: 355, nacht: 355 },
          { tag: "14.10.2025", früh: 355, spät: 355, nacht: 355 },
          { tag: "15.10.2025", früh: 355, spät: 355, nacht: 355 },
          { tag: "16.10.2025", früh: 355, spät: 0, nacht: 355 },
          { tag: "17.10.2025", früh: 355, spät: 355, nacht: 355 },
          { tag: "18.10.2025", früh: 355, spät: 355, nacht: 355 },
          { tag: "19.10.2025", früh: 355, spät: 355, nacht: 355 },
        ],
      },

      // Sollich
      {
        aggregat: "Sollich",
        parameter: "Bodentunkwalze [%]",
        min: 66,
        max: 72,
        werte: [
          { tag: "13.10.2025", früh: 90, spät: 77, nacht: 77 },
          { tag: "14.10.2025", früh: 82, spät: 82, nacht: 77 },
          { tag: "15.10.2025", früh: 82, spät: 82, nacht: 70 },
          { tag: "16.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "17.10.2025", früh: 82, spät: 83, nacht: 82 },
          { tag: "18.10.2025", früh: 82, spät: 82, nacht: 82 },
          { tag: "19.10.2025", früh: 82, spät: 82, nacht: 82 },
        ],
      },
      {
        aggregat: "Sollich",
        parameter: "Temperatur Sollich [°C]",
        min: 42,
        max: 48,
        werte: [
          { tag: "13.10.2025", früh: 44.9, spät: 44.9, nacht: 44.9 },
          { tag: "14.10.2025", früh: 44.5, spät: 44.5, nacht: 45 },
          { tag: "15.10.2025", früh: 45, spät: 44.2, nacht: 45 },
          { tag: "16.10.2025", früh: 45, spät: 45, nacht: 45 },
          { tag: "17.10.2025", früh: 44.3, spät: 45, nacht: 44.3 },
          { tag: "18.10.2025", früh: 44.3, spät: 45, nacht: 44.4 },
          { tag: "19.10.2025", früh: 45, spät: 45, nacht: 45 },
        ],
      },

      // Vibrationsstreuer
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne Geschwindigkeit [%]",
        min: 84,
        max: 88,
        werte: [
          { tag: "13.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "14.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "15.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "16.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "17.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "18.10.2025", früh: 70, spät: 70, nacht: 70 },
          { tag: "19.10.2025", früh: 70, spät: 70, nacht: 70 },
        ],
      },
      {
        aggregat: "Vibrationsstreuer",
        parameter: "Streurinne vor Bunkerblech [mm]",
        min: 7,
        max: 7,
        werte: [
          { tag: "13.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "14.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "15.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "16.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "17.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "18.10.2025", früh: 7, spät: 7, nacht: 7 },
          { tag: "19.10.2025", früh: 7, spät: 7, nacht: 7 },
        ],
      },
    ],
    []
  );


  const tagOptions = useMemo(
    () => {
      // Tüm rawData'daki günleri topla (tekrarsız)
      const allTags = rawData.flatMap((row) => row.werte.map((w) => w.tag));
      return Array.from(new Set(allTags)).sort();
    },
    [rawData]
  );
  const [selectedBearbZeitraum, setSelectedBearbZeitraum] =
    useState<string>(tagOptions[0] ?? "");
  // Zeitraum-Filter auch für Bearbeitungsverhalten
  const [bearbFilterMode, setBearbFilterMode] = useState<"single" | "range">("range");
  const [selectedBearbZeitraumVon, setSelectedBearbZeitraumVon] = useState<string>(
    tagOptions.includes("13.10.2025") ? "13.10.2025" : (tagOptions[0] ?? "")
  );
  const [selectedBearbZeitraumBis, setSelectedBearbZeitraumBis] = useState<string>(
    tagOptions.includes("19.10.2025") ? "19.10.2025" : (tagOptions[tagOptions.length - 1] ?? "")
  );
  
  // Schicht-Filter für Bearbeitungsverhalten (Multi-Select möglich)
  const [selectedBearbSchichten, setSelectedBearbSchichten] = useState<string[]>([
    "früh",
    "spät",
    "nacht",
  ]);
  
  // Zeitraum-Filter: Einzelnes Datum oder Von-Bis
  const [filterMode, setFilterMode] = useState<"single" | "range">("range");
  const [selectedZeitraum, setSelectedZeitraum] = useState<string>(
    tagOptions[0] ?? ""
  );
  const [selectedZeitraumVon, setSelectedZeitraumVon] = useState<string>(
    tagOptions.includes("13.10.2025") ? "13.10.2025" : (tagOptions[0] ?? "")
  );
  const [selectedZeitraumBis, setSelectedZeitraumBis] = useState<string>(
    tagOptions.includes("19.10.2025") ? "19.10.2025" : (tagOptions[tagOptions.length - 1] ?? "")
  );

  const bearbRawData: BearbSchichtValue[] = useMemo(() => {
    const tags = ["13.10.2025", "14.10.2025", "15.10.2025", "16.10.2025", "17.10.2025", "18.10.2025", "19.10.2025"];
    const aggregate = [
      "Dosiersystem",
      "Kopfmaschine",
      "VG Andruckstation 1",
      "VG Andruckstation 2",
      "VG Andruckstation 3",
      "VG Transportband",
      "Gärschrank",
      "Fettbackwanne",
      "Sollich",
      "Vibrationsstreuer",
    ];
    
    const data: BearbSchichtValue[] = [];
    
    tags.forEach((tag) => {
      aggregate.forEach((aggregat) => {
        // Spezielle Behandlung für Fettbackwanne am 16.10.2025
        if (tag === "16.10.2025" && aggregat === "Fettbackwanne") {
          data.push({
            tag,
            aggregat,
            früh: "Bearbeitung" as const,
            spät: "Keine Bearbeitung" as const,
            nacht: "Bearbeitung" as const,
          });
        } 
        // Spezielle Behandlung für Gärschrank am 16.10.2025 (auch Spät = 0)
        else if (tag === "16.10.2025" && aggregat === "Gärschrank") {
          data.push({
            tag,
            aggregat,
            früh: "Bearbeitung" as const,
            spät: "Keine Bearbeitung" as const,
            nacht: "Bearbeitung" as const,
          });
        }
        // Spezielle Behandlung für VG Transportband am 17.10.2025 Nachtschicht
        else if (tag === "17.10.2025" && aggregat === "VG Transportband") {
          data.push({
            tag,
            aggregat,
            früh: "Bearbeitung" as const,
            spät: "Bearbeitung" as const,
            nacht: "Keine Bearbeitung" as const,
          });
        }
        // Alle anderen: Bearbeitung
        else {
          data.push({
            tag,
            aggregat,
            früh: "Bearbeitung" as const,
            spät: "Bearbeitung" as const,
            nacht: "Bearbeitung" as const,
          });
        }
      });
    });
    
    return data;
  }, []);

  // --- Bearbeitungsverhalten Chart.js Pie Chart ---
  const bearbPieData = useMemo(() => {
    let bearbeitung = 0;
    let keineBearbeitung = 0;

    // Filter nach Zeitraum und optional nach Aggregat
    const filtered = bearbFilterMode === 'single'
      ? bearbRawData.filter((b) => {
          const matchesDate = b.tag === selectedBearbZeitraum;
          const matchesAggregat = selectedBearbAggregat === "Alle Aggregate" || b.aggregat === selectedBearbAggregat;
          return matchesDate && matchesAggregat;
        })
      : bearbRawData.filter((b) => {
          const tagDate = new Date(b.tag.split('.').reverse().join('-'));
          const vonDate = new Date(selectedBearbZeitraumVon.split('.').reverse().join('-'));
          const bisDate = new Date(selectedBearbZeitraumBis.split('.').reverse().join('-'));
          const matchesDateRange = tagDate >= vonDate && tagDate <= bisDate;
          const matchesAggregat = selectedBearbAggregat === "Alle Aggregate" || b.aggregat === selectedBearbAggregat;
          return matchesDateRange && matchesAggregat;
        });

    filtered.forEach((bearb) => {
      schichtKeys.forEach((schicht) => {
        // Nur zählen, wenn die Schicht im Filter ausgewählt ist
        if (selectedBearbSchichten.includes(schicht)) {
          if (bearb[schicht] === "Bearbeitung") {
            bearbeitung++;
          } else {
            keineBearbeitung++;
          }
        }
      });
    });

    const total = bearbeitung + keineBearbeitung;
    const bearbeitungProzent = total > 0 ? ((bearbeitung / total) * 100).toFixed(1) : '0.0';
    const keineBearbeitungProzent = total > 0 ? ((keineBearbeitung / total) * 100).toFixed(1) : '0.0';

    return {
      labels: [
        `Bearbeitung (${bearbeitungProzent}%)`, 
        `Keine Bearbeitung (${keineBearbeitungProzent}%)`
      ],
      datasets: [
        {
          data: [bearbeitung, keineBearbeitung],
          backgroundColor: ["rgb(46, 140, 255)", "rgb(28, 182, 179)"],
          borderWidth: 1,
        },
      ],
    };
  }, [bearbRawData, bearbFilterMode, selectedBearbZeitraum, selectedBearbZeitraumVon, selectedBearbZeitraumBis, selectedBearbAggregat, selectedBearbSchichten]);

  // --- Neues Bearbeitungsverhalten Diagramm pro Aggregat ---
  const bearbAggregatData = useMemo(() => {
    const aggregatStats: { aggregat: string; schicht: string; total: number; aufgenommen: number; nichtAufgenommen: number }[] = [];

    const aggregates = selectedBearbAggregat === "Alle Aggregate" 
      ? ["Dosiersystem", "Kopfmaschine", "VG Andruckstation 1", "VG Andruckstation 2", "VG Andruckstation 3", "VG Transportband", "Gärschrank", "Fettbackwanne", "Sollich", "Vibrationsstreuer"]
      : [selectedBearbAggregat];

    aggregates.forEach(agg => {
      selectedBearbSchichten.forEach(schicht => {
        const total = 15; // Immer 15
        const aufgenommen = Math.floor(Math.random() * (total + 1));
        const nichtAufgenommen = total - aufgenommen;
        aggregatStats.push({
          aggregat: agg,
          schicht,
          total,
          aufgenommen,
          nichtAufgenommen,
        });
      });
    });

    return aggregatStats;
  }, [selectedBearbSchichten, selectedBearbAggregat]);

  // --- Abweichungsanalyse nach Aggregat + Parameter ---
  const filteredData = useMemo(
    () =>
      rawData.filter(
        (d) =>
          d.aggregat === selectedAggregat &&
          d.parameter === selectedParameter
      ),
    [selectedAggregat, selectedParameter, rawData]
  );

  const abweichungData = useMemo(() => {
    const data = filteredData[0];
    if (!data || !data.werte) return [];

    const arr: { time: string; value: number }[] = [];
    
    // Filter nach Modus: Einzelnes Datum oder Zeitraum
    const filteredWerte = data.werte.filter((w) => {
      if (filterMode === "single") {
        return w.tag === selectedZeitraum;
      } else {
        // Range-Modus: Von-Bis
        const tagDate = new Date(w.tag.split('.').reverse().join('-'));
        const vonDate = new Date(selectedZeitraumVon.split('.').reverse().join('-'));
        const bisDate = new Date(selectedZeitraumBis.split('.').reverse().join('-'));
        return tagDate >= vonDate && tagDate <= bisDate;
      }
    });

    filteredWerte.forEach((w) => {
      arr.push({ time: `FS\n${w.tag}`, value: w.früh });
      arr.push({ time: `SS\n${w.tag}`, value: w.spät });
      arr.push({ time: `NS\n${w.tag}`, value: w.nacht });
    });
    
    return arr;
  }, [filteredData, filterMode, selectedZeitraum, selectedZeitraumVon, selectedZeitraumBis]);

  // Build a stable config for the Abweichungsanalyse line chart.
  // Use fixed height and autoFit:false so the chart doesn't jump/rescale when filters change.
  let lineConfig1: any = {
  data: abweichungData,
  xField: "time",
  yField: "value",
  smooth: false, // eckige Linien, keine Schwingung
  stepType: "hv", // Stufenlinie (Treppenfunktion)
  point: { size: 4 },
    xAxis: { 
      title: { text: "Produktionstag" },
      label: {
        formatter: (text: string) => text.replace('\n', '\n'),
        style: { textAlign: 'center' },
      }
    },
    autoFit: false,
    height: 300,
  };

  if (filteredData.length) {
    // min/max Werte für horizontale Linien (Annotationen)
    let minVal = filteredData[0].min;
    let maxVal = filteredData[0].max;
    if (minVal === maxVal) {
      const pad = Math.max(0.5, Math.abs(minVal) * 0.01);
      minVal = Number((minVal - pad).toFixed(2));
      maxVal = Number((maxVal + pad).toFixed(2));
    }

    // Nur die echten Werte als Datenreihe
    const actualSeries = abweichungData.map((d) => ({ ...d, series: "Wert" }));

    // y-Achse automatisch (alle Werte sichtbar)
    // min/max nur als horizontale Linien (Annotationen)
    lineConfig1 = {
  data: actualSeries,
  xField: "time",
  yField: "value",
  seriesField: "series",
  smooth: false, // eckige Linien, keine Schwingung
  autoFit: true,
  height: 300,
      xAxis: { 
        title: { text: "Produktionstag" },
        label: {
          formatter: (text: string) => text.replace('\n', '\n'),
          style: { textAlign: 'center' },
        }
      },
      yAxis: {
        title: { text: filteredData[0].parameter },
      },
      legend: true,
      color: ["rgba(24, 144, 255, 1)"],
      annotations: [
        {
          type: 'line',
          start: ['min', minVal],
          end: ['max', minVal],
          style: {
            stroke: 'rgba(24,144,255,0.45)',
            lineDash: [4, 4],
            lineWidth: 2,
          },
          text: {
            content: `Min (${minVal})`,
            position: 'left',
            offsetY: -8,
            style: { fill: 'rgba(24,144,255,0.7)', fontWeight: 500 },
          },
        },
        {
          type: 'line',
          start: ['min', maxVal],
          end: ['max', maxVal],
          style: {
            stroke: 'rgba(24,144,255,0.45)',
            lineDash: [4, 4],
            lineWidth: 2,
          },
          text: {
            content: `Max (${maxVal})`,
            position: 'left',
            offsetY: -8,
            style: { fill: 'rgba(24,144,255,0.7)', fontWeight: 500 },
          },
        },
      ],
    };
  }

  // --- Säulendiagramm Top Änderungsgründe nach Aggregat ---

  // Beispiel für manuell änderbare Werte:
  const aenderungsgruendeData: Record<string, { grund: string; anzahl: number }[]> = {
    Dosiersystem: [
      { grund: "Produkte zu groß", anzahl: 1},
      { grund: "Produkte zu klein", anzahl: 1 },
      { grund: "Formschwankungen", anzahl: 2 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Teig zu fest", anzahl: 0 },
      { grund: "Teig zu weich", anzahl: 0 },
      { grund: "Dosierverzögerung", anzahl: 1 },
    ],
    Kopfmaschine: [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 1 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Teig zu fest", anzahl: 0 },
      { grund: "Teig zu weich", anzahl: 0 },
    ],
    "VG Andruckstation 1": [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung Heben", anzahl: 0 },
      { grund: "Zentrierung Senken", anzahl: 0 },
    ],
    "VG Andruckstation 2": [
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 2 },
      { grund: "Formschwankungen", anzahl: 0 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung Heben", anzahl: 0 },
      { grund: "Zentrierung Senken", anzahl: 0 },
    ],
    "VG Andruckstation 3": [
      { grund: "Produkte zu groß", anzahl: 4 },
      { grund: "Produkte zu klein", anzahl: 6 },
      { grund: "Formschwankungen", anzahl: 5 },
      { grund: "Rundheit", anzahl: 0 },
      { grund: "Zentrierung Heben", anzahl: 0 },
      { grund: "Zentrierung Senken", anzahl: 0 },
    ],
    "VG Transportband": [
      { grund: "Zentrierung Heben", anzahl: 0 },
      { grund: "Zentrierung Senken", anzahl: 0 },
      { grund: "Ablage zu ungenau", anzahl: 3 },
    ],
    Gärschrank: [
      { grund: "Teig zu kalt", anzahl: 0 },
      { grund: "Teig zu warm", anzahl: 0 },
      { grund: "Produkte zu groß", anzahl: 0 },
      { grund: "Produkte zu klein", anzahl: 0 },
      { grund: "Formschwankungen", anzahl: 0 },
    ],
    Fettbackwanne: [
      { grund: "Verschmutzungen", anzahl: 0 },
      { grund: "Sonstige", anzahl: 2 },
    ],
    Sollich: [
      { grund: "Bestreuung ungleichmäßig", anzahl: 0 },
      { grund: "Überzug zu gering", anzahl: 0 },
      { grund: "Überzug zu viel", anzahl: 0 },
      { grund: "Bestreuung Untergewicht", anzahl: 0 },
      { grund: "Bestreuung Übergewicht", anzahl: 0 },
    ],
    Vibrationsstreuer: [
      { grund: "Bestreuung ungleichmäßig", anzahl: 0 },
      { grund: "Überzug zu gering", anzahl: 0 },
      { grund: "Überzug zu viel", anzahl: 0 },
      { grund: "Bestreuung Untergewicht", anzahl: 0 },
      { grund: "Bestreuung Übergewicht", anzahl: 0 },
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
    color: "rgb(46, 140, 255)",

    xAxis: {
      type: "cat",
      label: {
        autoHide: true,
        autoRotate: false,
        style: { fontSize: 8, fill: "#333" },
      },
      line: { style: { stroke: "#aaa" } },
    },
    // tooltip: {formatter: (datum: any) => ({ name: datum.grund, value: datum.anzahl }),},
    yAxis: { min: 0, title: { text: "Anzahl" }, nice: false },
    // add larger bottom padding to ensure labels are fully outside the plot area
    appendPadding: [20, 20, 45, 40],
    legend: false,
    interactions: [{ type: "element-active" }],
    minColumnWidth: 16,
    maxColumnWidth: 36,
    height: 400,
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
  const [selectedTableTag, setSelectedTableTag] = useState<string>("13.10.2025");
  const filteredTableData = useMemo(() => {
    if (!filteredData.length) return [];
    const data = filteredData[0];
    if (!data || !data.werte) return [];
    // Alle Werte für diesen Parameter sammeln
    const alleWerte: number[] = [];
    data.werte.forEach((wert) => {
      schichtKeys.forEach((schicht) => {
        const v = wert[schicht];
        if (typeof v === 'number' && !isNaN(v)) alleWerte.push(v);
      });
    });
    // Tatsächliche Min/Max berechnen
    const actualMin = alleWerte.length ? Math.min(...alleWerte) : null;
    const actualMax = alleWerte.length ? Math.max(...alleWerte) : null;
    // Häufigkeit berechnen
    const valueCounts: Record<number, number> = {};
    alleWerte.forEach((v) => {
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    });
    // Werte mit Häufigkeit als String zusammenfassen mit Zeilenumbrüchen
    // Nach Häufigkeit sortieren (höchste zuerst)
    const valueCountsStr = Object.entries(valueCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([val, count]) => `${val} (${count}x)`)
      .join('\n');
    // Eine Zeile für den Parameter
    return [{
      parameter: data.parameter,
      vorgabeMin: data.min,
      vorgabeMax: data.max,
      actualMin,
      actualMax,
      valueFrequency: valueCountsStr,
    }];
  }, [filteredData]);

  const columns = [
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    { title: "Vorgabe MIN", dataIndex: "vorgabeMin", key: "vorgabeMin" },
    { title: "Vorgabe MAX", dataIndex: "vorgabeMax", key: "vorgabeMax" },
    { title: "Ist MIN", dataIndex: "actualMin", key: "actualMin" },
    { title: "Ist MAX", dataIndex: "actualMax", key: "actualMax" },
    { 
      title: "Wert (Häufigkeit)", 
      dataIndex: "valueFrequency", 
      key: "valueFrequency", 
      width: 300,
      render: (text: string) => {
        const lines = text.split('\n');
        return (
          <div style={{ whiteSpace: 'pre-line' }}>
            {lines.map((line, idx) => (
              <div key={idx} style={{ fontWeight: idx === 0 ? 'bold' : 'normal' }}>
                {line}
              </div>
            ))}
          </div>
        );
      }
    },
  ];

  // --- Abweichungsanalyse Chart.js Line Chart ---
  const abwLineData = useMemo(() => {
    const minVal = filteredData[0]?.min ?? 0;
    const maxVal = filteredData[0]?.max ?? 0;
    // Mittelwert der tatsächlichen Werte berechnen
    const values = abweichungData.map((d) => d.value).filter((v) => typeof v === "number" && !isNaN(v));
    const averageVal = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    // OEE-Daten generieren (aus KPI-Werten)
    const oeeData: number[] = abweichungData.map((d) => {
      const [schicht, tag] = d.time.split(/\s|\n/);
      const shiftKey = schicht === "FS" ? "früh" : schicht === "SS" ? "spät" : "nacht";
      const key = `${tag}.${shiftKey}`;
      return kpiValues[key]?.oee ?? Math.round(80 + Math.random() * 15);
    });

    // Leistungsgrad-Daten generieren (aus KPI-Werten)
    const leistungsgradData: number[] = abweichungData.map((d) => {
      const [schicht, tag] = d.time.split(/\s|\n/);
      const shiftKey = schicht === "FS" ? "früh" : schicht === "SS" ? "spät" : "nacht";
      const key = `${tag}.${shiftKey}`;
      return kpiValues[key]?.leistungsgrad ?? Math.round(85 + Math.random() * 10);
    });

    // Ausschuss-Daten generieren (aus KPI-Werten)
    const ausschussData: number[] = abweichungData.map((d) => {
      const [schicht, tag] = d.time.split(/\s|\n/);
      const shiftKey = schicht === "FS" ? "früh" : schicht === "SS" ? "spät" : "nacht";
      const key = `${tag}.${shiftKey}`;
      return kpiValues[key]?.ausschuss ?? Math.round(Math.random() * 10);
    });

    return {
      labels: abweichungData.map((d) => d.time),
      datasets: [
        // Min-Linie (muss zuerst kommen!)
        {
          label: "Min",
          data: abweichungData.map(() => minVal),
          borderColor: "#1890ff73",
          borderDash: [4, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          backgroundColor: "rgba(24,144,255,0.10)",
          order: 1,
        },
        // ...kein Toleranzbereich mehr...
        // Max-Linie als gestrichelte Linie oben (sichtbar)
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
        // Wert-Linie
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
          tension: 0,
          order: 3,
        },
        // Mittelwert-Linie
        {
          label: "Mittelwert",
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
        // OEE-Linie
        {
          label: "OEE",
          data: oeeData,
          borderColor: "#f5a623",
          backgroundColor: "#f5a62333",
          pointRadius: 5,
          pointBackgroundColor: "#f5a623",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 3,
          fill: false,
          tension: 0,
          order: 5,
          spanGaps: true,
          hidden: true,
          type: 'line',
          yAxisID: 'y2',
        },
        // Leistungsgrad-Linie
        {
          label: "Leistungsgrad",
          data: leistungsgradData,
          borderColor: "#13c2c2",
          backgroundColor: "#13c2c233",
          pointRadius: 5,
          pointBackgroundColor: "#13c2c2",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 3,
          fill: false,
          tension: 0,
          order: 6,
          spanGaps: true,
          hidden: true,
          type: 'line',
          yAxisID: 'y2',
        },
        // Ausschuss-Linie
        {
          label: "Ausschuss",
          data: ausschussData,
          borderColor: "#d4380d",
          backgroundColor: "#d4380d33",
          pointRadius: 5,
          pointBackgroundColor: "#d4380d",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 3,
          fill: false,
          tension: 0,
          order: 7,
          spanGaps: true,
          hidden: true,
          type: 'line',
          yAxisID: 'y2',
        },
      ],
    };
  }, [abweichungData, filteredData, kpiValues]);

  const abwLineOptions = useMemo(
    () => {
      let min = undefined;
      let max = undefined;
      if (filteredData.length && abweichungData.length) {
        const minVal = filteredData[0].min;
        const maxVal = filteredData[0].max;
        const dataValues = abweichungData.map((d) => d.value);
        const dataMin = Math.min(...dataValues, minVal);
        const dataMax = Math.max(...dataValues, maxVal);
        const pad = Math.max(1, Math.abs(maxVal - minVal) * 0.15);
        min = Math.min(minVal - pad, dataMin - pad * 0.5);
        max = Math.max(maxVal + pad, dataMax + pad * 0.5);
      }
      return {
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
          annotation: {
            annotations: filteredData.length ? {
              minLine: {
                type: 'line',
                yMin: filteredData[0].min,
                yMax: filteredData[0].min,
                borderColor: 'rgba(24,144,255,0.45)',
                borderWidth: 2,
                borderDash: [4, 4],
                label: {
                  enabled: true,
                  content: `Min (${filteredData[0].min})`,
                  position: 'start',
                  backgroundColor: 'rgba(24,144,255,0.1)',
                  color: 'rgba(24,144,255,0.7)',
                  font: { weight: 'bold' },
                },
              },
              maxLine: {
                type: 'line',
                yMin: filteredData[0].max,
                yMax: filteredData[0].max,
                borderColor: 'rgba(24,144,255,0.45)',
                borderWidth: 2,
                borderDash: [4, 4],
                label: {
                  enabled: true,
                  content: `Max (${filteredData[0].max})`,
                  position: 'start',
                  backgroundColor: 'rgba(24,144,255,0.1)',
                  color: 'rgba(24,144,255,0.7)',
                  font: { weight: 'bold' },
                },
              },
            } : {},
          },
        },
        scales: {
          y: {
            min,
            max,
            title: {
              display: true,
              text: filteredData[0]?.parameter || "",
            },
          },
          x: {
            title: { display: false, text: "Tag - Schicht" },
          },
          y2: {
            min: 0,
            max: 100,
            position: 'right',
            title: {
              display: true,
              text: 'OEE / Leistungsgrad / Ausschuss (%)',
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value: number) { return value + '%'; },
              stepSize: 10,
            },
          },
        },
      };
    },
    [filteredData]
  );
  // --- Bearbeitungsverhalten Chart.js Line Chart ---
  const bearbAbweichungData = useMemo(() => {
    const arr: { time: string; value: number }[] = [];
    const filtered = bearbFilterMode === 'single'
      ? bearbRawData.filter((b) => {
          const matchesDate = b.tag === selectedBearbZeitraum;
          const matchesAggregat = selectedBearbAggregat === "Alle Aggregate" || b.aggregat === selectedBearbAggregat;
          return matchesDate && matchesAggregat;
        })
      : bearbRawData.filter((b) => {
          const tagDate = new Date(b.tag.split('.').reverse().join('-'));
          const vonDate = new Date(selectedBearbZeitraumVon.split('.').reverse().join('-'));
          const bisDate = new Date(selectedBearbZeitraumBis.split('.').reverse().join('-'));
          const matchesDateRange = tagDate >= vonDate && tagDate <= bisDate;
          const matchesAggregat = selectedBearbAggregat === "Alle Aggregate" || b.aggregat === selectedBearbAggregat;
          return matchesDateRange && matchesAggregat;
        });

    filtered.forEach((bearb) => {
      schichtLabels.forEach((schicht, idx) => {
        const schichtKey = schichtKeys[idx];
        // Nur hinzufügen, wenn die Schicht im Filter ausgewählt ist
        if (selectedBearbSchichten.includes(schichtKey)) {
          const status = bearb[schichtKey];
          const schichtKurz = schichtKey === 'früh' ? 'FS' : schichtKey === 'spät' ? 'SS' : 'NS';
          arr.push({
            time: `${schichtKurz} ${bearb.tag}`,
            value: status === "Bearbeitung" ? 1 : 0,
          });
        }
      });
    });
    return arr;
  }, [bearbRawData, bearbFilterMode, selectedBearbZeitraum, selectedBearbZeitraumVon, selectedBearbZeitraumBis, schichtLabels, schichtKeys, selectedBearbAggregat, selectedBearbSchichten]);

  const bearbLineData = useMemo(
    () => ({
      labels: bearbAbweichungData.map((d) => d.time),
      datasets: [
        {
          label: "Bearbeitung",
          data: bearbAbweichungData.map((d) => d.value),
          borderColor: "rgb(46, 140, 255)",
          backgroundColor: "#52c41a33",
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "rgb(46, 140, 255)",
          spanGaps: true,
          borderWidth: 2,
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
        title: { display: false, text: "Produktionstag" },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 9,
          },
        },
      },
    },
  };

  const bearbPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: "bottom",
        align: "center",
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 12
          },
          usePointStyle: false
        }
      },
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

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    try {
      // Erstelle ein temporäres Container für den Export
      const exportContainer = document.createElement("div");
      exportContainer.style.position = "absolute";
      exportContainer.style.left = "-9999px";
      exportContainer.style.width = "1200px";
      exportContainer.style.backgroundColor = "white";
      exportContainer.style.padding = "20px";
      document.body.appendChild(exportContainer);

      // Clone den Content
      const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;
      
      // Entferne den PDF-Export Button
      const buttons = clonedContent.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('PDF-Export')) {
          button.remove();
        }
      });
      
      // Entferne Filter-Cards
      const filterCards = clonedContent.querySelectorAll('[style*="backgroundColor: #e6f0ff"]');
      filterCards.forEach(card => card.remove());
      
      // Entferne die Tabelle
      const tables = clonedContent.querySelectorAll('.ant-card');
      tables.forEach(card => {
        const title = card.querySelector('.ant-card-head-title');
        if (title && title.textContent?.includes('Produktionsdaten')) {
          card.remove();
        }
      });

      // Hole alle Canvas-Elemente aus dem Original
      const originalCanvases = contentRef.current.querySelectorAll("canvas");
      const clonedCanvases = clonedContent.querySelectorAll("canvas");

      // Ersetze geklonte Canvas mit Bildern der Originale
      originalCanvases.forEach((originalCanvas, index) => {
        if (clonedCanvases[index]) {
          const imgData = originalCanvas.toDataURL("image/png");
          const img = document.createElement("img");
          img.src = imgData;
          img.style.width = originalCanvas.style.width || `${originalCanvas.width}px`;
          img.style.height = originalCanvas.style.height || `${originalCanvas.height}px`;
          img.style.maxWidth = "100%";
          
          // Ersetze Canvas mit Bild
          const parent = clonedCanvases[index].parentNode;
          if (parent) {
            parent.replaceChild(img, clonedCanvases[index]);
          }
        }
      });

      exportContainer.appendChild(clonedContent);

      // Warte kurz damit die Bilder geladen werden
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Konvertiere zu Canvas
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Entferne temporären Container
      document.body.removeChild(exportContainer);

      // Erstelle PDF im Hochformat A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210; // A4 Hochformat Breite in mm
      const pageHeight = 297; // A4 Hochformat Höhe in mm
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      // Berechne Bild-Dimensionen für A4
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Wenn das Bild höher als eine Seite ist, verkleinere es
      if (imgHeight > pageHeight - 2 * margin) {
        const scaledHeight = pageHeight - 2 * margin;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          (pageWidth - scaledWidth) / 2,
          margin,
          scaledWidth,
          scaledHeight
        );
      } else {
        // Beginne direkt oben mit Rand
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          imgWidth,
          imgHeight
        );
      }

      // Fußzeile mit Zeitstempel und Systemangabe
      const now = new Date();
      const timestamp = now.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const footerText = `Erstellt am ${timestamp} | OPEX-Demosystem Bonback`;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(footerText, pageWidth / 2, pageHeight - 5, { align: "center" });

      // Dateiname mit aktuellem Datum
      const dateStr = new Date().toLocaleDateString("de-DE").replace(/\./g, "-");
      pdf.save(`Auswertung_${dateStr}.pdf`);
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
    }
  };

  return (
    <ListContent>
      <div ref={contentRef}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Filter Card */}
          <Card
            style={{ backgroundColor: "#e6f0ff", borderRadius: 12, position: "relative" }}
            bodyStyle={{ padding: "16px" }}
          >
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={exportToPDF}
              style={{
                position: "absolute",
                top: "50%",
                right: 16,
                transform: "translateY(-50%)",
                zIndex: 1000,
              }}
            >
              PDF-Export
            </Button>
          <Space
            size="middle"
            wrap={false}
            style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}
          >
            <Space size="small" style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
              <Select
                value={filterMode}
                onChange={(mode) => setFilterMode(mode as "single" | "range")}
                style={{ width: 120 }}
              >
                <Option value="single">Datum</Option>
                <Option value="range">Von-Bis</Option>
              </Select>
            </Space>

            {filterMode === "single" ? (
              <Select
                value={selectedZeitraum}
                onChange={setSelectedZeitraum}
                style={{ width: 120 }}
              >
                {tagOptions.map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            ) : (
              <Space size="small" style={{ whiteSpace: "nowrap" }}>
                <Select
                  value={selectedZeitraumVon}
                  onChange={setSelectedZeitraumVon}
                  style={{ width: 110 }}
                  placeholder="Von"
                >
                  {tagOptions.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
                <span>-</span>
                <Select
                  value={selectedZeitraumBis}
                  onChange={setSelectedZeitraumBis}
                  style={{ width: 110 }}
                  placeholder="Bis"
                >
                  {tagOptions.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              </Space>
            )}

            <Space size="small" style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
              <Select
                value={selectedAggregat}
                onChange={(agg) => {
                  setSelectedAggregat(agg);
                  setSelectedParameter(parameterMapping[agg][0]);
                }}
                style={{ width: 180 }}
                listHeight={200}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {Object.keys(parameterMapping).map((agg) => (
                  <Option key={agg} value={agg}>
                    {agg}
                  </Option>
                ))}
              </Select>
            </Space>

            <Space size="small" style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Parameter:</span>
              <Select
                value={selectedParameter}
                onChange={setSelectedParameter}
                style={{ width: 220 }}
              >
                {parameterOptions.map((param) => (
                  <Option key={param} value={param}>
                    {param}
                  </Option>
                ))}
              </Select>
            </Space>
          </Space>
        </Card>

        {/* Diagramme */}
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Card title="📈 Abweichungsanalyse" extra={<Button onClick={() => setIsKpiModalVisible(true)}>KPIs bearbeiten</Button>}>
              <div style={{ width: "100%", height: 400, maxWidth: "1200px", margin: "0 auto" }}>
                <ChartLine
                  data={abwLineData as any}
                  options={abwLineOptions as any}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="🧾 Top Änderungsgründe (kumulativ)">
              <Column {...columnConfig} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Aufgenommene Werte Verhältnis">
              <div style={{ 
                width: "400px", 
                height: "400px",
                margin: "0 auto"
              }}>
                <Pie
                  data={[
                    {
                      type: 'Aufgenommene Werte',
                      value: bearbAggregatData.reduce((sum, item) => sum + item.aufgenommen, 0),
                    },
                    {
                      type: 'Nicht aufgenommene Werte',
                      value: bearbAggregatData.reduce((sum, item) => sum + item.nichtAufgenommen, 0),
                    },
                  ]}
                  angleField="value"
                  colorField="type"
                  color={['rgb(46, 140, 255)', 'rgb(28, 182, 179)']}
                  radius={0.8}
                  height={400}
                  label={{
                    content: (data: any) => {
                      const total = bearbAggregatData.reduce((sum, item) => sum + item.aufgenommen, 0) + bearbAggregatData.reduce((sum, item) => sum + item.nichtAufgenommen, 0);
                      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
                      return `${data.type} ${percent}%`;
                    },
                  }}
                  interactions={[
                    {
                      type: 'element-active',
                    },
                  ]}
                />
              </div>
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
        <Card title="📊 Produktionsdaten">
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
              style={{ width: 180 }}
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
            size="middle"
            wrap={false}
            style={{
              marginBottom: 16,
              backgroundColor: "#e6f0ff",
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto'
            }}
          >
            <Space size="small" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Zeitraum:</span>
              <Select
                value={bearbFilterMode}
                onChange={(mode) => setBearbFilterMode(mode as 'single' | 'range')}
                style={{ width: 120 }}
              >
                <Option value="single">Datum</Option>
                <Option value="range">Von-Bis</Option>
              </Select>
            </Space>

            {bearbFilterMode === 'single' ? (
              <Select
                value={selectedBearbZeitraum}
                onChange={setSelectedBearbZeitraum}
                style={{ width: 120 }}
              >
                {tagOptions.map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            ) : (
              <Space size="small" style={{ whiteSpace: 'nowrap' }}>
                <Select
                  value={selectedBearbZeitraumVon}
                  onChange={setSelectedBearbZeitraumVon}
                  style={{ width: 110 }}
                  placeholder="Von"
                >
                  {tagOptions.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
                <span>-</span>
                <Select
                  value={selectedBearbZeitraumBis}
                  onChange={setSelectedBearbZeitraumBis}
                  style={{ width: 110 }}
                  placeholder="Bis"
                >
                  {tagOptions.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              </Space>
            )}

            <Space size="small" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Aggregat:</span>
              <Select
                value={selectedBearbAggregat}
                onChange={setSelectedBearbAggregat}
                style={{ width: 180 }}
                listHeight={200}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key="alle" value="Alle Aggregate">
                  Alle Aggregate
                </Option>
                {Object.keys(parameterMapping).map((agg) => (
                  <Option key={agg} value={agg}>
                    {agg}
                  </Option>
                ))}
              </Select>
            </Space>

            <Space size="small" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: "#1890ff", fontWeight: 500 }}>Schichten:</span>
              <Select
                mode="multiple"
                value={selectedBearbSchichten}
                onChange={setSelectedBearbSchichten}
                style={{ width: 200 }}
                placeholder="Schichten wählen"
                maxTagCount="responsive"
              >
                <Option value="früh">Frühschicht</Option>
                <Option value="spät">Spätschicht</Option>
                <Option value="nacht">Nachtschicht</Option>
              </Select>
            </Space>
          </Space>

          {selectedBearbAggregat === "Alle Aggregate" ? (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card bodyStyle={{ padding: 16 }}>
                  <div style={{ marginBottom: 12, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
                    {/* Zusammenfassungstext */}
                    {(() => {
                      const total = bearbPieData.datasets[0].data[0] + bearbPieData.datasets[0].data[1];
                      const bearb = bearbPieData.datasets[0].data[0];
                      const keine = bearbPieData.datasets[0].data[1];
                      const bearbP = total > 0 ? ((bearb / total) * 100).toFixed(1) : '0.0';
                      const keineP = total > 0 ? ((keine / total) * 100).toFixed(1) : '0.0';
                      return (
                        <>
                          Insgesamt <b>{total}</b> Schichten: <span style={{ color: 'rgb(46, 140, 255)' }}>Bearbeitung {bearb} ({bearbP}%)</span> / <span style={{ color: 'rgb(28, 182, 179)' }}>Keine Bearbeitung {keine} ({keineP}%)</span>
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ 
                    width: "100%", 
                    height: "300px",
                    maxHeight: "300px",
                    maxWidth: "450px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <ChartPie
                      data={bearbPieData}
                      options={bearbPieOptions as any}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Card bodyStyle={{ padding: 16 }}>
                  <div style={{ width: "100%", height: 300 }}>
                    <ChartLine
                      data={bearbLineData}
                      options={bearbLineOptions as any}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Card
                  bodyStyle={{
                    padding: 16,
                  }}
                >
                  <div style={{ 
                    width: "100%", 
                    height: 300,
                    maxWidth: "350px",
                    margin: "0 auto"
                  }}>
                    <ChartPie
                      data={bearbPieData}
                      options={bearbPieOptions as any}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Neues Diagramm: Aufgenommene vs. Nicht aufgenommene Werte pro Aggregat */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24}>
              <Card bodyStyle={{ padding: 16 }} title="Aufgenommene Werte pro Aggregat">
                <div style={{ width: "100%", height: 400 }}>
                  <Column
                    data={bearbAggregatData.flatMap(item => [
                      {
                        key: `${item.aggregat}-${item.schicht}`,
                        aggregat: item.aggregat,
                        schicht: item.schicht,
                        type: 'Aufgenommene Werte',
                        value: item.aufgenommen || 0,
                        total: item.total,
                      },
                      {
                        key: `${item.aggregat}-${item.schicht}`,
                        aggregat: item.aggregat,
                        schicht: item.schicht,
                        type: 'Nicht aufgenommene Werte',
                        value: item.nichtAufgenommen || 0,
                        total: item.total,
                      },
                    ])}
                    xField="key"
                    yField="value"
                    seriesField="type"
                    isStack={true}
                    color={['rgb(46, 140, 255)', 'rgb(28, 182, 179)']}
                    label={{
                      position: 'top',
                      content: (data: any) => {
                        const total = data.total;
                        const value = data.value;
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${value} (${percent}%)`;
                      },
                    }}
                    tooltip={{
                      formatter: (data: any) => {
                        const total = data.total;
                        const value = data.value;
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return { name: data.type, value: `${value} (${percent}%)` };
                      },
                    }}
                    xAxis={{
                      label: {
                        formatter: (key: string) => {
                          const [agg, schicht] = key.split('-');
                          const schichtLabel = schicht === 'früh' ? 'FS' : schicht === 'spät' ? 'SS' : 'NS';
                          return `${agg}\n${schichtLabel}`;
                        },
                        style: { fontSize: 10 },
                      },
                    }}
                    yAxis={{
                      title: { text: 'Anzahl Werte' },
                    }}
                    legend={{
                      position: 'top',
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
      </div>

      {/* KPI Modal */}
      <Modal
        title="KPIs bearbeiten (13.10.-19.10.)"
        open={isKpiModalVisible}
        onCancel={() => setIsKpiModalVisible(false)}
        onOk={() => setIsKpiModalVisible(false)}
        width={800}
      >
        <Form layout="vertical">
          {["13.10.2025", "14.10.2025", "15.10.2025", "16.10.2025", "17.10.2025", "18.10.2025", "19.10.2025"].map(date => (
            <div key={date} style={{ marginBottom: 20 }}>
              <h4>{date}</h4>
              <Row gutter={16}>
                {["früh", "spät", "nacht"].map(shift => {
                  const key = `${date}.${shift}`;
                  return (
                    <Col span={8} key={shift}>
                      <div style={{ border: '1px solid #d9d9d9', padding: 10, borderRadius: 4 }}>
                        <h5>{shift === "früh" ? "Frühschicht" : shift === "spät" ? "Spätschicht" : "Nachtschicht"}</h5>
                        <Form.Item label="OEE (%)">
                          <InputNumber
                            min={0}
                            max={100}
                            value={kpiValues[key]?.oee}
                            onChange={(value) => setKpiValues(prev => ({
                              ...prev,
                              [key]: { ...prev[key], oee: value || 0 }
                            }))}
                          />
                        </Form.Item>
                        <Form.Item label="Leistungsgrad (%)">
                          <InputNumber
                            min={0}
                            max={100}
                            value={kpiValues[key]?.leistungsgrad}
                            onChange={(value) => setKpiValues(prev => ({
                              ...prev,
                              [key]: { ...prev[key], leistungsgrad: value || 0 }
                            }))}
                          />
                        </Form.Item>
                        <Form.Item label="Ausschuss (%)">
                          <InputNumber
                            min={0}
                            max={100}
                            value={kpiValues[key]?.ausschuss}
                            onChange={(value) => setKpiValues(prev => ({
                              ...prev,
                              [key]: { ...prev[key], ausschuss: value || 0 }
                            }))}
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))}
        </Form>
      </Modal>
    </ListContent>
  );
};
