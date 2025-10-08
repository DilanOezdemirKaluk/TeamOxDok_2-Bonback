import _ from "lodash";
import {
  GetLockedReportsWithUserQueryResponse,
  ILockedReportUserVM,
  IMenuItemCounts,
  IMenuItemCountsResponse,
} from "../../../models/IService";
import { httpClient } from "../httpClient";

const ping = async () => {
  const result = await httpClient.get<string>("/api/service/ping");
  return result.data;
};

const createShiftReport = async (
  templateId: string,
  testMode: boolean
): Promise<string> => {
  const result = await httpClient.post<string>(
    `/api/service/createShiftReport`,
    {
      templateId: templateId,
      testMode: testMode,
    }
  );
  return result.data;
};

const getLockedReportsWithUser = async (): Promise<ILockedReportUserVM[]> => {
  const response = await httpClient.post<GetLockedReportsWithUserQueryResponse>(
    "api/service/getLockedReportsWithUser",
    {}
  );
  return getLockedReportsWithUserItemsFromRepsonse(response.data);
};

function getLockedReportsWithUserItemsFromRepsonse(
  response: GetLockedReportsWithUserQueryResponse
): ILockedReportUserVM[] {
  return _.map(response.data);
}

const unlockReport = async (
  reportId: number
): Promise<ILockedReportUserVM[]> => {
  const response = await httpClient.post<GetLockedReportsWithUserQueryResponse>(
    "api/service/unlockReport",
    {
      reportId: reportId,
    }
  );
  return getLockedReportsWithUserItemsFromRepsonse(response.data);
};

const getMenuItemCounts = async (
  workgroupId: number
): Promise<IMenuItemCounts> => {
  const result = await httpClient.get<IMenuItemCountsResponse>(
    "/api/service/getMenuItemCounts/workgroupId/" + workgroupId
  );
  return result.data.data;
};

const serviceService = {
  createShiftReport,
  ping,
  getLockedReportsWithUser,
  unlockReport,
  getMenuItemCounts,
};

export default serviceService;
