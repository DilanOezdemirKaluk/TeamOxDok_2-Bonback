import React, { useEffect, useState } from "react";
import {
  IObjectFormat,
  IObjectType,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import { ActionSelect } from "../ActionSelect/ActionSelect";
import { Checkbox, ConfigProvider, DatePicker, Input, TimePicker } from "antd";
import { IConstantVM, IConstantGroupVM } from "../../../models/IConstant";
import { IShiftReportObject } from "../../../models/IShiftReport";
import {
  getCalculationValue,
  getColumnWidth_ShiftReportTableData,
} from "../../globals/global";
import dayjs from "dayjs";
import "dayjs/locale/de";
import locale from "antd/lib/locale/de_DE";

interface IShiftReportTableDataControlProps {
  item: IShiftReportTemplateTableObjectVM;
  isTemplate: boolean;
  constants: IConstantVM[];
  constantGroups: IConstantGroupVM[];
  reportObj: IShiftReportObject;
  tableItem: IShiftReportTemplateTableVM;
  updateValue: (
    value: string,
    object: IShiftReportTemplateTableObjectVM
  ) => void;
  columnIndex: number;
  objects: IShiftReportObject[];
  isDisabled: boolean;
}

const ShiftReportTableDataControl: React.FC<
  IShiftReportTableDataControlProps
> = ({
  item,
  isTemplate,
  constantGroups,
  constants,
  reportObj,
  tableItem,
  updateValue,
  columnIndex,
  objects,
  isDisabled,
}) => {
  const [currentItem, setCurrentItem] = useState(reportObj);
  dayjs.locale("de");
  useEffect(() => {
    updateValue(currentItem.value, item);
  }, [currentItem]);

  const getConstantOptions = (
    obj: IShiftReportTemplateTableObjectVM
  ): { label: string; value: string }[] => {
    const result = constants.filter(
      (c) => c.group && c.group.id.toString() === obj.value.toString()
    );
    const constantOptions: { label: string; value: string }[] = [];
    result.forEach((c) =>
      c.group.constants
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .forEach((constant) => {
          constantOptions.push({
            label: constant.name,
            value: constant.id.toString(),
          });
        })
    );
    return constantOptions;
  };

  const getValue = (obj: IShiftReportTemplateTableObjectVM) => {
    switch (obj.type) {
      case IObjectType.Label:
        return obj.value;
      case IObjectType.Input:
        if (!isTemplate && reportObj) {
          return reportObj.value;
        }
        return "";
      case IObjectType.LOV:
      case IObjectType.Selection:
        if (!isTemplate && reportObj) {
          return reportObj.value;
        }
        const cGroup = constantGroups.find(
          (g) => g.id.toString() === obj.value.toString()
        );
        if (cGroup) {
          return cGroup.name;
        }
        return "";
      case IObjectType.Calculation:
        if (reportObj.value.length > 0) {
          return reportObj.value;
        }
        return obj.value;

      default:
        return "";
    }
  };

  const getSelectionValues = (values: string): string[] => {
    if (!values) {
      return [];
    }
    const valueArray: string[] = values.split(",").map((value) => value.trim());
    return valueArray.map((value) => `${value}`);
  };

  const width = getColumnWidth_ShiftReportTableData(tableItem, columnIndex);

  switch (item.type) {
    case IObjectType.Label:
      return (
        <span
          style={{
            fontSize: `${item.fontSize}pt`,
            fontWeight: "bold",
            color: item.backgroundColor,
            width: `${width}px`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {getValue(item)}
        </span>
      );
    case IObjectType.Input:
      return (
        <>
          {item.format === IObjectFormat.Text && (
            <Input.TextArea
              autoSize
              maxLength={currentItem.shiftReportTemplateTableObject.inputLength}
              disabled={isTemplate || isDisabled}
              value={currentItem.value}
              style={{
                width: `${width}px`,
              }}
              onChange={(e) => {
                let inputValue = e.target.value;
                if (item.format === IObjectFormat.Number) {
                  inputValue = inputValue.replace(/[^0-9]/g, "");
                }
                setCurrentItem((item) => ({ ...item, value: inputValue }));
              }}
              placeholder={item.outputlistName}
            />
          )}
          {item.format === IObjectFormat.Number && (
            <Input.TextArea
              maxLength={currentItem.shiftReportTemplateTableObject.inputLength}
              autoSize
              disabled={isTemplate || isDisabled}
              value={currentItem.value}
              style={{
                width: `${width}px`,
              }}
              onChange={(e) => {
                let inputValue = e.target.value;
                if (item.format === IObjectFormat.Number) {
                  inputValue = inputValue.replace(/[^0-9]/g, "");
                }
                setCurrentItem((item) => ({ ...item, value: inputValue }));
              }}
            />
          )}
          {item.format === IObjectFormat.DateField && (
            <DatePicker
              disabled={isTemplate || isDisabled}
              format="DD.MM.YYYY"
              value={currentItem.value ? dayjs(currentItem.value) : null}
              style={{
                width: `${width}px`,
              }}
              onChange={(e) => {
                setCurrentItem((item) => ({
                  ...item,
                  value: e ? e.toISOString() : "",
                }));
              }}
            />
          )}
          {item.format === IObjectFormat.DateTime && (
            <ConfigProvider locale={locale}>
              <DatePicker
                showTime
                disabled={isTemplate || isDisabled}
                value={currentItem.value ? dayjs(currentItem.value) : null}
                style={{
                  width: `${width}px`,
                }}
                format="DD.MM.YYYY HH:mm"
                onChange={(date) => {
                  setCurrentItem((item) => ({
                    ...item,
                    value: date ? date.toISOString() : "",
                  }));
                }}
              />
            </ConfigProvider>
          )}
          {item.format === IObjectFormat.Time && (
            <ConfigProvider locale={locale}>
              <TimePicker
                disabled={isTemplate || isDisabled}
                value={currentItem.value ? dayjs(currentItem.value) : null}
                style={{
                  width: `${width}px`,
                }}
                format="HH:mm"
                onChange={(time) => {
                  setCurrentItem((item) => ({
                    ...item,
                    value: time ? time.toISOString() : "",
                  }));
                }}
              />
            </ConfigProvider>
          )}
        </>
      );
    case IObjectType.LOV:
      return (
        <ActionSelect
          options={getConstantOptions(item)}
          onChange={(valueItem) => {
            const value = valueItem ?? "";
            setCurrentItem((item) => ({ ...item, value: value }));
          }}
          disabled={isTemplate || isDisabled}
          defaultValue={currentItem.value}
          style={{
            width: `${width}px`,
          }}
          allowClear
        />
      );
    case IObjectType.Selection:
      return (
        <Checkbox.Group
          options={getConstantOptions(item)}
          disabled={isTemplate || isDisabled}
          onChange={(values) =>
            setCurrentItem((item) => ({ ...item, value: values.toString() }))
          }
          defaultValue={getSelectionValues(currentItem.value)}
          style={{
            width: `${width}px`,
          }}
        />
      );
    case IObjectType.Calculation:
      return (
        <span
          style={{
            width: `${width}px`,
          }}
        >
          {getCalculationValue(item.value, objects)}
        </span>
      );
    default:
      return (
        <span
          style={{
            width: `${width}px`,
          }}
        >
          {item.value}
        </span>
      );
  }
};

export default ShiftReportTableDataControl;
