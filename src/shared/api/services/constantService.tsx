import {
  IConstantGroupQueryResponse,
  IConstantGroupVM,
  IConstantQueryRequest,
  IConstantQueryResponse,
  IConstantVM,
  ConstantGroupEditVM,
  ConstantEditVm,
} from "../../../models/IConstant";
import { IWorkgroupQueryRequest } from "../../../models/IWorkgroup";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (query: IConstantQueryRequest): Promise<IConstantVM[]> => {
  const response = await httpClient.post<IConstantQueryResponse>(
    "api/constant",
    query
  );
  return getItemsFromResponse(response.data);
};

const getAllGroups = async (
  query: IWorkgroupQueryRequest
): Promise<IConstantGroupVM[]> => {
  const response = await httpClient.post<IConstantGroupQueryResponse>(
    "api/constant/getAllGroups",
    query
  );
  return getGroupItemsFromResponse(response.data);
};

const createConstantGroup = async (
  item: ConstantGroupEditVM
): Promise<ConstantGroupEditVM> => {
  const result = await httpClient.post<ConstantGroupEditVM>(
    `/api/constant/createConstantGroup`,
    item
  );
  return result.data;
};

const updateConstantGroup = async (
  item: ConstantGroupEditVM
): Promise<ConstantGroupEditVM> => {
  const result = await httpClient.put<ConstantGroupEditVM>(
    `/api/constant/updateConstantGroup`,
    item
  );
  return result.data;
};

const deleteConstantGroup = async (id: string): Promise<void> => {
  await httpClient.delete<ConstantGroupEditVM>(
    `/api/constant/deleteConstantGroup/${id}`
  );
};

const createConstant = async (
  item: ConstantEditVm
): Promise<ConstantEditVm> => {
  const result = await httpClient.post<ConstantEditVm>(
    `/api/constant/createConstant`,
    item
  );
  return result.data;
};

const updateConstant = async (
  item: ConstantEditVm
): Promise<ConstantEditVm> => {
  const result = await httpClient.put<ConstantEditVm>(
    `/api/constant/updateConstant`,
    item
  );
  return result.data;
};

const deleteConstant = async (id: string): Promise<void> => {
  await httpClient.delete<ConstantEditVm>(`/api/constant/deleteConstant/${id}`);
};

function getItemsFromResponse(response: IConstantQueryResponse): IConstantVM[] {
  return _.map(response.constant);
}
function getGroupItemsFromResponse(
  response: IConstantGroupQueryResponse
): IConstantGroupVM[] {
  return _.map(response.constantGroup);
}

const constantService = {
  getAllGroups,
  getAll,
  createConstantGroup,
  updateConstantGroup,
  deleteConstantGroup,
  updateConstant,
  createConstant,
  deleteConstant,
};

export default constantService;
