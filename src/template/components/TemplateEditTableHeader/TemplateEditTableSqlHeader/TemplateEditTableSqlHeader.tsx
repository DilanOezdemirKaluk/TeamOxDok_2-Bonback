import React, { useEffect, useState } from "react";
import {
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateTableSqlViewVM,
  IShiftReportTemplateTableVM,
} from "../../../../models/IShiftReportTemplateTable";
import { TemplateEditTableHeaderItem } from "../TemplateEditTableHeaderItem/TemplateEditTableHeaderItem";
import { ActionSelect } from "../../../../shared/components/ActionSelect/ActionSelect";
import { EditCheckbox } from "../../../../shared/components/EditCheckbox/EditCheckbox";

interface ITemplateEditTableSqlHeaderProps {
  item: IShiftReportTemplateTableVM;
  sqlViews: IShiftReportTemplateSqlViewDataVM[];
  onSqlTableRefresh: (
    view: IShiftReportTemplateSqlViewDataVM,
    sqlView: IShiftReportTemplateTableSqlViewVM
  ) => void;
  tableSqlViews: IShiftReportTemplateTableSqlViewVM[];
  isDisabled: boolean;
}

export const TemplateEditTableSqlHeader: React.FC<
  ITemplateEditTableSqlHeaderProps
> = ({ sqlViews, onSqlTableRefresh, item, tableSqlViews, isDisabled }) => {
  const [selectedView, setSelectedView] = useState("");
  const [shiftColumn, setShiftColumn] = useState("");
  const [preShift, setPreShift] = useState("0");
  const [sortColumn, setSortColumn] = useState("");
  const [showColumnName, setShowColumnName] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [orderAsc, setOrderAsc] = useState(true);

  const getSqlViewOptions = () => {
    const result = sqlViews.map((view) => ({
      label: view.name,
      value: view.name,
    }));
    return result;
  };
  const getSqlViewColumns = () => {
    const view = sqlViews.find((v) => v.name === selectedView);
    if (view) {
      const result = view.columns.map((column) => ({
        label: column,
        value: column,
      }));
      return result;
    }
    return [];
  };
  const getPreshiftOptions = () => {
    const preShiftOptions = [
      { label: "Aktuell", value: "0" },
      { label: "-1", value: "1" },
      { label: "-2", value: "2" },
      { label: "-3", value: "3" },
    ];
    return preShiftOptions;
  };

  useEffect(() => {
    if (selectedView) {
      const view = sqlViews.find((v) => v.name === selectedView);
      if (view) {
        const sqlView: IShiftReportTemplateTableSqlViewVM = {
          id: 0,
          tableId: 0,
          orderColumn: sortColumn,
          orderColumnDirection: orderAsc ? "ASC" : "DESC",
          shiftColumn: shiftColumn,
          shiftDataPreShift: parseInt(preShift),
          showColumnName: showColumnName,
          showDescription: showDescription,
          viewName: selectedView,
        };
        onSqlTableRefresh(view, sqlView);
      }
    }
  }, [
    selectedView,
    sortColumn,
    shiftColumn,
    orderAsc,
    preShift,
    showColumnName,
    showDescription,
  ]);

  useEffect(() => {
    const table = tableSqlViews.find((obj) => obj.tableId === item.id);
    if (table) {
      const viewName = table.viewName.replace("[", "").replace("]", "");
      const view = sqlViews.find((obj) => obj.name === viewName);
      if (view) {
        setSelectedView(view.name);
        setShowColumnName(table.showColumnName);
        setShowDescription(table.showDescription);
        setShiftColumn(table.shiftColumn);
        setPreShift(table.shiftDataPreShift.toString());
        setSortColumn(table.orderColumn);
        setOrderAsc(table.orderColumnDirection.toUpperCase() === "ASC");
      }
    }
  }, [item]);

  return (
    <>
      <TemplateEditTableHeaderItem title="SQL View">
        <ActionSelect
          onChange={(e) => {
            setSelectedView(e);
            setShiftColumn("");
            setSortColumn("");
          }}
          defaultValue={selectedView}
          options={getSqlViewOptions()}
          width={180}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Spalten">
        <EditCheckbox
          checked={showColumnName}
          onChecked={setShowColumnName}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Bemerkungen">
        <EditCheckbox
          checked={showDescription}
          onChecked={setShowDescription}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Schichtspalte filtern">
        <ActionSelect
          onChange={setShiftColumn}
          defaultValue={shiftColumn}
          options={getSqlViewColumns()}
          width={150}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Vorschicht">
        <ActionSelect
          onChange={setPreShift}
          defaultValue={preShift}
          options={getPreshiftOptions()}
          width={90}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Sortierung">
        <ActionSelect
          onChange={setSortColumn}
          defaultValue={sortColumn}
          options={getSqlViewColumns()}
          width={150}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
      <TemplateEditTableHeaderItem title="Aufsteigend">
        <EditCheckbox
          checked={orderAsc}
          onChecked={setOrderAsc}
          disabled={isDisabled}
        />
      </TemplateEditTableHeaderItem>
    </>
  );
};
