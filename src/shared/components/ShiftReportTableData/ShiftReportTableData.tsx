import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Table } from "antd";
import {
  IShiftReportTemplateTableColumnWidth,
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
  ITableObjectType,
} from "../../../models/IShiftReportTemplateTable";
import styles from "./ShiftReportTableData.module.css";
import { EditOutlined } from "@ant-design/icons";
import {
  IShiftReportEditVM,
  IShiftReportObject,
  IShiftReportVisibleRows,
} from "../../../models/IShiftReport";
import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import ShiftReportTableDataControl from "../ShiftReportTableDataControl/ShiftReportTableDataControl";
import { getColumnWidth_ShiftReportTableData } from "../../globals/global";
import { TemplateEditTableHeaderItem } from "../../../template/components/TemplateEditTableHeader/TemplateEditTableHeaderItem/TemplateEditTableHeaderItem";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { ActionButton } from "../ActionButton/ActionButton";
import {
  ModeOptions,
  TemplateEditTableOptions,
} from "../../../template/components/TemplateEditTableOptions/TemplateEditTableOptions";
import { EditCheckbox } from "../EditCheckbox/EditCheckbox";

interface Option {
  label: string;
  value: string;
}

interface IShiftReportTableDataProps {
  tableItem: IShiftReportTemplateTableVM;
  objects: IShiftReportObject[];
  isTemplate: boolean;
  setEdit?: (obj: IShiftReportTemplateTableObjectVM) => void;
  constants: IConstantVM[];
  constantGroups: IConstantGroupVM[];
  updateValue: (
    value: string,
    object: IShiftReportTemplateTableObjectVM
  ) => void;
  onTableAction: (
    tableItem: IShiftReportTemplateTableVM,
    row: number,
    option: ModeOptions,
    rowCount: number
  ) => void;
  isDisabled: boolean;
  onRowsVisibleChange?: (rows: IShiftReportTemplateTableHiddedRowVM[]) => void;
  editItem?: IShiftReportEditVM;
}

