import React, { useState, useEffect } from "react";
import {
  IShiftReportTemplateShowTablesVM,
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  IShiftReportTemplateTableShowTableVM,
  IShiftReportTemplateTableSqlViewVM,
  IShiftReportTemplateTableVM,
  ITableObjectType,
} from "../../../models/IShiftReportTemplateTable";
import { TemplateEditTable } from "../TemplateEditTable/TemplateEditTable";

import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import { generateUniqueId } from "../../../shared/globals/global";

interface ITemplateEditContentProps {
  item: IShiftReportTemplateTableVM[];
  sqlViews: IShiftReportTemplateSqlViewDataVM[];
  constantGroups: IConstantGroupVM[];
  constants: IConstantVM[];
  onUpdate: (items: IShiftReportTemplateTableVM[]) => void;
  showTables: IShiftReportTemplateShowTablesVM;
  onShowTableRefresh: (
    table: IShiftReportTemplateTableVM,
    index: number,
    preshift: number
  ) => void;
  tableShowTables: IShiftReportTemplateTableShowTableVM[];
  onTableRemove: (tableId: number) => void;
  onSqlTableRefresh: (
    view: IShiftReportTemplateSqlViewDataVM,
    index: number,
    sqlView: IShiftReportTemplateTableSqlViewVM
  ) => void;
  tableSqlViews: IShiftReportTemplateTableSqlViewVM[];
  outputlistObjects: IShiftReportTemplateTableOutputlistObjectsVM;
  onTableSqlViewsUpdate: (item: IShiftReportTemplateTableSqlViewVM[]) => void;
  isDisabled: boolean;
}

export const TemplateEditContent: React.FC<ITemplateEditContentProps> = ({
  item,
  sqlViews,
  constantGroups,
  constants,
  onUpdate,
  showTables,
  onShowTableRefresh,
  tableShowTables,
  onTableRemove,
  onSqlTableRefresh,
  tableSqlViews,
  outputlistObjects,
  onTableSqlViewsUpdate,
  isDisabled,
}) => {
  const [currentItems, setCurrentItems] =
    useState<IShiftReportTemplateTableVM[]>(item);
  const [updatedItemSortindex, setUpdatedItemSortindex] = useState<
    number | null
  >(null);

  const onTableIndexActualize = (
    newItem: IShiftReportTemplateTableVM,
    direction: string
  ) => {
    const updatedItems = [...currentItems];
    const index = updatedItems.findIndex((table) => table.id === newItem.id);

    if (index !== -1) {
      updatedItems.splice(index, 1);
    }

    let newIndex = index;
    if (direction === "up" && index > 0) {
      newIndex = index - 1;
    } else if (direction === "down" && index < updatedItems.length) {
      newIndex = index + 1;
    }

    updatedItems.splice(newIndex, 0, newItem);

    updatedItems.forEach((item, i) => {
      item.sortIndex = i + 1;
    });

    setCurrentItems(updatedItems);
    onUpdate(updatedItems);
  };

  useEffect(() => {
    setCurrentItems(item);
  }, [item]);

  const onSortIndexUpdate = (itemId: number, newIndex: number) => {
    const updatedItems = [...currentItems];
    const itemIndex = updatedItems.findIndex(
      (item) => item.sortIndex === itemId
    );

    if (newIndex > updatedItems.length) {
      newIndex = updatedItems.length;
    }

    if (itemIndex === -1 || newIndex < 0) {
      return;
    }

    const [movedItem] = updatedItems.splice(itemIndex, 1);
    updatedItems.splice(newIndex, 0, movedItem);

    updatedItems.forEach((item, index) => {
      item.sortIndex = index + 1;
    });

    setCurrentItems(updatedItems);
    onUpdate(updatedItems);
  };

  const copyItem = (item: IShiftReportTemplateTableVM) => {
    const copiedItem = { ...item };
    copiedItem.id = generateUniqueId();
    copiedItem.objects.forEach((obj) => {
      obj.id = generateUniqueId();
    });
    const updatedItems = [...currentItems, copiedItem];
    updatedItems.sort((a, b) => {
      if (a.sortIndex === b.sortIndex) {
        return a.id - b.id;
      }
      return a.sortIndex - b.sortIndex;
    });
    updatedItems.forEach((table, index) => {
      table.sortIndex = index + 1;
    });

    setCurrentItems(updatedItems);
    setUpdatedItemSortindex(item.sortIndex + 1);
    onUpdate(updatedItems);

    if (item.type === ITableObjectType.DatabaseTable) {
      const sqlData = tableSqlViews.find((data) => data.tableId === item.id);
      if (sqlData) {
        const copySqlData = { ...sqlData, tableId: copiedItem.id };
        onTableSqlViewsUpdate([...tableSqlViews, copySqlData]);
      }
    }
  };

  const onUpdateTable = (item: IShiftReportTemplateTableVM, index: number) => {
    const updatedItems = [...currentItems];
    const tableIndex = index === 0 ? 0 : index - 1;
    updatedItems[tableIndex] = item;
    setCurrentItems(updatedItems);
    onUpdate(updatedItems);
  };

  const removeItem = (index: number) => {
    const tableId = currentItems[index - 1].id;
    const updatedItems = currentItems.filter((table) => table.id !== tableId);
    updatedItems.forEach((table, index) => {
      table.sortIndex = index + 1;
    });
    tableSqlViews = tableSqlViews.filter((obj) => obj.tableId !== tableId);
    setCurrentItems(updatedItems);
    onTableRemove(tableId);
  };

  const getSortedItems = () => {
    const sortedItems = [...currentItems].sort(
      (a, b) => a.sortIndex - b.sortIndex
    );
    return sortedItems;
  };

  const getOutputlistNameObjects = () => {
    return currentItems.flatMap((item) =>
      item.objects.filter((obj) => obj.outputlistName.length > 0)
    );
  };

  return (
    <>
      {getSortedItems().map((table, index) => (
        <div key={`${table.id}-${table.sortIndex}`}>
          <TemplateEditTable
            item={table}
            sqlViews={sqlViews}
            onTableIndexActualize={onTableIndexActualize}
            count={currentItems.length}
            removeItem={removeItem}
            copyItem={copyItem}
            constantGroups={constantGroups}
            constants={constants}
            onUpdate={onUpdateTable}
            showTables={showTables}
            onShowTableRefresh={(t, preshift) =>
              onShowTableRefresh(t, index, preshift)
            }
            tableShowTables={tableShowTables}
            onSqlTableRefresh={(v, sqlView) =>
              onSqlTableRefresh(v, index, sqlView)
            }
            tableSqlViews={tableSqlViews}
            outputlistObjects={outputlistObjects}
            currentOutputlistObjects={getOutputlistNameObjects()}
            onSortIndexUpdate={onSortIndexUpdate}
            isDisabled={isDisabled}
          />
        </div>
      ))}
    </>
  );
};
