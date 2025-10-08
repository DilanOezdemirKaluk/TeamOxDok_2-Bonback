import {
  IUserGroupVm,
  IUserGroupQueryResponse,
  UserGroupEditVm,
} from "../../../models/IUserGroup";
import { IWorkgroupQueryRequest } from "../../../models/IWorkgroup";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (
  query: IWorkgroupQueryRequest
): Promise<IUserGroupVm[]> => {
  const response = await httpClient.post<IUserGroupQueryResponse>(
    "api/usergroup",
    query
  );
  return getItemsFromResponse(response.data);
};

const update = async (item: UserGroupEditVm): Promise<UserGroupEditVm> => {
  const result = await httpClient.put<UserGroupEditVm>(`/api/usergroup`, item);
  return result.data;
};

const deleteUserGroup = async (id: string): Promise<void> => {
  await httpClient.delete<UserGroupEditVm>(`/api/usergroup/${id}`);
};

const getForEdit = async (id: string): Promise<UserGroupEditVm> => {
  const response = await httpClient.get("api/usergroup/edit/" + id);
  return response.data;
};

function getItemsFromResponse(
  response: IUserGroupQueryResponse
): IUserGroupVm[] {
  return _.map(response.usergroup);
}

const userGroupService = {
  getAll,
  update,
  deleteUserGroup,
  getForEdit,
};

export default userGroupService;
