import {
  IShiftReportTemplateVM,
  IShiftReportTemplateRequest,
  IShiftReportTemplatesResponse,
  IShiftReportTemplateResponse,
  IShiftReportTemplateSqlViewResult,
} from "../../../models/IShiftReportTemplate";
import { IShiftReportTemplateTableSqlViewVM } from "../../../models/IShiftReportTemplateTable";
import { httpClient } from "../httpClient";
import _ from "lodash";
import { useCurrentUserId } from "./loader/currentUserLoader";

const getAll = async (
  query: IShiftReportTemplateRequest
): Promise<IShiftReportTemplateVM[]> => {
  const response = await httpClient.post<IShiftReportTemplatesResponse>(
    "api/shiftReportTemplate",
    query
  );
  return getItemsFromResponse(response.data);
};

const getForEdit = async (
  id: number
): Promise<IShiftReportTemplateResponse> => {
  const response = await httpClient.get("api/shiftReportTemplate/" + id);
  return getItemFromResponse(response.data);
};

const getSqlViewResult = async (
  query: IShiftReportTemplateTableSqlViewVM
): Promise<IShiftReportTemplateSqlViewResult> => {
  const response = await httpClient.post<IShiftReportTemplateSqlViewResult>(
    "api/shiftReportTemplate/sqlViewTableData",
    query
  );
  return response.data;
};

const getForCreate = async (
  documentCategoryID: number,
  workgroupId: number
): Promise<IShiftReportTemplateResponse> => {
  const response = await httpClient.get(
    `api/shiftReportTemplate/getForCreate/documentCategoryID/${documentCategoryID}/workgroupId/${workgroupId}`
  );
  return getItemFromResponse(response.data);
};
const update = async (
  item: IShiftReportTemplateVM
): Promise<IShiftReportTemplateResponse> => {
  const result = await httpClient.put<IShiftReportTemplateResponse>(
    `/api/shiftReportTemplate`,
    item
  );
  return getItemFromResponse(result.data);
};
const updateNewVersion = async (
  item: IShiftReportTemplateVM
): Promise<IShiftReportTemplateResponse> => {
  const result = await httpClient.put<IShiftReportTemplateResponse>(
    `/api/shiftReportTemplate/newVersion`,
    item
  );
  return getItemFromResponse(result.data);
};
const getForSingleCreate = async (
  documentCategoryID: string
): Promise<IShiftReportTemplateVM[]> => {
  const response = await httpClient.get(
    `api/shiftReportTemplate/getForSingleCreate/documentCategoryID/${documentCategoryID}`
  );
  return response.data;
};
const updateValid = async (id: number, valid: boolean): Promise<boolean> => {
  const result = await httpClient.put<boolean>(
    `/api/shiftReportTemplate/updateValid`,
    {
      id,
      valid,
    }
  );
  return result.data;
};

function getItemsFromResponse(
  response: IShiftReportTemplatesResponse
): IShiftReportTemplateVM[] {
  return _.map(response.shiftReportTemplates);
}

function getItemFromResponse(
  response: IShiftReportTemplateResponse
): IShiftReportTemplateResponse {
  return {
    item: response.item,
    views: response.views || [],
    constantGroups: response.constantGroups,
    constants: response.constants,
    showTables: response.showTables,
    outputlistObjects: response.outputlistObjects,
    lockedBy: response.lockedBy,
    lockedByEightId: response.lockedByEightId,
    size: response.size,
  };
}

const copyTemplate = async (
  documentCategoryId: number,
  templateId: number,
  templateName: string
): Promise<number> => {
  const result = await httpClient.post<number>(
    `/api/shiftReportTemplate/copy`,
    {
      documentCategoryId,
      templateId,
      templateName,
      currentUserId: useCurrentUserId,
    }
  );
  return result.data;
};

const shiftReportTemplateService = {
  getAll,
  getForEdit,
  update,
  updateNewVersion,
  getForCreate,
  getForSingleCreate,
  updateValid,
  getSqlViewResult,
  copyTemplate,
};

export default shiftReportTemplateService;
