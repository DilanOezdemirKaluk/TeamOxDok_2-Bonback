import { useEffect, useState, useMemo } from "react";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { SectionsWithDocumentCategories } from "../../../shared/components/SectionsWithDocumentCategories/SectionsWithDocumentCategories";
import { useShiftReportLoader } from "../../../shared/api/services/loader/shiftReportLoader";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import {
  formatDateString,
  getShiftString,
} from "../../../shared/globals/global";
import styles from "./ShiftReportList.module.css";
import { IShiftReportVM } from "../../../models/IShiftReport";
import { EditButton } from "../../../shared/components/EditButton/EditButton";
import { useNavigate } from "react-router-dom";
import { useSectionShiftReportLoader } from "../../../shared/api/services/loader/sectionShiftReportLoader";
import { Loading } from "../../../shared/components/Loading/Loading";
import { ShiftReportSearch } from "../../components/ShiftReportSearch/ShiftReportSearch";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import React from "react";
import { ShiftReportCreate } from "../../components/ShiftReportCreate/ShiftReportCreate";
import { useSectionWithDocumentCategoriesLoader } from "../../../shared/api/services/loader/sectionWithDocumentCategoriesLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { ShiftReportPrintList } from "../../components/ShiftReportPrintList/ShiftReportPrintList";
import { ShiftReportError } from "../../components/ShiftReportError/ShiftReportError";
import { useSelector, useDispatch } from "react-redux";
import { setReportDocumentCategoryIds } from "../../../shared/store/redux/action";
import { AppState } from "../../../shared/store/redux/reducer";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { IOutputList } from "../../../models/IOutputList";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { Chart } from "react-chartjs-2";
import { Card, Select, Space, Modal, Form, InputNumber, Button } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface IShiftReportListProps {
  testMode: boolean;
}

