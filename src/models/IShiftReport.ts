import { IConstantVM } from "./IConstant";
import { IDisturbanceNoticeVM } from "./IDisturbanceNotice";
import { IDocument } from "./IDocument";
import { IMessageVM } from "./IMessage";
import { IOutputList } from "./IOutputList";
import { IShiftReportTemplateVM } from "./IShiftReportTemplate";
import {
  IShiftReportTemplateDatabaseTableItemVM,
  IShiftReportTemplateTableObjectVM,
} from "./IShiftReportTemplateTable";

export interface IShiftReportVM {
  id: number;
  shiftId: number;
  testMode: boolean;
  createdBy: number;
  createdAt: Date;
  changedBy: number;
  changedAt: Date;
  shiftReportTemplate: IShiftReportTemplateVM;
  createdByName: string;
  changedByName: string;
  disabled: boolean;
  objects: IShiftReportObject[];
  templateOutputlistObjects: IOutputList[];
}

export interface IShiftReportObject {
  id: number;
  value: string;
  shiftReportTemplateTableObject: IShiftReportTemplateTableObjectVM;
}

export interface IShiftReportVisibleRows {
  tableId: number;
  rows: number[];
}

export interface IShiftReportEditVM {
  id: number;
  shiftId: number;
  testMode: boolean;
  createdAt: Date;
  changedAt: Date;
  shiftReportTemplate: IShiftReportTemplateVM;
  shiftReportObjects: IShiftReportObject[];
  shiftReportVisibleRows: IShiftReportVisibleRows[];
  createdByName: string;
  changedByName: string;
  documents: IDocument[];
  databaseTableItems: IShiftReportTemplateDatabaseTableItemVM[];
  disabled: boolean;
  visibleRows: IShiftReportVisibleRows[];
}

export interface IShiftReportRequest {
  documentCategories: number[];
  workgroupId: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  shiftId: string;
  testMode: boolean;
}
export interface IShiftReportResponse {
  shiftReports: IShiftReportVM[];
}

export interface IShiftReportEditResponse {
  item: IShiftReportEditVM;
  constants: IConstantVM[];
  disturbanceNotices: IDisturbanceNoticeVM[];
  messages: IMessageVM[];
  lockedBy: string;
  previousShiftId: number;
  nextShiftId: number;
  lockedByEightId: string;
  size: number;
  isAuthorized: boolean;
}

export interface IShiftReportPrintResponse {
  items: IShiftReportEditVM[];
  constants: IConstantVM[];
}

export interface IShiftReportSectionsRequest {
  workgroupId: number;
  testMode: boolean;
}

export interface IShiftReportPrintListRequst {
  startDate: Date;
  endDate: Date;
  documentCategoryId: string;
  shiftIds: string[];
}

export interface ICreateShiftReportPdfRequest {
  templateId: number;
}
