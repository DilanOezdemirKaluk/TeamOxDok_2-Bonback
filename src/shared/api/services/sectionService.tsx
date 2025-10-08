import {
  ISectionQueryResponse,
  ISectionVM,
  SectionEditVM,
} from "../../../models/ISection";
import { IShiftReportSectionsRequest } from "../../../models/IShiftReport";
import { IWorkgroupQueryRequest } from "../../../models/IWorkgroup";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (query: IWorkgroupQueryRequest): Promise<ISectionVM[]> => {
  const response = await httpClient.post<ISectionQueryResponse>(
    "api/section",
    query
  );
  return getItemsFromResponse(response.data);
};

const getForMessages = async (
  query: IWorkgroupQueryRequest
): Promise<ISectionVM[]> => {
  const response = await httpClient.post<ISectionQueryResponse>(
    "api/section/getForMessages",
    query
  );
  return getItemsFromResponse(response.data);
};

const getForDisturbanceNotices = async (
  query: IWorkgroupQueryRequest
): Promise<ISectionVM[]> => {
  const response = await httpClient.post<ISectionQueryResponse>(
    "api/section/getForDisturbanceNotices",
    query
  );
  return getItemsFromResponse(response.data);
};

const getForShiftReports = async (
  query: IShiftReportSectionsRequest
): Promise<ISectionVM[]> => {
  const response = await httpClient.post<ISectionQueryResponse>(
    "api/section/getForShiftReports",
    query
  );
  return getItemsFromResponse(response.data);
};

const getAllWithDocumentCategories = async (
  query: IWorkgroupQueryRequest
): Promise<ISectionVM[]> => {
  const response = await httpClient.post<ISectionQueryResponse>(
    "api/section/getAllWithDocumentCategories",
    query
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(response: ISectionQueryResponse): ISectionVM[] {
  return _.map(response.section);
}

const create = async (item: SectionEditVM): Promise<SectionEditVM> => {
  const result = await httpClient.post<SectionEditVM>(
    `/api/section/create`,
    item
  );
  return result.data;
};

const update = async (item: SectionEditVM): Promise<SectionEditVM> => {
  const result = await httpClient.put<SectionEditVM>(`/api/section`, item);
  return result.data;
};

const deleteSection = async (id: number): Promise<void> => {
  await httpClient.delete<SectionEditVM>(`/api/section/${id}`);
};

const sectionService = {
  getAll,
  getForMessages,
  getForDisturbanceNotices,
  getForShiftReports,
  create,
  update,
  deleteSection,
  getAllWithDocumentCategories,
};

export default sectionService;
