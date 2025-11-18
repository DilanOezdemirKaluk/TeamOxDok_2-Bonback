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
import { SearchButton } from "../../../shared/components/SearchButton/SearchButton";
import { useSelector, useDispatch } from "react-redux";
import { setReportDocumentCategoryIds } from "../../../shared/store/redux/action";
import { AppState } from "../../../shared/store/redux/reducer";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { IOutputList } from "../../../models/IOutputList";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IObjectType } from "../../../models/IShiftReportTemplateTable";
import { PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { Chart } from "react-chartjs-2";
import { Card, Select, Space } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

    const filterdData = data.filter(
      (shiftReport) =>
        shiftReport.shiftReportTemplate.documentCategory.id ===
        documentCategoryId
    );

    filterdData.forEach((shiftReport: IShiftReportVM) => {
      shiftReport.shiftReportTemplate.outputLists?.forEach((outputList) => {
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

  // Chart için state
  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedSchicht, setSelectedSchicht] = useState<string>("Frühschicht");
  const [selectedTagMode, setSelectedTagMode] = useState<"single" | "range">(
    "single"
  );
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedTagVon, setSelectedTagVon] = useState<string>("");
  const [selectedTagBis, setSelectedTagBis] = useState<string>("");

  // Parametre ve gün seçenekleri
  const parameterOptions = useMemo(() => {
    const outputLists = data?.[0]?.shiftReportTemplate?.outputLists ?? [];
    return outputLists.map((obj) => obj.description);
  }, [data]);

  const tagOptions = useMemo(() => {
    const tags = data?.map((report) => {
      const dateObj =
        typeof report.createdAt === "string"
          ? new Date(report.createdAt)
          : report.createdAt;
      return dateObj ? dateObj.toISOString().slice(0, 10) : "";
    });
    return Array.from(new Set(tags)).sort();
  }, [data]);

  useEffect(() => {
    if (parameterOptions.length) setSelectedParameter(parameterOptions[0]);
    if (tagOptions.length) {
      setSelectedTag(tagOptions[0]);
      setSelectedTagVon(tagOptions[0]);
      setSelectedTagBis(tagOptions[tagOptions.length - 1]);
    }
  }, [parameterOptions, tagOptions]);

  // selectedTag'in ilk değeri bugün olsun, sonra kullanıcı değiştirirse değişsin
  useEffect(() => {
    if (selectedTagMode === "single" && tagOptions.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      // Sadece ilk açılışta veya data değiştiğinde bugünü seç
      setSelectedTag(
        tagOptions.includes(today) ? today : tagOptions[tagOptions.length - 1]
      );
    }
  }, [tagOptions, selectedTagMode]);

  // Chart verisi oluştur
  const chartDataRaw = useMemo(() => {
    const outputLists = data?.[0]?.shiftReportTemplate?.outputLists ?? [];
    const paramId = outputLists.find(
      (obj) => obj.description === selectedParameter
    )?.objectId;

    return (
      data?.flatMap((report) => {
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

        if (
          selectedSchicht &&
          getShiftString(report.shiftId) !== selectedSchicht
        )
          return [];

        return [
          {
            shift: getShiftString(report.shiftId),
            date: dateStr,
            value: paramObj.value ? Number(paramObj.value) : null,
          },
        ];
      }) ?? []
    );
  }, [
    data,
    selectedParameter,
    selectedTag,
    selectedTagVon,
    selectedTagBis,
    selectedTagMode,
    selectedSchicht,
  ]);

  const shifts = Array.from(new Set(chartDataRaw.map((d) => d.shift)));
  const labels = chartDataRaw.map((d) => d.date);
  const datasets = shifts.map((shift, idx) => ({
    label: shift,
    data: chartDataRaw.filter((d) => d.shift === shift).map((d) => d.value),
    borderColor: ["#1890ff", "#13c2c2", "#d4380d"][idx % 3],
    backgroundColor: ["#1890ff33", "#13c2c233", "#d4380d33"][idx % 3],
    tension: 0.3,
    pointRadius: 4,
  }));
  const chartJsData = { labels, datasets };

  const allValues = chartDataRaw
    .map((d) => d.value)
    .filter((v): v is number => v !== null && v !== undefined);

  // Eğer hiç veri yoksa min/max göndermeyin, Chart.js default aralığı kullanır
  const chartJsOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      title: { display: true, text: `${selectedParameter} Trend nach Schicht` },
    },
    scales: {
      y:
        allValues.length > 0
          ? {
              min: Math.min(...allValues) - 2,
              max: Math.max(...allValues) + 2,
            }
          : undefined,
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
                  <OverviewTable
                    dataSource={getData(id)}
                    columns={[
                      ...columns,
                      ...generateOutputListColumns(data, id),
                      {
                        title: "Aktionen",
                        dataIndex: "actions",
                        key: "actions",
                        width: 150,
                        render: (_text: string, obj: IShiftReportVM) => (
                          <div className={styles.leftAlignedButtons}>
                            {obj.disabled === false && (
                              <EditButton onClick={() => onEdit(obj, false)} />
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
      <Card title="Abweichungsanalyse">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <span>Parameter:</span>
            <Select
              value={selectedParameter}
              onChange={(v) => {
                setSelectedParameter(v);
              }}
              style={{ width: 220 }}
            >
              {parameterOptions.map((param) => (
                <Select.Option key={param} value={param}>
                  {param}
                </Select.Option>
              ))}
            </Select>
            <span>Schicht:</span>
            <Select
              value={selectedSchicht}
              onChange={(v) => {
                setSelectedSchicht(v);
              }}
              style={{ width: 140 }}
            >
              <Select.Option value="Frühschicht">Frühschicht</Select.Option>
              <Select.Option value="Spätschicht">Spätschicht</Select.Option>
              <Select.Option value="Nachtschicht">Nachtschicht</Select.Option>
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
          <Chart type="line" data={chartJsData} options={chartJsOptions} />
        </Space>
      </Card>
    </>
  );
};
