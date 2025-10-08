import React from "react";
import { IShiftReportEditVM } from "../../../models/IShiftReport";
import { ShiftReportEditTable } from "../ShiftReportEditTable/ShiftReportEditTable";
import {
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import { IConstantVM } from "../../../models/IConstant";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";
import { UploadButton } from "../../../shared/components/UploadButton/UploadButton";
import { IDocumentUploadMode } from "../../../models/IDocument";
import styles from "./ShiftReportEditContent.module.css";

interface IShiftReportEditContentProps {
  item: IShiftReportEditVM;
  updateValue: (
    value: string,
    object: IShiftReportTemplateTableObjectVM,
    tableItem: IShiftReportTemplateTableVM
  ) => void;
  constants: IConstantVM[];
  onDocumentRemove: (id: string) => void;
  onUpload: () => void;
  isDisabled: boolean;
  onRowsVisibleChange?: (
    table: IShiftReportTemplateTableVM,
    rows: IShiftReportTemplateTableHiddedRowVM[]
  ) => void;
  documentSize: number;
}

export const ShiftReportEditContent: React.FC<IShiftReportEditContentProps> = ({
  item,
  updateValue,
  constants,
  onDocumentRemove,
  onUpload,
  isDisabled,
  onRowsVisibleChange,
  documentSize,
}) => {
  return (
    <>
      <DocumentList
        documents={item.documents.filter((d) => d.fromTemplate === false)}
        onRemove={onDocumentRemove}
      />

      <UploadButton
        mode={IDocumentUploadMode.shiftReports}
        onUploadSuccess={onUpload}
        id={item.id.toString()}
        disabled={isDisabled}
      />

      <div className={styles.seperator}></div>

      <DocumentList
        documents={item.documents.filter((d) => d.fromTemplate === true)}
        onRemove={onDocumentRemove}
      />

      <div className={styles.seperator}></div>

      {item.shiftReportTemplate.tables.map((t) => (
        <ShiftReportEditTable
          key={t.id}
          item={t}
          objects={item.shiftReportObjects}
          updateValue={(value, object) => updateValue(value, object, t)}
          constants={constants}
          isDisabled={isDisabled}
          onRowsVisibleChange={(rows) => {
            if (onRowsVisibleChange) onRowsVisibleChange(t, rows);
          }}
          editItem={item}
        />
      ))}
    </>
  );
};
