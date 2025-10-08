import {
  IShiftReportTemplateResponse,
  IShiftReportTemplateSqlViewResult,
  IShiftReportTemplateVM,
} from "../../../../models/IShiftReportTemplate";
import { IShiftReportTemplateTableSqlViewVM } from "../../../../models/IShiftReportTemplateTable";
import shiftReportTemplateService from "../shiftReportTemplateService";

export const useShiftReportTemplateEditLoader = () => {
  const getForEdit = (id: number): Promise<IShiftReportTemplateResponse> => {
    const result = shiftReportTemplateService.getForEdit(id);
    return result;
  };
  const getForCreate = (
    documentCategoryID: number,
    workgroupId: number
  ): Promise<IShiftReportTemplateResponse> => {
    const result = shiftReportTemplateService.getForCreate(
      documentCategoryID,
      workgroupId
    );
    return result;
  };
  const getForSingleCreate = (
    documentCategoryID: string
  ): Promise<IShiftReportTemplateVM[]> => {
    const result =
      shiftReportTemplateService.getForSingleCreate(documentCategoryID);
    return result;
  };
  const getSqlViewResult = (
    query: IShiftReportTemplateTableSqlViewVM
  ): Promise<IShiftReportTemplateSqlViewResult> => {
    const result = shiftReportTemplateService.getSqlViewResult(query);
    return result;
  };
  return {
    getForEdit,
    getForCreate,
    getForSingleCreate,
    getSqlViewResult,
  };
};
