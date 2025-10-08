import React, { useState } from "react";
import {
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import { TemplateEditObjectEdit } from "../TemplateEditObjectEdit/TemplateEditObjectEdit";
import { ShiftReportTableData } from "../../../shared/components/ShiftReportTableData/ShiftReportTableData";
import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import { ModeOptions } from "../TemplateEditTableOptions/TemplateEditTableOptions";

interface ITemplateEditTableContentProps {
  item: IShiftReportTemplateTableVM;
  objectEditSave: (obj: IShiftReportTemplateTableObjectVM) => void;
  constantGroups: IConstantGroupVM[];
  constants: IConstantVM[];
  outputlistObjects: IShiftReportTemplateTableOutputlistObjectsVM;
  currentOutputlistObjects: IShiftReportTemplateTableObjectVM[];
  onTableAction: (
    tableItem: IShiftReportTemplateTableVM,
    row: number,
    option: ModeOptions,
    rowCount: number
  ) => void;
  isDisabled: boolean;
}

export const TemplateEditTableContent: React.FC<
  ITemplateEditTableContentProps
> = ({
  item,
  objectEditSave,
  constantGroups,
  constants,
  outputlistObjects,
  currentOutputlistObjects,
  onTableAction,
  isDisabled,
}) => {
  const [editItem, setEditItem] = useState<IShiftReportTemplateTableObjectVM>();

  return (
    <>
      <ShiftReportTableData
        tableItem={item}
        objects={[]}
        isTemplate
        setEdit={setEditItem}
        constants={constants}
        constantGroups={constantGroups}
        updateValue={() => true}
        onTableAction={onTableAction}
        isDisabled={isDisabled}
      />
      {editItem && (
        <TemplateEditObjectEdit
          item={editItem}
          open={editItem !== undefined}
          onClose={() => setEditItem(undefined)}
          onSave={objectEditSave}
          constantGroups={constantGroups}
          outputlistObjects={outputlistObjects}
          currentOutputlistObjects={currentOutputlistObjects}
        />
      )}
    </>
  );
};
