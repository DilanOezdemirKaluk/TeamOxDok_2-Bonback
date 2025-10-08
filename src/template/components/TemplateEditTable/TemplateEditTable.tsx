import { useRef, useState } from "react";
import {
  IObjectFormat,
  IObjectType,
  IShiftReportTemplateShowTablesVM,
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  IShiftReportTemplateTableShowTableVM,
  IShiftReportTemplateTableSqlViewVM,
  IShiftReportTemplateTableVM,
  ITableObjectType,
} from "../../../models/IShiftReportTemplateTable";
import { TemplateEditTableContent } from "../TemplateEditTableContent/TemplateEditTableContent";
import { TemplateEditTableHeaderItem } from "../TemplateEditTableHeader/TemplateEditTableHeaderItem/TemplateEditTableHeaderItem";
import { TemplateEditTableSqlHeader } from "../TemplateEditTableHeader/TemplateEditTableSqlHeader/TemplateEditTableSqlHeader";
import {
  UpOutlined,
  DownOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styles from "./TemplateEditTable.module.css";
import { EditCheckbox } from "../../../shared/components/EditCheckbox/EditCheckbox";
import { IconButton } from "../../../shared/components/IconButton/IconButton";
import { TemplateEditTableTableHeader } from "../TemplateEditTableHeader/TemplateEditTableTableHeader/TemplateEditTableTableHeader";
import { NumericInputField } from "../../../shared/components/NumericInputField/NumericInputField";
import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import { TemplateEditTableShowTableHeader } from "../TemplateEditTableHeader/TemplateEditTableShowTableHeader/TemplateEditTableShowTableHeader";
import { ModeOptions } from "../TemplateEditTableOptions/TemplateEditTableOptions";

interface ITemplateEditTableProps {
  item: IShiftReportTemplateTableVM;
  sqlViews: IShiftReportTemplateSqlViewDataVM[];
  onTableIndexActualize: (
    item: IShiftReportTemplateTableVM,
    direction: string
  ) => void;
  count: number;
  removeItem: (index: number) => void;
  copyItem: (item: IShiftReportTemplateTableVM) => void;
  constantGroups: IConstantGroupVM[];
  constants: IConstantVM[];
  onUpdate: (item: IShiftReportTemplateTableVM, index: number) => void;
  showTables: IShiftReportTemplateShowTablesVM;
  onShowTableRefresh: (
    table: IShiftReportTemplateTableVM,
    preshift: number
  ) => void;
  tableShowTables: IShiftReportTemplateTableShowTableVM[];
  onSqlTableRefresh: (
    view: IShiftReportTemplateSqlViewDataVM,
    sqlView: IShiftReportTemplateTableSqlViewVM
  ) => void;
  tableSqlViews: IShiftReportTemplateTableSqlViewVM[];
  outputlistObjects: IShiftReportTemplateTableOutputlistObjectsVM;
  currentOutputlistObjects: IShiftReportTemplateTableObjectVM[];
  onSortIndexUpdate: (itemId: number, newSortIndex: number) => void;
  isDisabled: boolean;
}

export const TemplateEditTable: React.FC<ITemplateEditTableProps> = ({
  item,
  sqlViews,
  onTableIndexActualize,
  count,
  removeItem,
  copyItem,
  constantGroups,
  constants,
  onUpdate,
  showTables,
  onShowTableRefresh,
  tableShowTables,
  onSqlTableRefresh,
  tableSqlViews,
  outputlistObjects,
  currentOutputlistObjects,
  onSortIndexUpdate,
  isDisabled,
}) => {
  const [localItem, setLocalItem] = useState<IShiftReportTemplateTableVM>(item);
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);

  const updateItem = (updates: Record<string, any>) => {
    const updatedItem = { ...localItem, ...updates };
    setLocalItem(updatedItem);
    onUpdate(updatedItem, updatedItem.sortIndex);
  };

  const onActualizeRows = (value: number) => {
    let objects = item.objects.filter((o) => o.rowIndex <= value);
    const countObjects = value * item.columns;
    if (objects.length !== countObjects) {
      for (let i = objects.length + 1; i <= countObjects; i++) {
        const rowIndex = Math.ceil(i / item.columns);
        const columnIndex =
          i % item.columns === 0 ? item.columns : i % item.columns;

        const tableObject: IShiftReportTemplateTableObjectVM = {
          id: 0,
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          type: IObjectType.Label,
          format: IObjectFormat.Text,
          backgroundColor: "",
          value: "",
          outputlistName: "",
          inputLength: 0,
          width: 0,
          fontSize: 12,
          alignment: "center",
          showBorder: false,
        };
        objects.push(tableObject);
      }
      for (let i = 1; i <= countObjects; i++) {
        const rowIndex = Math.ceil(i / item.columns);
        const columnIndex =
          i % item.columns === 0 ? item.columns : i % item.columns;
        objects[i - 1].rowIndex = rowIndex;
        objects[i - 1].columnIndex = columnIndex;
      }
    }
    updateItem({
      rows: value,
      objects: objects,
    });
  };

  const onActualizeColumns = (value: number) => {
    let objects = item.objects.filter((o) => o.columnIndex <= value);
    const countObjects = item.rows * value;

    if (objects.length !== countObjects) {
      for (let i = objects.length + 1; i <= countObjects; i++) {
        const rowIndex = Math.ceil(i / value);
        const columnIndex = i % value === 0 ? value : i % value;

        const tableObject: IShiftReportTemplateTableObjectVM = {
          id: 0,
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          type: IObjectType.Label,
          format: IObjectFormat.Text,
          backgroundColor: "",
          value: "",
          outputlistName: "",
          inputLength: 0,
          width: 0,
          fontSize: 12,
          alignment: "center",
          showBorder: false,
        };
        objects.push(tableObject);
      }
      for (let i = 1; i <= countObjects; i++) {
        const rowIndex = Math.ceil(i / value);
        const columnIndex = i % value === 0 ? value : i % value;
        objects[i - 1].rowIndex = rowIndex;
        objects[i - 1].columnIndex = columnIndex;
      }
    }

    updateItem({
      columns: value,
      objects: objects,
    });
  };

  const onSeperatorChecked = (c: boolean) => {
    updateItem({
      hasSeperator: c,
    });
  };

  const onSort = (direction: string) => {
    onTableIndexActualize(localItem, direction);
  };

  const onNameChange = (value: string) => {
    updateItem({
      name: value,
    });
  };

  const onVisibleRowsChange = (
    values: IShiftReportTemplateTableHiddedRowVM[]
  ) => {
    updateItem({
      hiddedRows: values,
    });
  };

  const onShowOnlyFilledRowsChange = (c: boolean) => {
    updateItem({
      showOnlyFilledRows: c,
    });
  };

  const renderTableHeader = (table: IShiftReportTemplateTableVM) => {
    switch (table.type) {
      case ITableObjectType.Table:
        return (
          <TemplateEditTableTableHeader
            item={table}
            onActualizeRows={onActualizeRows}
            onActualizeColumns={onActualizeColumns}
            onNameChange={onNameChange}
            onVisibleRowsChange={onVisibleRowsChange}
            isDisabled={isDisabled || isInputDisabled}
          />
        );
      case ITableObjectType.DatabaseTable:
        return (
          <TemplateEditTableSqlHeader
            sqlViews={sqlViews}
            onSqlTableRefresh={onSqlTableRefresh}
            item={item}
            tableSqlViews={tableSqlViews}
            isDisabled={isDisabled || isInputDisabled}
          />
        );
      case ITableObjectType.ShowTable:
        return (
          <TemplateEditTableShowTableHeader
            showTables={showTables}
            onRefresh={onShowTableRefresh}
            item={item}
            tableShowTables={tableShowTables}
            isDisabled={isDisabled || isInputDisabled}
          />
        );
      default:
        return null;
    }
  };

  const objectEditSave = (obj: IShiftReportTemplateTableObjectVM) => {
    if (item && item.objects) {
      const indexOfObjectToReplace = item.objects.findIndex((itemObj) => {
        return (
          itemObj.rowIndex === obj.rowIndex &&
          itemObj.columnIndex === obj.columnIndex
        );
      });
      if (indexOfObjectToReplace !== -1) {
        const newArray = [...item.objects];
        newArray[indexOfObjectToReplace] = obj;
        item.objects = newArray;
        updateItem({
          objects: item.objects,
        });
      }
    }
  };

  const onTableAction = (
    tableItem: IShiftReportTemplateTableVM,
    row: number,
    option: ModeOptions,
    rowCount: number
  ) => {
    if (option === "copy") {
      const getModifiedObjects = () => {
        const filteredObjects = tableItem.objects.filter(
          (o) => o.rowIndex === row
        );

        const otherObjects = tableItem.objects.filter(
          (o) => o.rowIndex !== row
        );

        let copyObjects: IShiftReportTemplateTableObjectVM[] = [];
        for (let i = 1; i <= rowCount; i++) {
          const modifiedObjects = filteredObjects.map((obj) => ({
            ...obj,
            id: 0,
            rowIndex: obj.rowIndex + i,
          }));
          copyObjects = copyObjects.concat(modifiedObjects);
        }

        let tempColumnIndex = 0;
        let rowIndex = rowCount + row + 1;
        otherObjects.forEach((obj) => {
          tempColumnIndex = obj.columnIndex;
          if (obj.rowIndex > row) {
            obj.rowIndex = rowIndex;
            if (tempColumnIndex === tableItem.columns) {
              rowIndex += 1;
            }
          }
        });

        return [...filteredObjects, ...copyObjects, ...otherObjects];
      };

      tableItem.rows += rowCount;
      tableItem.objects = getModifiedObjects();
      onUpdate(tableItem, tableItem.sortIndex);
    } else if (option === "delete") {
      const getModifiedObjects = () => {
        const remainingObjects = tableItem.objects.filter(
          (o) => o.rowIndex !== row
        );

        const adjustedObjects = remainingObjects.map((obj) => ({
          ...obj,
          rowIndex: obj.rowIndex > row ? obj.rowIndex - 1 : obj.rowIndex,
        }));

        return adjustedObjects;
      };

      tableItem.rows--;
      tableItem.objects = getModifiedObjects();
      onUpdate(tableItem, tableItem.sortIndex);
    }
  };

  const [inputValue, setInputValue] = useState(localItem.sortIndex.toString());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }

    setInputValue(value);

    if (value.length > 0) {
      delayRef.current = setTimeout(() => {
        setIsInputDisabled(true);
        timeoutRef.current = setTimeout(() => {
          onSortIndexUpdate(localItem.sortIndex, parseInt(value) - 1);
          setIsInputDisabled(false);
        }, 1000);
      }, 500);
    }
  };

  return (
    <>
      <div className={styles.containerContainer}>
        {renderTableHeader(localItem)}
        <TemplateEditTableHeaderItem title="Trennlinie">
          <EditCheckbox
            checked={localItem.hasSeperator}
            onChecked={onSeperatorChecked}
            disabled={isDisabled || isInputDisabled}
          />
        </TemplateEditTableHeaderItem>
        {localItem.type !== ITableObjectType.DatabaseTable && (
          <TemplateEditTableHeaderItem title="Nur ausgefüllte Zeilen anzeigen">
            <EditCheckbox
              checked={localItem.showOnlyFilledRows}
              onChecked={onShowOnlyFilledRowsChange}
              disabled={isDisabled || isInputDisabled}
            />
          </TemplateEditTableHeaderItem>
        )}
        <TemplateEditTableHeaderItem title="Ausgeblendet">
          <EditCheckbox
            checked={localItem.hidden}
            onChecked={(checked) =>
              updateItem({
                hidden: checked,
              })
            }
            disabled={isDisabled || isInputDisabled}
          />
        </TemplateEditTableHeaderItem>
        <div className={styles.innen}>
          <TemplateEditTableHeaderItem title="">
            <NumericInputField
              disabled={isDisabled || isInputDisabled}
              value={inputValue}
              width={40}
              maxLength={2}
              onChange={handleChange}
              max={count}
            />
            {localItem.sortIndex > 1 && (
              <IconButton
                icon={<UpOutlined />}
                onClick={() => onSort("up")}
                disabled={isDisabled || isInputDisabled}
              />
            )}
            {localItem.sortIndex !== count && (
              <IconButton
                icon={<DownOutlined />}
                onClick={() => onSort("down")}
                disabled={isDisabled || isInputDisabled}
              />
            )}
          </TemplateEditTableHeaderItem>
          <TemplateEditTableHeaderItem title="">
            {localItem.type !== ITableObjectType.DatabaseTable && (
              <IconButton
                icon={<CopyOutlined />}
                onClick={() => copyItem(localItem)}
                disabled={isDisabled || isInputDisabled}
              />
            )}
            <IconButton
              icon={<DeleteOutlined />}
              onClick={() => removeItem(localItem.sortIndex)}
              disabled={isDisabled || isInputDisabled}
            />
          </TemplateEditTableHeaderItem>
        </div>
      </div>
      <TemplateEditTableContent
        item={localItem}
        objectEditSave={objectEditSave}
        constantGroups={constantGroups}
        constants={constants}
        outputlistObjects={outputlistObjects}
        currentOutputlistObjects={currentOutputlistObjects}
        onTableAction={onTableAction}
        isDisabled={isDisabled || isInputDisabled}
      />
      {localItem.hasSeperator && <div className={styles.seperator}></div>}
    </>
  );
};
