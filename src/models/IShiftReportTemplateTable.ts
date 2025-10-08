import { Property } from "csstype";
import { IShiftReportTemplateVM } from "./IShiftReportTemplate";

export enum ITableObjectType {
  Table = 1,
  DatabaseTable = 2,
  ShowTable = 3,
}

export enum IObjectType {
  Undefined = 0,
  LOV = 1,
  Label = 2,
  Selection = 3,
  Input = 4,
  Blank = 5,
  Calculation = 6,
  SqlView = 7,
  TransferFromReport = 8,
}
export function getIObjectTypeFromNumericString(value: string): IObjectType {
  const numericValue = parseInt(value);
  if (
    !isNaN(numericValue) &&
    Object.values(IObjectType).includes(numericValue)
  ) {
    return numericValue as IObjectType;
  } else {
    return IObjectType.Undefined;
  }
}
export function getIObjectTypename(key: string) {
  switch (IObjectType[key as keyof typeof IObjectType]) {
    case IObjectType.LOV:
      return "Konstanten Auswahl";
    case IObjectType.Label:
      return "Label";
    case IObjectType.Selection:
      return "Konstanten Mehrfachauswahl";
    case IObjectType.Input:
      return "Eingabefeld";
    case IObjectType.Blank:
      return "Leeres Feld";
    case IObjectType.Calculation:
      return "Berechnung";
    case IObjectType.SqlView:
      return "SqlView Option";
    case IObjectType.TransferFromReport:
      return "Übertrag vom Schichtreport";
    default:
      return "Unknown Option";
  }
}

export enum IObjectFormat {
  Undefined = 0,
  Text = 1,
  Number = 2,
  DateField = 3,
  DateTime = 4,
  Time = 5,
}
export function getIObjectFormatNumericString(value: string): IObjectFormat {
  const numericValue = parseInt(value);
  if (
    !isNaN(numericValue) &&
    Object.values(IObjectFormat).includes(numericValue)
  ) {
    return numericValue as IObjectFormat;
  } else {
    return IObjectFormat.Undefined;
  }
}
export function getIObjectFormatTypename(key: string) {
  switch (IObjectFormat[key as keyof typeof IObjectFormat]) {
    case IObjectFormat.DateField:
      return "Datum";
    case IObjectFormat.DateTime:
      return "Datum mit Uhrzeit";
    case IObjectFormat.Number:
      return "Zahl";
    case IObjectFormat.Text:
      return "Text";
    case IObjectFormat.Time:
      return "Uhrzeit";
    default:
      return "Unknown Format";
  }
}

export interface IShiftReportTemplateTableVM {
  id: number;
  name: string | null;
  sortIndex: number;
  rows: number;
  columns: number;
  type: ITableObjectType;
  hasSeperator: boolean;
  showOnlyFilledRows: boolean;
  hiddedRows: IShiftReportTemplateTableHiddedRowVM[];
  objects: IShiftReportTemplateTableObjectVM[];
  template: IShiftReportTemplateVM;
  columnWidth: IShiftReportTemplateTableColumnWidth[];
  isDatabase: boolean;
  hidden: boolean;
}

export interface IShiftReportTemplateTableShowTableVM {
  id: number;
  table: IShiftReportTemplateTableVM;
  showTable: IShiftReportTemplateTableVM;
  preShift: number;
}

export interface IShiftReportTemplateShowTablesVM {
  tables: IShiftReportTemplateTableVM[];
  templates: IShiftReportTemplateVM[];
}

export interface IShiftReportTemplateTableOutputlistObjectsVM {
  objects: IShiftReportTemplateTableOutputlistObjectVM[];
  templates: IShiftReportTemplateVM[];
}

export interface IShiftReportTemplateTableOutputlistObjectVM {
  id: number;
  outputlistName: string;
  table: IShiftReportTemplateTableVM;
}

export interface IShiftReportTemplateTableSqlViewVM {
  id: number;
  tableId: number;
  viewName: string;
  showDescription: boolean;
  showColumnName: boolean;
  shiftColumn: string;
  shiftDataPreShift: number;
  orderColumn: string;
  orderColumnDirection: string;
}

export interface IShiftReportTemplateTableColumnWidth {
  columnIndex: number;
  width: number;
}

export interface IShiftReportTemplateTableHiddedRowVM {
  id: number;
  rowIndex: number;
}

export interface IShiftReportTemplateTableObjectVM {
  id: number;
  rowIndex: number;
  columnIndex: number;
  type: IObjectType;
  format: IObjectFormat;
  backgroundColor: string;
  value: string;
  outputlistName: string;
  inputLength: number;
  width: number;
  fontSize: number;
  alignment: Property.TextAlign;
  showBorder: boolean;
}

export interface IShiftReportTemplateSqlViewDataVM {
  name: string;
  columns: string[];
  table: IShiftReportTemplateTableVM;
}

export interface IShiftReportTemplateSqlViewDataVM {
  name: string;
  columns: string[];
  table: IShiftReportTemplateTableVM;
}

export interface ITransferReportObject {
  documentCategoryId: string;
  shift: string;
  column: string;
  onlyCurrent: boolean;
}

export interface ICalculateObject {
  sum: boolean;
  valueA: string;
  valueB: string;
  operator: string;
  values: string[];
}

export interface IShiftReportTemplateDatabaseTableItemVM {
  tableId: number;
  rowIndex: number;
  value: string;
}
