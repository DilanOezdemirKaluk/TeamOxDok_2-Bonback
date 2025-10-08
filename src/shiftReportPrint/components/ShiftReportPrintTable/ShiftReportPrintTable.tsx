import React from "react";
import {
  IObjectFormat,
  IObjectType,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import styles from "./ShiftReportPrintTable.module.css";
import { Input, Table } from "antd";
import {
  IShiftReportEditVM,
  IShiftReportObject,
} from "../../../models/IShiftReport";
import { IConstantVM, IConstantGroupVM } from "../../../models/IConstant";
import {
  getCalculationValue,
  getColumnWidth_ShiftReportTableData,
} from "../../../shared/globals/global";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/de";

interface IShiftReportPrintTableProps {
  item: IShiftReportTemplateTableVM;
  objects: IShiftReportObject[];
  constants: IConstantVM[];
  constantGroups: IConstantGroupVM[];
  report?: IShiftReportEditVM;
}

export const ShiftReportPrintTable: React.FC<IShiftReportPrintTableProps> = ({
  item,
  objects,
  constantGroups,
  constants,
  report,
}) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.locale("de");

  interface CustomData {
    key: string;
    items: IShiftReportTemplateTableObjectVM[];
  }

  const generateColumns = () => {
    const columns: {
      title: string;
      dataIndex: string;
      key: string;
      render: (
        text: string,
        record: CustomData,
        index: number
      ) => React.ReactNode;
      width?: string;
    }[] = [];

    for (let i = 1; i <= item.columns; i++) {
      columns.push({
        title: `${i}`,
        dataIndex: `${i}`,
        key: `${i}`,
        render: (text, record, index) => renderInput(text, record, index, i),
        width: "100px",
      });
    }
    columns.forEach((col, index) => {});
    return columns;
  };

  const renderInput = (
    text: string,
    record: CustomData,
    index: number,
    columnIndex: number
  ) => {
    const objItem = record.items[columnIndex - 1];
    if (objItem === undefined) {
      return <></>;
    }
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0",
          width: `${getColumnWidth_ShiftReportTableData(item, columnIndex)}px`,
          textAlign: objItem.alignment ?? "center",
          marginRight: "10px",
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
      >
        {getControl(objItem, columnIndex)}
      </div>
    );
  };

  const getSpanControl = (
    obj: IShiftReportTemplateTableObjectVM,
    columnIndex: number
  ) => {
    return (
      <span
        style={{
          fontSize: `${obj.fontSize}pt`,
          fontWeight: obj.type === IObjectType.Label ? "bold" : "normal",
          color: obj.backgroundColor,
          width: `${getColumnWidth_ShiftReportTableData(item, columnIndex)}px`,
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
          border: obj.showBorder ? "1px solid #d9d9d9" : "none",
          borderRadius: obj.showBorder ? "6px" : "0px",
        }}
      >
        {getValue(obj)}
      </span>
    );
  };

  const getControl = (
    obj: IShiftReportTemplateTableObjectVM,
    columnIndex: number
  ) => {
    if (obj === undefined) {
      return "";
    }

    if (item.isDatabase && obj.type === IObjectType.Input) {
      obj.showBorder = true;
    }

    switch (obj.type) {
      case IObjectType.Input:
        return (
          <>
            {obj.format === IObjectFormat.Text && (
              <Input.TextArea
                autoSize
                disabled={false}
                value={getValue(obj)}
                style={{
                  width: `${getColumnWidth_ShiftReportTableData(
                    item,
                    columnIndex
                  )}px`,
                  border: obj.showBorder ? "" : "none",
                  resize: "none",
                  cursor: "default",
                  overflow: "hidden",
                  boxShadow: "none",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              />
            )}
            {obj.format === IObjectFormat.Number && (
              <Input.TextArea
                autoSize
                disabled={false}
                value={getValue(obj)}
                style={{
                  padding: "0",
                  width: `${getColumnWidth_ShiftReportTableData(
                    item,
                    columnIndex
                  )}px`,
                  border: obj.showBorder ? "" : "none",
                  resize: "none",
                  cursor: "default",
                  overflow: "hidden",
                  boxShadow: "none",
                }}
              />
            )}
            {obj.format === IObjectFormat.DateField &&
              getSpanControl(obj, columnIndex)}
            {obj.format === IObjectFormat.DateTime &&
              getSpanControl(obj, columnIndex)}
            {obj.format === IObjectFormat.Time &&
              getSpanControl(obj, columnIndex)}
          </>
        );
      default:
        return getSpanControl(obj, columnIndex);
    }
  };

  const getValue = (obj: IShiftReportTemplateTableObjectVM) => {
    let reportObj = objects.find(
      (o) =>
        o.shiftReportTemplateTableObject?.id?.toString() === obj.id.toString()
    );
    let value = "";
    if (reportObj !== undefined) {
      value = reportObj.value;
    }

    switch (obj.type) {
      case IObjectType.Label:
        value = obj.value;
        break;
      case IObjectType.Input:
        if (value.length === 0) {
          value = obj.value;
        }

        if (value.length > 0) {
          switch (obj.format) {
            case IObjectFormat.DateField:
              value = value ? dayjs(value).format("DD.MM.YYYY") : "";
              break;
            case IObjectFormat.DateTime:
              value = value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "";
              break;
            case IObjectFormat.Time:
              const localDate = dayjs.utc(value).tz("Europe/Berlin");
              const formattedDate = localDate.format("HH:mm");
              value = formattedDate;
              break;
          }
        }

        break;
      case IObjectType.Calculation:
        value = getCalculationValue(obj.value, objects);
        break;
      case IObjectType.TransferFromReport:
        value = obj.value;
        break;
      case IObjectType.LOV:
        value = constants.find((c) => c.id.toString() === value)?.name ?? "";
        break;
      case IObjectType.Selection:
        const valueArray: string[] = value.split(",").map((v) => v.trim());
        value = "";
        const constantNames: string[] = valueArray.map((v) => {
          const constant = constants.find((c) => c.id.toString() === v);
          return constant?.name ?? "";
        });
        constantNames.sort((a, b) => a.localeCompare(b));
        value = constantNames.join(", ");
        break;
    }
    return value;
  };

  const isRowVisible = (rowIndex: number) => {
    const templateHiddedRows = item.hiddedRows.map((row) => row.rowIndex);
    if (templateHiddedRows.length === 0) return true;

    const reportVisibleRows =
      report?.visibleRows
        .filter((r) => r.tableId === item.id)
        ?.map((r) => r.rows)
        ?.flat() || [];

    return (
      !templateHiddedRows.includes(rowIndex) ||
      reportVisibleRows.includes(rowIndex)
    );
  };

  const generateDataSource = () => {
    const rows: CustomData[] = [];
    for (let rowIndex = 1; rowIndex <= item.rows; rowIndex++) {
      const row: CustomData = {
        key: `${rowIndex}`,
        items: [],
      };

      for (let columnIndex = 1; columnIndex <= item.columns; columnIndex++) {
        const obj = item.objects.find(
          (i) => i.rowIndex === rowIndex && i.columnIndex === columnIndex
        );
        if (obj) {
          row.items.push(obj);
        }
      }

      if (isRowVisible(rowIndex)) {
        if (!item.showOnlyFilledRows) {
          rows.push(row);
        } else {
          const allLabels = row.items.every(
            (item) =>
              item.type === IObjectType.Label || item.type === IObjectType.Blank
          );
          if (allLabels) {
            rows.push(row);
          } else {
            const nonLabelItems = row.items.filter(
              (item) => item.type !== IObjectType.Label
            );
            if (nonLabelItems.length > 0) {
              let hasValue = false;
              for (let i = 0; i < nonLabelItems.length; i++) {
                let reportObj = objects.find(
                  (o) =>
                    o.shiftReportTemplateTableObject?.id?.toString() ===
                    nonLabelItems[i].id.toString()
                );
                if (reportObj !== undefined) {
                  if (reportObj.value.length > 0) {
                    hasValue = true;
                    break;
                  }
                } else {
                  if (nonLabelItems[i].value.length > 0) {
                    hasValue = true;
                    break;
                  }
                }
              }
              if (hasValue) {
                rows.push(row);
              }
            }
          }
        }
      }
    }
    return rows;
  };

  return (
    <>
      {item.objects.length > 0 &&
        generateDataSource().length > 0 &&
        !item.hidden && (
          <Table
            columns={generateColumns()}
            dataSource={generateDataSource()}
            pagination={false}
            showHeader={false}
            className={styles.table}
          />
        )}
      {item.hasSeperator && !item.hidden && (
        <div className={styles.seperator}></div>
      )}
    </>
  );
};