export const ShiftReportTableData: React.FC<IShiftReportTableDataProps> = ({
  tableItem,
  objects,
  isTemplate,
  setEdit,
  constants,
  constantGroups,
  updateValue,
  onTableAction,
  isDisabled,
  onRowsVisibleChange,
  editItem,
}) => {
  const [columnWidths, setColumnWidths] = useState<
    IShiftReportTemplateTableColumnWidth[]
  >(tableItem.columnWidth || []);
  const [hiddenRows, setHiddenRows] = useState<
    IShiftReportTemplateTableHiddedRowVM[]
  >(tableItem.hiddedRows || []);
  const [showTableOptions, setShowTableOptions] = useState(false);
  const [newVisibleRows, setNewVisibleRows] = useState<
    IShiftReportVisibleRows[]
  >([]);
  const [isDisableControls, setIsDisableControls] = useState(isDisabled);
  const [hidden, setHidden] = useState(tableItem.hidden);

  function getRowClassName(): (record: CustomData, index: number) => string {
    return (record: CustomData, index: number) => {
      if (isTemplate) {
        if (visibleRows.some((r) => r === (index + 1).toString())) {
          return styles.hiddenRow;
        }
      } else {
        const table = newVisibleRows.find((t) => t.tableId === tableItem.id);
        const tableRows = table ? table.rows.map((r) => r.toString()) : [];
        if (tableRows.some((obj) => obj === (index + 1).toString())) {
          return styles.row;
        }
        if (hiddenRows.some((r) => r.rowIndex === index + 1)) {
          return styles.disabledRow;
        }
      }
      return styles.row;
    };
  }

  interface CustomData {
    key: string;
    items: IShiftReportTemplateTableObjectVM[];
  }

  const renderInput = (
    text: string,
    record: CustomData,
    index: number,
    columnIndex: number
  ) => {
    const item = record.items ? record.items[columnIndex - 1] : null;

    if (!item) {
      return null;
    }

    const reportObj = Array.isArray(objects)
      ? objects.find(
          (o) =>
            o?.shiftReportTemplateTableObject?.id?.toString() ===
            item?.id?.toString()
        )
      : null;

    const defaultReportObj = {
      id: 0,
      value: tableItem.isDatabase ? item.value : "",
      shiftReportTemplateTableObject: item,
    };

    const finalReportObj = reportObj || defaultReportObj;

    return (
      <div
        style={{
          display: "flex",
          padding: "0",
          width: `${getColumnWidth_ShiftReportTableData(
            tableItem,
            columnIndex
          )}px`,
          marginTop: "0.5rem",
          marginRight: "10px",
          textAlign: finalReportObj.shiftReportTemplateTableObject.alignment,
        }}
      >
        <>
          <ShiftReportTableDataControl
            isTemplate={isTemplate}
            item={item}
            constantGroups={constantGroups}
            constants={constants}
            reportObj={finalReportObj}
            tableItem={tableItem}
            updateValue={updateValue}
            key={item.id}
            columnIndex={columnIndex}
            objects={objects}
            isDisabled={isDisableControls}
          />
          {isTemplate && tableItem.type === ITableObjectType.Table && (
            <Button
              disabled={isDisableControls}
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                if (setEdit) {
                  setEdit(item);
                }
              }}
            />
          )}
        </>
      </div>
    );
  };

  const actualizeColumnWidth = (index: number, value: string) => {
    let width = parseInt(value);
    if (isNaN(width)) {
      width = 0;
    }

    if (width > 800) {
      width = 800;
    }

    const existingColumnIndex = columnWidths.findIndex(
      (c) => c.columnIndex === index
    );

    if (isNaN(width)) {
      setColumnWidths((prevColumnWidths) =>
        prevColumnWidths.filter((c) => c.columnIndex !== index)
      );
    } else {
      if (existingColumnIndex !== -1) {
        const updatedColumnWidths = [...columnWidths];
        updatedColumnWidths[existingColumnIndex].width = width;
        setColumnWidths(updatedColumnWidths);
      } else {
        setColumnWidths((prevColumnWidths) => [
          ...prevColumnWidths,
          { columnIndex: index, width: width },
        ]);
      }
    }
  };

  useEffect(() => {
    tableItem.columnWidth = columnWidths;
  }, [columnWidths]);

  useEffect(() => {
    if (tableItem.type === ITableObjectType.ShowTable) {
      setIsDisableControls(true);
    }
  }, [tableItem]);

  const generateColumns = () => {
    const columns: {
      title: React.ReactNode;
      dataIndex: string;
      key: string;
      render: (
        text: string,
        record: CustomData,
        index: number
      ) => React.ReactNode;
      width?: string;
    }[] = [];

    for (let i = 1; i <= tableItem.columns; i++) {
      let columnWidth = columnWidths.find((c) => c.columnIndex === i)?.width;

      columns.push({
        title: (
          <div>
            <Input
              value={columnWidth}
              style={{
                width: `${getColumnWidth_ShiftReportTableData(tableItem, i)}px`,
                textAlign: "center",
              }}
              onChange={(e) => actualizeColumnWidth(i, e.target.value)}
              placeholder="Spaltenbreite"
              pattern="[0-9]*"
              type="number"
              disabled={isDisableControls}
            />
          </div>
        ),
        dataIndex: `${i}`,
        key: `${i}`,
        render: (text, record, index) => renderInput(text, record, index, i),
        width: "100px",
      });
    }

    return columns;
  };
  const generateDataSource = () => {
    const rows: CustomData[] = [];
    for (let rowIndex = 1; rowIndex <= tableItem.rows; rowIndex++) {
      const row: CustomData = {
        key: `${rowIndex}`,
        items: [],
      };

      for (
        let columnIndex = 1;
        columnIndex <= tableItem.columns;
        columnIndex++
      ) {
        const obj = tableItem.objects.find(
          (i) => i.rowIndex === rowIndex && i.columnIndex === columnIndex
        );
        if (obj) {
          row.items.push(obj);
        }
      }

      rows.push(row);
    }

    return rows;
  };

  const getOptions = (): Option[] => {
    const rowsArray: Option[] = [];

    tableItem.hiddedRows
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .forEach((r) => {
        rowsArray.push({
          label: r.rowIndex.toString(),
          value: r.rowIndex.toString(),
        });
      });

    return rowsArray;
  };
  const onRowVisibleChange = (checkedValues: CheckboxValueType[]) => {
    const result: IShiftReportTemplateTableHiddedRowVM[] = [];
    if (checkedValues.length > 0) {
      for (let i = 0; i < checkedValues.length; i++) {
        const index = parseInt(checkedValues[i] as string);

        let table = newVisibleRows.find((t) => t.tableId === tableItem.id);
        let tableRows = table ? table.rows.map((r) => r) : [];
        if (tableRows.some((obj) => obj === index)) {
          tableRows = tableRows.filter((r) => r !== index);
          setNewVisibleRows((prev) => {
            return prev.map((t) => {
              if (t.tableId === tableItem.id) {
                t.rows = tableRows;
              }
              return t;
            });
          });
        }

        const existItem = tableItem.hiddedRows.find(
          (r) => r.rowIndex === index
        );
        if (existItem === undefined) {
          result.push({
            id: -1,
            rowIndex: index,
          });
        } else {
          result.push(existItem);
        }
      }
    }
    setHiddenRows(result);
    if (onRowsVisibleChange) {
      onRowsVisibleChange(result);
    }
  };

  const getRowsVisibleValues = () => {
    let rows = tableItem.hiddedRows.map((r) => {
      return r.rowIndex.toString();
    });

    if (!isTemplate && editItem) {
      if (editItem.visibleRows.length > 0) {
        const table = editItem.visibleRows.find(
          (t) => t.tableId === tableItem.id
        );
        const tableRows = table ? table.rows.map((r) => r.toString()) : [];
        rows = rows.filter((r) => !tableRows.includes(r));
      }
    }
    if (rows.length === 0) {
      return ["-1"];
    }
    return rows;
  };

  const visibleRows = getRowsVisibleValues();

  useEffect(() => {
    if (editItem && editItem.visibleRows) {
      setNewVisibleRows(editItem.visibleRows);
    }
  }, [editItem]);

  return (
    <>
      {!isTemplate && tableItem.hidden && (
        <TemplateEditTableHeaderItem title="Tabelle ein-/ausblenden">
          <EditCheckbox
            checked={!hidden}
            onChecked={(checked) => {
              setHidden(!checked);
            }}
          />
        </TemplateEditTableHeaderItem>
      )}
      {(isTemplate || !hidden) &&
        tableItem.rows > 0 &&
        generateDataSource().length > 0 && (
          <>
            {visibleRows.length > 0 &&
              visibleRows[0] !== "-1" &&
              !isTemplate && (
                <TemplateEditTableHeaderItem title="Zeilen ausblenden">
                  <Checkbox.Group
                    options={getOptions()}
                    onChange={onRowVisibleChange}
                    defaultValue={visibleRows}
                  />
                </TemplateEditTableHeaderItem>
              )}
            {isTemplate && (
              <ActionButton
                title="Tabellenoptionen"
                onClick={() => setShowTableOptions(true)}
                disabled={isDisableControls}
              />
            )}
            <Table
              columns={generateColumns()}
              dataSource={generateDataSource()}
              pagination={false}
              className={`${styles.table} ${
                tableItem.hidden && isTemplate ? styles.tableHidden : ""
              }`}
              rowClassName={getRowClassName()}
              showHeader={isTemplate}
            />
            <TemplateEditTableOptions
              show={showTableOptions}
              onClose={() => setShowTableOptions(false)}
              tableItem={tableItem}
              onTableAction={(row, option, rowCount) =>
                onTableAction(tableItem, row, option, rowCount)
              }
            />
          </>
        )}
    </>
  );
};
