import React from "react";
import {
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import {
  IShiftReportEditVM,
  IShiftReportObject,
} from "../../../models/IShiftReport";
import { ShiftReportTableData } from "../../../shared/components/ShiftReportTableData/ShiftReportTableData";
import { IConstantVM } from "../../../models/IConstant";

interface IShiftReportTableProps {
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

export const ShiftReportTable: React.FC<IShiftReportTableProps> = ({
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
      <ShiftReportTableData
        tableItem={item}
        objects={objects}
        isTemplate={false}
        constants={constants}
        constantGroups={[]}
        updateValue={updateValue}
        onTableAction={() => true}
        isDisabled={isDisabled}
        onRowsVisibleChange={onRowsVisibleChange}
        editItem={editItem}
      />
    </>
  );
};
