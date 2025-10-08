import React from "react";
import {
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableVM,
} from "../../../../models/IShiftReportTemplateTable";
import { InputField } from "../../../../shared/components/InputField/InputField";
import { TemplateEditTableHeaderItem } from "../TemplateEditTableHeaderItem/TemplateEditTableHeaderItem";
import { Checkbox } from "antd";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import { NumericInputField } from "../../../../shared/components/NumericInputField/NumericInputField";

interface ITemplateEditTableTableHeaderProps {
  item: IShiftReportTemplateTableVM;
  onActualizeRows: (value: number) => void;
  onActualizeColumns: (value: number) => void;
  onNameChange: (value: string) => void;
  onVisibleRowsChange: (values: IShiftReportTemplateTableHiddedRowVM[]) => void;
  isDisabled: boolean;
}

export const TemplateEditTableTableHeader: React.FC<
  ITemplateEditTableTableHeaderProps
> = ({
  item,
  onActualizeRows,
  onActualizeColumns,
  onNameChange,
  onVisibleRowsChange,
  isDisabled,
}) => {
  const actualizeRows = (value: string) => {
    const intValue = parseInt(value);
    onActualizeRows(intValue);
  };
  const actualizeColumns = (value: string) => {
    const intValue = parseInt(value);
    onActualizeColumns(intValue);
  };
  const getRowsVisibleValues = () => {
    const rows = item.hiddedRows.map((r) => {
      return r.rowIndex.toString();
    });
    return rows;
  };
  const getOptions = () => {
    const rowsArray = [];
    for (let i = 0; i < item.rows; i++) {
      const value = i + 1;
      rowsArray.push({
        label: value.toString(),
        value: value.toString(),
      });
    }
    return rowsArray;
  };
  const onRowVisibleChange = (checkedValues: CheckboxValueType[]) => {
    const result: IShiftReportTemplateTableHiddedRowVM[] = [];
    if (checkedValues.length > 0) {
      for (let i = 0; i < checkedValues.length; i++) {
        const index = parseInt(checkedValues[i] as string);
        const existItem = item.hiddedRows.find((r) => r.rowIndex === index);
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
    onVisibleRowsChange(result);
  };

  return (
    <>
      <TemplateEditTableHeaderItem title="Spalten">
        <NumericInputField
          value={item.columns.toString()}
          width={40}
          maxLength={2}
          onChange={actualizeColumns}
          max={20}
          disabled={isDisabled}
          waitForInput
          min={1}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Zeilen">
        <NumericInputField
          value={item.rows.toString()}
          width={40}
          maxLength={2}
          onChange={actualizeRows}
          max={20}
          disabled={isDisabled}
          waitForInput
          min={1}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Zeilen ausblenden">
        <Checkbox.Group
          options={getOptions()}
          onChange={onRowVisibleChange}
          defaultValue={getRowsVisibleValues()}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Name">
        <InputField
          value={item.name ?? ""}
          width={200}
          onChange={onNameChange}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
    </>
  );
};
