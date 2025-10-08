import React, { useEffect, useState } from "react";
import {
  IShiftReportTemplateShowTablesVM,
  IShiftReportTemplateTableShowTableVM,
  IShiftReportTemplateTableVM,
} from "../../../../models/IShiftReportTemplateTable";
import { ActionSelect } from "../../../../shared/components/ActionSelect/ActionSelect";
import { TemplateEditTableHeaderItem } from "../TemplateEditTableHeaderItem/TemplateEditTableHeaderItem";
import { IShiftReportTemplateVM } from "../../../../models/IShiftReportTemplate";
import { PreShiftSelector } from "../../../../shared/components/PreShiftSelector/PreShiftSelector";

interface ITemplateEditTableShowTableHeaderProps {
  item: IShiftReportTemplateTableVM;
  showTables: IShiftReportTemplateShowTablesVM;
  onRefresh: (table: IShiftReportTemplateTableVM, preshift: number) => void;
  tableShowTables: IShiftReportTemplateTableShowTableVM[];
  isDisabled: boolean;
}

export const TemplateEditTableShowTableHeader: React.FC<
  ITemplateEditTableShowTableHeaderProps
> = ({ showTables, onRefresh, item, tableShowTables, isDisabled }) => {
  const [template, setTemplate] = useState<IShiftReportTemplateVM>();
  const [table, setTable] = useState<IShiftReportTemplateTableVM>();
  const [preshift, setPreshift] = useState("0");

  useEffect(() => {
    const showTableVM = tableShowTables.find((t) => t.table.id === item.id);
    if (showTableVM) {
      const showTable = showTables.tables.find(
        (t) => t.id === showTableVM.showTable.id
      );
      if (showTable) {
        const template = showTables.templates.find(
          (t) => t.id === showTable.template.id
        );
        if (template) {
          const copy = { ...template };
          setPreshift(showTableVM.preShift.toString());
          setTemplate(copy);
          setTable(showTable);
        }
      }
    }
  }, [item, showTables, tableShowTables]);

  const getTemplateOptions = () => {
    const result = showTables.templates.map((t) => ({
      key: t.id,
      label: t.name,
      value: t.id.toString(),
    }));
    return result;
  };

  const getTableOptions = () => {
    const result = showTables.tables
      .filter((t) => t.template?.id === template?.id)
      .map((t) => ({
        key: t.id,
        value: t.id.toString(),
        label: t.name ?? "",
      }));

    if (result.length === 0) {
      result.unshift({ key: 0, value: "", label: "Empty Table" });
    }

    return result;
  };

  useEffect(() => {
    if (table) {
      onRefresh(table, parseInt(preshift));
    }
  }, [preshift, table]);

  return (
    <>
      <TemplateEditTableHeaderItem title="Vorlage">
        <ActionSelect
          onChange={(id) => {
            const t = showTables.templates.find((t) => t.id.toString() === id);
            setTemplate(t);
            setTable(undefined);
          }}
          defaultValue={template?.id.toString() ?? ""}
          options={getTemplateOptions()}
          width={200}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Tabelle">
        <ActionSelect
          onChange={(id) => {
            const t = showTables.tables.find((t) => t.id.toString() === id);
            setTable(t);
          }}
          defaultValue={table?.id.toString() ?? ""}
          options={getTableOptions()}
          width={200}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Schichtdaten Vorschicht">
        <PreShiftSelector defaultValue={preshift} onChange={setPreshift} />
      </TemplateEditTableHeaderItem>
    </>
  );
};
