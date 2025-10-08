import {
  IShiftReportVM,
  IShiftReportEditVM,
  IShiftReportRequest,
  IShiftReportResponse,
  IShiftReportEditResponse,
  IShiftReportPrintResponse,
  IShiftReportPrintListRequst,
} from "../../../models/IShiftReport";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (
  query: IShiftReportRequest
): Promise<IShiftReportVM[]> => {
  const response = await httpClient.post<IShiftReportResponse>(
    "api/shiftReport",
    query
  );
  return getItemsFromResponse(response.data);
};

const getForEdit = async (id: number): Promise<IShiftReportEditResponse> => {
  const response = await httpClient.get("api/shiftReport/" + id);
  return getEditItemFromResponse(response.data);
};

const getForPrint = async (
  ids: number[]
): Promise<IShiftReportPrintResponse> => {
  const idsQueryString = ids.join("&ids=");
  const apiUrl = `api/service/forPrint?ids=${idsQueryString}`;
  const response = await httpClient.get(apiUrl);
  return getPrintItemFromResponse(response.data);
};

const getForPrintList = async (
  query: IShiftReportPrintListRequst
): Promise<IShiftReportVM[]> => {
  const response = await httpClient.post<IShiftReportResponse>(
    "api/service/printList",
    query
  );
  return getItemsFromResponse(response.data);
};

const lockShiftReport = async (
  reportId: number,
  userId: string,
  documentCategoryId: number,
  locked: boolean
): Promise<boolean> => {
  const response = await httpClient.put(
    `api/shiftReport/lockShiftReport/reportId/${reportId}/userId/${userId}/documentCategoryId/${documentCategoryId}/locked/${locked}`
  );
  return response.data;
};

function getEditItemFromResponse(
  response: IShiftReportEditResponse
): IShiftReportEditResponse {
  return {
    item: response.item,
    constants: response.constants,
    disturbanceNotices: response.disturbanceNotices,
    messages: response.messages,
    lockedBy: response.lockedBy,
    previousShiftId: response.previousShiftId,
    nextShiftId: response.nextShiftId,
    lockedByEightId: response.lockedByEightId,
    size: response.size,
    isAuthorized: response.isAuthorized,
  };
}

function getPrintItemFromResponse(
  response: IShiftReportPrintResponse
): IShiftReportPrintResponse {
  return {
    items: response.items,
    constants: response.constants,
  };
}

function getItemsFromResponse(
  response: IShiftReportResponse
): IShiftReportVM[] {
  return _.map(response.shiftReports);
}

const update = async (item: IShiftReportEditVM): Promise<IShiftReportVM> => {
  const response = await httpClient.put<IShiftReportVM>(
    `/api/shiftReport`,
    item
  );
  return response.data;
};

const shiftReportService = {
  getAll,
  getForEdit,
  update,
  getForPrint,
  getForPrintList,
  lockShiftReport,
};

export default shiftReportService;
