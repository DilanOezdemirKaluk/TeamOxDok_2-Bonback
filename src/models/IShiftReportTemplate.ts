import { IConstantGroupVM, IConstantVM } from "./IConstant";
import { IDocument } from "./IDocument";
import {
  IDocumentCategoryVM,
  emptyDocumentCategory,
} from "./IDocumentCategory";
import { IOutputList } from "./IOutputList";
import {
  IShiftReportTemplateShowTablesVM,
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  IShiftReportTemplateTableShowTableVM,
  IShiftReportTemplateTableSqlViewVM,
  IShiftReportTemplateTableVM,
} from "./IShiftReportTemplateTable";
import { IWorkgroup, emptyWorkgroup } from "./IWorkgroup";

export interface IShiftReportTemplate {
  id: number;
  name: string;
  isValid: boolean;
  version: number;
  createdBy: number;
  createdAt: Date;
  changedBy: number;
  changedAt: Date;
  documentCategory: IDocumentCategoryVM;
}

export interface IShiftReportTemplateVM {
  id: number;
  name: string;
  isValid: boolean;
  version: number;
  createdAt: Date;
  changedAt: Date;
  createdByName: string;
  changedByName: string;
  documentCategory: IDocumentCategoryVM;
  tables: IShiftReportTemplateTableVM[];
  showTables: IShiftReportTemplateTableShowTableVM[];
  workgroup: IWorkgroup;
  sqlViews: IShiftReportTemplateTableSqlViewVM[];
  documents: IDocument[];
  outputLists: IOutputList[];
}
export const emptyShiftReportTemplate: IShiftReportTemplateVM = {
  id: 0,
  name: "",
  isValid: false,
  version: 0,
  createdAt: new Date(),
  changedAt: new Date(),
  createdByName: "",
  changedByName: "",
  documentCategory: emptyDocumentCategory,
  tables: [],
  showTables: [],
  workgroup: emptyWorkgroup,
  sqlViews: [],
  documents: [],
  outputLists: [],
};

export interface IShiftReportTemplateRequest {
  documentCategoryId: string;
  workgroupId: number;
  onlyValid: boolean;
}
export interface IShiftReportTemplatesResponse {
  shiftReportTemplates: IShiftReportTemplateVM[];
}
export interface IShiftReportTemplateResponse {
  item: IShiftReportTemplateVM;
  views: IShiftReportTemplateSqlViewDataVM[];
  constantGroups: IConstantGroupVM[];
  constants: IConstantVM[];
  showTables: IShiftReportTemplateShowTablesVM;
  outputlistObjects: IShiftReportTemplateTableOutputlistObjectsVM;
  lockedBy: string;
  lockedByEightId: string;
  size: number;
}
export interface IShiftReportTemplateSqlViewResult {
  item: IShiftReportTemplateTableSqlViewResultVM;
}

export interface IShiftReportTemplateTableSqlViewResultVM {
  rows: number;
  columns: number;
  objects: IShiftReportTemplateTableObjectVM[];
}