export const ShiftReportList: React.FC<IShiftReportListProps> = ({
  testMode,
}) => {
  const dispatch = useDispatch();
  const currentWorkgroupId = useCurrentWorkgroupId();
  const hasFillShiftReport = useAuthorizationCheck(
    AuthorizationType.FillShiftReport
  );
  const navigate = useNavigate();
  const { sections, reloadSections } = useSectionShiftReportLoader(testMode);
  const {
    sections: sectionsWithDocumentCategories,
    reloadSections: reloadSectionsWithDocumentCategories,
  } = useSectionWithDocumentCategoriesLoader();
  const [showData, setShowData] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filterError, setFilterError] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [resetDocumentCategories, setResetDocumentCategories] = useState(false);
  const [datePopup, setdatePopup] = useState(false);

  const storeDocumentCategoryIds = useSelector(
    (state: AppState) => state.documentCategoryIds
  );

  const onDocumentCategoryChange = (documentCategoryIds: number[]) => {
    dispatch(setReportDocumentCategoryIds(documentCategoryIds));
    setDocumentCategoryIds(documentCategoryIds);
    search();
  };

  useEffect(() => {
    onDocumentCategoryChange(storeDocumentCategoryIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [documentCategoryIds, setDocumentCategoryIds] = useState<number[]>(
    storeDocumentCategoryIds
  );

  const {
    data,
    loading: loadingTemplate,
    triggerReload,
  } = useShiftReportLoader(
    documentCategoryIds,
    startDate,
    endDate,
    shiftFilter,
    testMode
  );

  const generateOutputListColumns = (
    data: IShiftReportVM[],
    documentCategoryId: number
  ): any[] => {
    if (!data) return [];
    const uniqueOutputLists: IOutputList[] = [];
    data
      .filter(
        (r) => r.shiftReportTemplate.documentCategory.id === documentCategoryId
      )
      .forEach((r) =>
        r.shiftReportTemplate.outputLists?.forEach((o) => {
          if (!uniqueOutputLists.some((u) => u.id === o.id))
            uniqueOutputLists.push(o);
        })
      );

    return uniqueOutputLists.map((outputList) => ({
      title: outputList.description,
      dataIndex: `outputList_${outputList.id}`,
      key: `outputList_${outputList.id}`,
      width: 0,
      className: styles.hiddenColumn,
      render: (_: string, row: IShiftReportVM) => {
        const obj = row.objects.find(
          (ob) =>
            ob.shiftReportTemplateTableObject?.id.toString() ===
            outputList.objectId.toString()
        );
        return null;
      },
      exportRender: (_: string, row: IShiftReportVM) => {
        const obj = row.objects.find(
          (ob) =>
            ob.shiftReportTemplateTableObject?.id.toString() ===
            outputList.objectId.toString()
        );
        return obj?.value ?? "";
      },
    }));
  };

  const generateExcelOutputListColumns = (
    data: IShiftReportVM[],
    documentCategoryId: number
  ): any[] => {
    if (!data) return [];

    const uniqueOutputLists: IOutputList[] = [];

    const filterdData = data.filter(
      (shiftReport) =>
        shiftReport.shiftReportTemplate.documentCategory.id ===
        documentCategoryId
    );

    filterdData.forEach((shiftReport: IShiftReportVM) => {
      shiftReport.templateOutputlistObjects?.forEach((outputList) => {
        if (!uniqueOutputLists.some((item) => item.id === outputList.id)) {
          uniqueOutputLists.push(outputList);
        }
      });
    });

    const outputListColumns = uniqueOutputLists.map((outputList) => ({
      title: outputList.description,
      dataIndex: `outputList_${outputList.id}`,
      key: `outputList_${outputList.id}`,
      render: (_text: string, obj: IShiftReportVM) => {
        const shiftReportTemplateObject = obj.objects.find(
          (objObj) =>
            objObj.shiftReportTemplateTableObject?.id.toString() ===
            outputList.objectId.toString()
        );
        if (shiftReportTemplateObject) {
          return <span>{shiftReportTemplateObject.value}</span>;
        } else {
          return <span></span>;
        }
      },
      exportRender: (_text: string, obj: IShiftReportVM) => {
        const shiftReportTemplateObject = obj.objects.find(
          (objObj) =>
            objObj.shiftReportTemplateTableObject?.id.toString() ===
            outputList.objectId.toString()
        );
        if (shiftReportTemplateObject) {
          return shiftReportTemplateObject.value;
        } else {
          return "";
        }
      },
    }));

    return outputListColumns;
  };

  const columns = [
    {
      title: "Schicht",
      dataIndex: "shiftId",
      key: "shiftId",
      render: (shift: number) => <span>{getShiftString(shift)}</span>,
      exportRender: (shift: number) => getShiftString(shift),
    },
    {
      title: "Angelegt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => <span>{formatDateString(d)}</span>,
      exportRender: (d: string) => formatDateString(d),
    },
    {
      title: "Geändert",
      dataIndex: "changedAt",
      key: "changedAt",
      render: (d: string) => <span>{formatDateString(d)}</span>,
      exportRender: (d: string) => formatDateString(d),
    },
    {
      title: "Letzter Bearbeiter",
      dataIndex: "changedBy",
      key: "changedBy",
      render: (_text: string, obj: IShiftReportVM) => (
        <span>{`${obj.changedByName}`}</span>
      ),
      exportRender: (_text: string, obj: IShiftReportVM) => obj.changedByName,
    },
  ];

  const getData = (documentCategoryId: number) => {
    if (data) {
      const result = data.filter(
        (d) =>
          d.shiftReportTemplate.documentCategory.id === documentCategoryId &&
          d.shiftReportTemplate.documentCategory.section.workgroupId ===
            currentWorkgroupId
      );
      return result;
    }
  };

  const getDataLength = (documentCategoryId: number) => {
    const data = getData(documentCategoryId);
    if (!data) {
      return 0;
    }
    return data.length;
  };

  const onEdit = (obj: IShiftReportVM, readOnly: boolean) => {
    if (testMode && hasFillShiftReport) {
      navigate(
        `/shiftReportListTest/shiftReportEdit/${obj.id}?readOnly=${readOnly}`
      );
    } else {
      navigate(
        `/shiftReportList/shiftReportEdit/${obj.id}?readOnly=${readOnly}`
      );
    }
  };

  const onSearch = (item: IShiftReportVM) => {
    const windowFeatures =
      "width=1090,height=600,toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes";
    const newWindow = window.open(
      "/print/shiftReportPrint/" + item.id,
      "_blank",
      windowFeatures
    );
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.scrollTo(0, 1);
      };
    }
  };

  const search = () => {
    let found = false;
    if (startDate && endDate && endDate > startDate) {
      found = true;
    } else if (!startDate && endDate) {
      setdatePopup(true);
      setFilterError("Startdatum ist nicht definiert.");
    } else if (startDate && endDate && endDate < startDate) {
      setdatePopup(true);
      setFilterError("Das Enddatum liegt vor dem Startdatum.");
    } else {
      found = true;
    }
    if (found) {
      setShowData(true);
      setFilterError("");
      triggerReload();
    }
  };

  const resetFilter = () => {
    setShowData(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setFilterError("");
    setShiftFilter("");
    setDocumentCategoryIds([]);
    setResetDocumentCategories(true);
  };

  useEffect(() => {
    if (resetDocumentCategories) {
      setResetDocumentCategories(false);
    }
  }, [resetDocumentCategories]);

  useEffect(() => {
    reloadSections();
    triggerReload();
    reloadSectionsWithDocumentCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode]);

  const exportToExcel = (name: string, id: number, columns: any[]) => {
    const tableData = getData(id);
    if (tableData === undefined) {
      return;
    }

    const header = columns.map((col) => col.title);

    const data = tableData.map((row: any) =>
      columns.map((col) => {
        if (col.exportRender) {
          return col.exportRender(row[col.dataIndex], row);
        }
        return row[col.dataIndex];
      })
    );

    const worksheetData = [header, ...data];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tabelle");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${name}.xlsx`);
  };

  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedAggregat, setSelectedAggregat] = useState<number | null>(null); // Yeni state
  const [selectedTagMode, setSelectedTagMode] = useState<"single" | "range">(
    "single"
  );
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedTagVon, setSelectedTagVon] = useState<string>("");
  const [selectedTagBis, setSelectedTagBis] = useState<string>("");

  const aggregatOptions = useMemo(() => {
    if (!data || documentCategoryIds.length === 0) return [];

    const uniqueAggregats = new Map<number, string>();

    data.forEach((report) => {
      if (
        documentCategoryIds.includes(
          report.shiftReportTemplate.documentCategory.id
        )
      ) {
        const id = report.shiftReportTemplate.documentCategory.id;
        const name = report.shiftReportTemplate.documentCategory.name;
        if (!uniqueAggregats.has(id)) {
          uniqueAggregats.set(id, name);
        }
      }
    });

    return Array.from(uniqueAggregats.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data, documentCategoryIds]);

  // Tek aggregat seçiliyse otomatik seç
  useEffect(() => {
    if (aggregatOptions.length === 1) {
      setSelectedAggregat(aggregatOptions[0].id);
    } else if (aggregatOptions.length === 0) {
      setSelectedAggregat(null);
    } else if (
      selectedAggregat &&
      !aggregatOptions.some((a) => a.id === selectedAggregat)
    ) {
      // Seçili aggregat artık listede yoksa null yap
      setSelectedAggregat(null);
    }
  }, [aggregatOptions, selectedAggregat]);

  const parameterOptions = useMemo(() => {
    if (!data || !selectedAggregat) return [];

    const outputLists: IOutputList[] = [];

    data.forEach((report) => {
      if (report.shiftReportTemplate.documentCategory.id === selectedAggregat) {
        report.shiftReportTemplate.outputLists?.forEach((outputList) => {
          if (
            !outputLists.some((ol) => ol.description === outputList.description)
          ) {
            outputLists.push(outputList);
          }
        });
      }
    });

    return outputLists.map((obj) => obj.description);
  }, [data, selectedAggregat]);

  const staticParamLimits: Record<string, { min: number; max: number }> =
    useMemo(
      () => ({
        Chargengröße: { min: 205, max: 210 },
        Rückteigmenge: { min: 28, max: 33 },
        "Wasser Korrekturwert": { min: -1.6, max: -1 },
        "Hefe Korrekturwert": { min: -0.1, max: 0.3 },
        "Soll-Wassertemperatur": { min: 2, max: 6 },
        "Soll-Teigtemperatur": { min: 24, max: 27 },
        Teigeinwaage: { min: 46, max: 48 },
        Wirkbewegung: { min: 155, max: 170 },
        "Wirken quer/längst": { min: 56, max: 60 },
        Wirkbandspannung: { min: 63, max: 68 },
        Wirkbandposition: { min: 6, max: 9 },
        "Mehler 1": { min: 1, max: 3 },
        "Mehler 1 A2": { min: 0, max: 1 },
        "Mehler 2": { min: 1, max: 4 },
        "Mehler 2 A3": { min: 1, max: 2 },
        "Mehler 3": { min: 1, max: 3 },
        "Mehler 4": { min: 0, max: 1 },
        Geschwindigkeit: { min: 104, max: 104 },
        "Oberband A1": { min: 0, max: 1 },
        "Oberband A2": { min: 0, max: 2 },
        "Oberband A3": { min: -3, max: 0 },
        "Unterband A1": { min: 206, max: 208 },
        "Unterband A2": { min: 240, max: 245 },
        "Unterband A3": { min: 200, max: 200 },
        "Position Einlauf A1": { min: 38, max: 40 },
        "Position Einlauf A2": { min: 19, max: 21 },
        "Position Einlauf A3": { min: 28, max: 33 },
        "Position Auslauf A1": { min: 30, max: 35 },
        "Position Auslauf A2": { min: 17, max: 20 },
        "Position Auslauf A3": { min: 28, max: 32 },
        "Heben A1": { min: 160, max: 200 },
        "Heben A2": { min: 220, max: 230 },
        "Heben A3": { min: 150, max: 180 },
        "Heben Transportband": { min: 80, max: 100 },
        "Senken A1": { min: 200, max: 300 },
        "Senken A2": { min: 150, max: 160 },
        "Senken A3": { min: 250, max: 280 },
        "Senken Transportband": { min: 320, max: 330 },
        Start: { min: 70, max: 80 },
        Schrittlänge: { min: 224, max: 232 },
        Drehzahl: { min: 70, max: 80 },
        "Position Zentrier vor Stanze": { min: 65, max: 65 },
        "Position Zentrier Stanze": { min: 1.2, max: 1.4 },
        Austragung: { min: 348, max: 353 },
        "Temperatur Zone 1": { min: 38, max: 39.5 },
        "Feuchtigkeit Zone 1": { min: 60, max: 64 },
        "Temperatur Absteifzone": { min: 18, max: 20 },
        "Einlauf Reihenabstand": { min: 104, max: 108 },
        Temperatur: { min: 175, max: 180 },
        Füllhöhe: { min: 101, max: 110 },
        "Auslauf Reihenabstand": { min: 264, max: 280 },
        Höhenverstellung: { min: 35, max: 45 },
        "Stopper Start": { min: 270, max: 290 },
        Dauer: { min: 350, max: 350 },
        Bodentunkwalze: { min: 66, max: 72 },
        "Temperatur Sollich": { min: 42, max: 48 },
        "Streurinne Geschwindigkeit": { min: 84, max: 88 },
        "Streurinne vor Bunkerblech": { min: 7, max: 7 },
      }),
      []
    );

  const tagOptions = useMemo(() => {
    const tags = data?.map((report) => {
      const dateObj =
        typeof report.createdAt === "string"
          ? new Date(report.createdAt)
          : report.createdAt;
      return dateObj ? dateObj.toISOString().slice(0, 10) : "";
    });
    return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
  }, [data]);

  useEffect(() => {
    if (parameterOptions.length && !selectedParameter) {
      setSelectedParameter(parameterOptions[0]);
    }
  }, [parameterOptions, selectedParameter]);

  useEffect(() => {
    if (selectedTagMode === "single" && tagOptions.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      setSelectedTag(
        tagOptions.includes(today) ? today : tagOptions[tagOptions.length - 1]
      );
    }
  }, [tagOptions, selectedTagMode]);

  const normalizeParamName = (paramName: string): string => {
    return paramName
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*\[[^\]]*\]/g, "")
      .trim();
  };

  const getStaticLimits = (
    paramName: string
  ): { min: number; max: number } | undefined => {
    const normalized = normalizeParamName(paramName);

    if (staticParamLimits[paramName]) {
      return staticParamLimits[paramName];
    }

    if (staticParamLimits[normalized]) {
      return staticParamLimits[normalized];
    }

    const matchingKey = Object.keys(staticParamLimits).find(
      (key) => normalizeParamName(key) === normalized
    );

    if (matchingKey) {
      return staticParamLimits[matchingKey];
    }

    return undefined;
  };

  const chartDataRaw = useMemo(() => {
    if (!selectedAggregat) return [];

    const outputLists =
      data?.find(
        (r) => r.shiftReportTemplate.documentCategory.id === selectedAggregat
      )?.shiftReportTemplate?.outputLists ?? [];

    const paramId = outputLists.find(
      (obj) => obj.description === selectedParameter
    )?.objectId;

    return (
      data?.flatMap((report) => {
        if (
          report.shiftReportTemplate.documentCategory.id !== selectedAggregat
        ) {
          return [];
        }

        const dateObj =
          typeof report.createdAt === "string"
            ? new Date(report.createdAt)
            : report.createdAt;
        const dateStr = dateObj ? dateObj.toISOString().slice(0, 10) : "";

        const tagMatch =
          selectedTagMode === "single"
            ? dateStr === selectedTag
            : dateStr >= selectedTagVon && dateStr <= selectedTagBis;

        if (!tagMatch) return [];

        const paramObj = report.objects.find(
          (obj) =>
            obj.shiftReportTemplateTableObject?.id?.toString() ===
            paramId?.toString()
        );
        if (!paramObj) return [];

        let parsedValue: number | null = null;
        if (paramObj.value) {
          const normalizedValue = paramObj.value.toString().replace(",", ".");
          const numValue = parseFloat(normalizedValue);
          parsedValue = !isNaN(numValue) ? numValue : null;
        }

        return [
          {
            shift: getShiftString(report.shiftId),
            date: dateStr,
            value: parsedValue,
          },
        ];
      }) ?? []
    );
  }, [
    data,
    selectedParameter,
    selectedAggregat,
    selectedTag,
    selectedTagVon,
    selectedTagBis,
    selectedTagMode,
  ]);

  const dateLabels =
    selectedTagMode === "range" && selectedTagVon && selectedTagBis
      ? (() => {
          const arr = [];
          let currentDate = selectedTagVon;

          while (currentDate <= selectedTagBis) {
            arr.push(currentDate);

            const dt = new Date(currentDate + "T12:00:00");
            dt.setDate(dt.getDate() + 1);
            currentDate = dt.toISOString().slice(0, 10);
          }

          return arr;
        })()
      : selectedTag
      ? [selectedTag]
      : [];

  const [isKpiModalVisible, setIsKpiModalVisible] = useState(false);
  const [kpiValues, setKpiValues] = useState<
    Record<string, { oee: number; leistungsgrad: number; ausschuss: number }>
  >({});

  const [paramMinMax, setParamMinMax] = useState<
    Record<string, { min: number | null; max: number | null }>
  >({});

  const [isMinMaxModalVisible, setIsMinMaxModalVisible] = useState(false);
  const [minMaxParam, setMinMaxParam] = useState<string>(
    parameterOptions[0] ?? ""
  );
  const [minValueEdit, setMinValueEdit] = useState<number | null>(null);
  const [maxValueEdit, setMaxValueEdit] = useState<number | null>(null);

  useEffect(() => {
    if (!isMinMaxModalVisible) return;

    const defaults = getStaticLimits(minMaxParam);

    setMinValueEdit(paramMinMax[minMaxParam]?.min ?? defaults?.min ?? 0);
    setMaxValueEdit(paramMinMax[minMaxParam]?.max ?? defaults?.max ?? 1);
  }, [isMinMaxModalVisible, minMaxParam, paramMinMax]);

  const handleMinMaxSave = () => {
    setParamMinMax((prev) => ({
      ...prev,
      [minMaxParam]: { min: minValueEdit, max: maxValueEdit },
    }));
    setIsMinMaxModalVisible(false);
  };

  const schichtLabels = ["Frühschicht", "Spätschicht", "Nachtschicht"];
  const kpiDays = useMemo(() => tagOptions, [tagOptions]);

  useEffect(() => {
    if (!kpiDays.length) return;
    const initial: Record<
      string,
      { oee: number; leistungsgrad: number; ausschuss: number }
    > = {};
    kpiDays.forEach((date) => {
      schichtLabels.forEach((shift) => {
        const key = `${date}.${shift}`;
        if (!kpiValues[key]) {
          initial[key] = { oee: 0, leistungsgrad: 0, ausschuss: 0 };
        } else {
          initial[key] = kpiValues[key];
        }
      });
    });
    setKpiValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiDays.length]);

  const kpiLineValues = useMemo(() => {
    return dateLabels.flatMap((date) =>
      schichtLabels.map((shift) => {
        const key = `${date}.${shift}`;
        return {
          oee: kpiValues[key]?.oee ?? null,
          leistungsgrad: kpiValues[key]?.leistungsgrad ?? null,
          ausschuss: kpiValues[key]?.ausschuss ?? null,
        };
      })
    );
  }, [dateLabels, kpiValues]);

  const alleWerte = useMemo(() => {
    return chartDataRaw
      .map((d) => d.value)
      .filter((v): v is number => typeof v === "number" && !isNaN(v));
  }, [chartDataRaw]);

  const averageVal =
    alleWerte.length > 0
      ? +(alleWerte.reduce((a, b) => a + b, 0) / alleWerte.length).toFixed(2)
      : 0;

  const finalValidSelectedParameter =
    selectedParameter && selectedParameter.length > 0
      ? selectedParameter
      : parameterOptions.length > 0
      ? parameterOptions[0]
      : "";

  const finalChartMinMax = useMemo(() => {
    const param = finalValidSelectedParameter;

    if (!param) {
      return { min: 0, max: 1, baseMin: 0, baseMax: 1 };
    }

    const hasEditValue =
      paramMinMax[param] &&
      typeof paramMinMax[param].min === "number" &&
      typeof paramMinMax[param].max === "number";

    let baseMin: number;
    let baseMax: number;

    if (hasEditValue) {
      baseMin = paramMinMax[param].min!;
      baseMax = paramMinMax[param].max!;
    } else {
      const staticLimits = getStaticLimits(param);
      if (staticLimits) {
        baseMin = staticLimits.min;
        baseMax = staticLimits.max;
      } else {
        baseMin = 0;
        baseMax = 1;
      }
    }

    const range = Math.abs(baseMax - baseMin);

    let padding: number;
    if (range === 0) {
      padding = Math.max(Math.abs(baseMin) * 0.1, 10);
    } else if (range < 1) {
      padding = range * 0.5;
    } else {
      padding = range * 2;
    }

    const chartMin = baseMin - padding;
    const chartMax = baseMax + padding;

    return {
      min: Math.round(chartMin * 1000) / 1000, // 3 ondalık basamak
      max: Math.round(chartMax * 1000) / 1000,
      baseMin: Math.round(baseMin * 1000) / 1000,
      baseMax: Math.round(baseMax * 1000) / 1000,
    };
  }, [finalValidSelectedParameter, paramMinMax]);

  const chartJsData = useMemo(() => {
    const dataMap = new Map<string, number | null>();

    chartDataRaw.forEach((item) => {
      const key = `${item.date}_${item.shift}`;
      dataMap.set(key, item.value);
    });

    const wertData = dateLabels.flatMap((date) =>
      schichtLabels.map((shift) => {
        const key = `${date}_${shift}`;
        return dataMap.get(key) ?? null;
      })
    );

    return {
      labels: dateLabels.flatMap((date) =>
        schichtLabels.map((shift) => `${shift}\n${date}`)
      ),
      datasets: [
        {
          label: "Min",
          data: dateLabels.flatMap(() =>
            schichtLabels.map(() => finalChartMinMax.baseMin)
          ),
          borderColor: "#1890ff73",
          borderDash: [4, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          backgroundColor: "rgba(24,144,255,0.10)",
          order: 1,
        },
        {
          label: "Max",
          data: dateLabels.flatMap(() =>
            schichtLabels.map(() => finalChartMinMax.baseMax)
          ),
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
          data: wertData,
          borderColor: "rgba(24,144,255,1)",
          backgroundColor: "rgba(24,144,255,0.1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(24,144,255,1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          fill: false,
          tension: 0,
          order: 3,
          spanGaps: false,
        },
        {
          label: "Mittelwert",
          data: dateLabels.flatMap(() => schichtLabels.map(() => averageVal)),
          borderColor: "#da072e",
          borderDash: [6, 2],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.2,
          order: 4,
        },
        {
          label: "OEE",
          data: kpiLineValues.map((v) => v.oee),
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
          hidden: false,
          yAxisID: "y2",
          spanGaps: false,
        },
        {
          label: "Leistungsgrad",
          data: kpiLineValues.map((v) => v.leistungsgrad),
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
          hidden: false,
          yAxisID: "y2",
          spanGaps: false,
        },
        {
          label: "Ausschuss",
          data: kpiLineValues.map((v) => v.ausschuss),
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
          hidden: false,
          yAxisID: "y2",
          spanGaps: false,
        },
      ],
    };
  }, [chartDataRaw, averageVal, kpiLineValues, dateLabels, finalChartMinMax]);

  const chartJsOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      title: {
        display: true,
        text: `${finalValidSelectedParameter} Trend nach Schicht`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"line">[]) => {
            const idx = tooltipItems[0].dataIndex;
            return (chartJsData as any).labels[idx];
          },
          label: (tooltipItem: any) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.formattedValue;
            if (
              label === "OEE" ||
              label === "Leistungsgrad" ||
              label === "Ausschuss"
            ) {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          },
        },
      },
      annotation: {
        annotations: {
          minLine: {
            type: "line" as const,
            yMin: finalChartMinMax.baseMin,
            yMax: finalChartMinMax.baseMin,
            borderColor: "rgba(24,144,255,0.45)",
            borderWidth: 2,
            borderDash: [4, 4],
            label: {
              enabled: true,
              content: `Min (${finalChartMinMax.baseMin})`,
              position: "start" as const,
              backgroundColor: "rgba(24,144,255,0.1)",
              color: "rgba(24,144,255,0.7)",
              font: { weight: "bold" as const },
            },
          },
          maxLine: {
            type: "line" as const,
            yMin: finalChartMinMax.baseMax,
            yMax: finalChartMinMax.baseMax,
            borderColor: "rgba(24,144,255,0.45)",
            borderWidth: 2,
            borderDash: [4, 4],
            label: {
              enabled: true,
              content: `Max (${finalChartMinMax.baseMax})`,
              position: "start" as const,
              backgroundColor: "rgba(24,144,255,0.1)",
              color: "rgba(24,144,255,0.7)",
              font: { weight: "bold" as const },
            },
          },
        },
      },
    },
    scales: {
      y: {
        min: finalChartMinMax.min,
        max: finalChartMinMax.max,
        title: { display: true, text: finalValidSelectedParameter },
      },
      y2: {
        min: 0,
        max: 100,
        position: "right" as const,
        title: { display: true, text: "OEE / Leistungsgrad / Ausschuss (%)" },
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (v: any) => v + "%",
          stepSize: 10,
        },
      },
    },
  };

  return (
    <>
      <ListContent>
        {sections && (
          <SectionsWithDocumentCategories
            sections={sections}
            onChange={onDocumentCategoryChange}
            reset={resetDocumentCategories}
            selectedDocumentCategoryIds={documentCategoryIds}
          />
        )}

        <Card
          title="Abweichungsanalyse"
          extra={
            <Space>
              <Button onClick={() => setIsKpiModalVisible(true)}>
                KPIs bearbeiten
              </Button>
              <Button onClick={() => setIsMinMaxModalVisible(true)}>
                Edit Min/Max
              </Button>
            </Space>
          }
          style={{ marginTop: 20, marginBottom: 20 }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
              {aggregatOptions.length > 1 && (
                <>
                  <span>Aggregat:</span>
                  <Select
                    value={selectedAggregat}
                    onChange={setSelectedAggregat}
                    style={{ width: 200 }}
                    placeholder="Aggregat auswählen"
                  >
                    {aggregatOptions.map((agg) => (
                      <Select.Option key={agg.id} value={agg.id}>
                        {agg.name}
                      </Select.Option>
                    ))}
                  </Select>
                </>
              )}
              <span>Parameter:</span>
              <Select
                value={selectedParameter}
                onChange={setSelectedParameter}
                style={{ width: 220 }}
                disabled={!selectedAggregat}
              >
                {parameterOptions.map((param) => (
                  <Select.Option key={param} value={param}>
                    {param}
                  </Select.Option>
                ))}
              </Select>
              <span>Zeitraum:</span>
              <Select
                value={selectedTagMode}
                onChange={(v) => setSelectedTagMode(v as "single" | "range")}
                style={{ width: 120 }}
              >
                <Select.Option value="single">Datum</Select.Option>
                <Select.Option value="range">Von-Bis</Select.Option>
              </Select>
              {selectedTagMode === "single" ? (
                <Select
                  value={selectedTag}
                  onChange={setSelectedTag}
                  style={{ width: 120 }}
                >
                  {tagOptions.map((tag) => (
                    <Select.Option key={tag} value={tag}>
                      {tag}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <>
                  <Select
                    value={selectedTagVon}
                    onChange={setSelectedTagVon}
                    style={{ width: 110 }}
                    placeholder="Von"
                  >
                    {tagOptions.map((tag) => (
                      <Select.Option key={tag} value={tag}>
                        {tag}
                      </Select.Option>
                    ))}
                  </Select>
                  <span>-</span>
                  <Select
                    value={selectedTagBis}
                    onChange={setSelectedTagBis}
                    style={{ width: 110 }}
                    placeholder="Bis"
                  >
                    {tagOptions.map((tag) => (
                      <Select.Option key={tag} value={tag}>
                        {tag}
                      </Select.Option>
                    ))}
                  </Select>
                </>
              )}
            </Space>
            <div style={{ width: "100%", height: 400, maxWidth: 1200 }}>
              <Chart
                type="line"
                data={chartJsData as any}
                options={chartJsOptions as any}
              />
            </div>
          </Space>
        </Card>

        <ShiftReportSearch
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onShiftChange={setShiftFilter}
          onResetFilter={resetFilter}
          initStart={startDate}
          initEnd={endDate}
        />
        <div className={styles.buttonContainer}>
          <div className={styles.leftAlignedButtons}>
            <div>
              <ActionButton
                title="Anzeigen"
                onClick={() => {
                  search();
                }}
              />
            </div>
            {testMode && hasFillShiftReport && (
              <div>
                <ActionButton
                  title="Anlegen"
                  onClick={() => {
                    setShowCreate(true);
                  }}
                />
              </div>
            )}
          </div>
          <div className={styles.rightAlignedButton}>
            <div>
              <ActionButton
                title="Drucken"
                onClick={() => {
                  setShowPrint(true);
                }}
              />
            </div>
          </div>
        </div>
        {loadingTemplate && <Loading />}

        {showData &&
          data &&
          documentCategoryIds.map((id) => (
            <React.Fragment key={id}>
              {getDataLength(id) > 0 && (
                <>
                  <div>
                    <ActionButton
                      title="Excel-Export"
                      onClick={() => {
                        exportToExcel(
                          sections
                            ?.find((s) =>
                              s.documentCategories.some((d) => d.id === id)
                            )
                            ?.documentCategories.find((d) => d.id === id)
                            ?.name ?? "",
                          id,
                          [
                            ...columns,
                            ...generateExcelOutputListColumns(data, id),
                          ]
                        );
                      }}
                    />
                  </div>
                  <div className={styles.sectionContainer}>
                    {
                      sections
                        ?.find((s) =>
                          s.documentCategories.some((d) => d.id === id)
                        )
                        ?.documentCategories.find((d) => d.id === id)?.name
                    }
                  </div>
                  <div className={styles.tableScroll}>
                    <OverviewTable
                      dataSource={getData(id)}
                      columns={[
                        ...columns,
                        ...generateOutputListColumns(data, id),
                        {
                          title: "Aktionen",
                          dataIndex: "actions",
                          key: "actions",
                          width: 120,
                          render: (_: string, obj: IShiftReportVM) => (
                            <div className={styles.leftAlignedButtons}>
                              {obj.disabled === false && (
                                <EditButton
                                  onClick={() => onEdit(obj, false)}
                                />
                              )}
                              <ActionButton onClick={() => onEdit(obj, true)}>
                                <SearchOutlined />
                              </ActionButton>
                              <ActionButton onClick={() => onSearch(obj)}>
                                <PrinterOutlined />
                              </ActionButton>
                            </div>
                          ),
                        },
                      ]}
                      pageSize={4}
                    />
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        {sectionsWithDocumentCategories && (
          <>
            <ShiftReportCreate
              show={showCreate}
              onClose={() => setShowCreate(false)}
              sections={sectionsWithDocumentCategories}
            />
            <ShiftReportPrintList
              show={showPrint}
              onClose={() => setShowPrint(false)}
              sections={sectionsWithDocumentCategories}
            />
          </>
        )}
      </ListContent>
      <ShiftReportError
        open={datePopup}
        onOk={() => setdatePopup(false)}
        title={filterError}
      />

      <Modal
        title="KPIs bearbeiten"
        open={isKpiModalVisible}
        onCancel={() => setIsKpiModalVisible(false)}
        onOk={() => setIsKpiModalVisible(false)}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Tag auswählen">
            <Select
              value={selectedTag}
              onChange={setSelectedTag}
              style={{ width: "100%" }}
            >
              {kpiDays.map((date) => (
                <Select.Option key={date} value={date}>
                  {date}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            {schichtLabels.map((shift) => {
              const key = `${selectedTag}.${shift}`;
              return (
                <div
                  key={shift}
                  style={{
                    flex: 1,
                    border: "1px solid #d9d9d9",
                    padding: 10,
                    borderRadius: 4,
                  }}
                >
                  <h5>{shift}</h5>
                  <Form.Item label="OEE (%)">
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      precision={1}
                      value={kpiValues[key]?.oee}
                      onChange={(value) => {
                        if (value !== null && value !== undefined) {
                          const rounded = Math.round(value * 10) / 10;
                          setKpiValues((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], oee: rounded },
                          }));
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="Leistungsgrad (%)">
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      precision={1}
                      value={kpiValues[key]?.leistungsgrad}
                      onChange={(value) => {
                        if (value !== null && value !== undefined) {
                          const rounded = Math.round(value * 10) / 10;
                          setKpiValues((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], leistungsgrad: rounded },
                          }));
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="Ausschuss (%)">
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      precision={1}
                      value={kpiValues[key]?.ausschuss}
                      onChange={(value) => {
                        if (value !== null && value !== undefined) {
                          const rounded = Math.round(value * 10) / 10;
                          setKpiValues((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], ausschuss: rounded },
                          }));
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              );
            })}
          </div>
        </Form>
      </Modal>

      <Modal
        title="Edit Min/Max Value"
        open={isMinMaxModalVisible}
        onCancel={() => setIsMinMaxModalVisible(false)}
        onOk={handleMinMaxSave}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="Parameter">
            <Select
              value={minMaxParam}
              onChange={setMinMaxParam}
              style={{ width: "100%" }}
            >
              {parameterOptions.map((param) => (
                <Select.Option key={param} value={param}>
                  {param}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Min Value">
            <InputNumber
              min={-9999}
              max={9999}
              step={0.01}
              precision={2}
              value={minValueEdit}
              onChange={setMinValueEdit}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Max Value">
            <InputNumber
              min={-9999}
              max={9999}
              step={0.01}
              precision={2}
              value={maxValueEdit}
              onChange={setMaxValueEdit}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
