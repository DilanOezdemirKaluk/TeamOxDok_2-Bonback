import React from "react";
import {
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import styles from "./ShiftReportEditTable.module.css";
import { ShiftReportTable } from "../ShiftReportTable/ShiftReportTable";
import {
  IShiftReportEditVM,
  IShiftReportObject,
} from "../../../models/IShiftReport";
import { IConstantVM } from "../../../models/IConstant";

interface IShiftReportEditTableProps {
  item: IShiftReportTemplateTableVM;
  objects: IShiftReportObject[];
  updateValue: (
    value: string,
    object: IShiftReportTemplateTableObjectVM
  ) => void;
  constants: IConstantVM[];
  isDisabled: boolean;
  onRowsVisibleChange?: (rows: IShiftReportTemplateTableHiddedRowVM[]) => void;
  editItem?: IShiftReportEditVM;
}

export const ShiftReportEditTable: React.FC<IShiftReportEditTableProps> = ({
  item,
  objects,
  updateValue,
  constants,
  isDisabled,
  onRowsVisibleChange,
  editItem,
}) => {
  return (
    <>
      <ShiftReportTable
        item={item}
        objects={objects}
        updateValue={updateValue}
        constants={constants}
        isDisabled={isDisabled}
        onRowsVisibleChange={onRowsVisibleChange}
        editItem={editItem}
      />
      {item.hasSeperator && <div className={styles.seperator}></div>}
    </>
  );
};
