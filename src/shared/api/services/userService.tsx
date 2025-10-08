import {
  IUserVm,
  IUserQueryResponse,
  UserEditVm,
  UserCreationVM,
} from "../../../models/IUser";
import { IWorkgroupQueryRequest } from "../../../models/IWorkgroup";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (query: IWorkgroupQueryRequest): Promise<IUserVm[]> => {
  const response = await httpClient.post<IUserQueryResponse>("api/user", query);
  return getUserItemsFromResponse(response.data);
};

function getUserItemsFromResponse(response: IUserQueryResponse): IUserVm[] {
  return _.map(response.user);
}

const create = async (item: UserEditVm): Promise<UserCreationVM> => {
  const result = await httpClient.post<UserCreationVM>(
    `/api/user/create`,
    item
  );
  return result.data;
};

const update = async (item: UserEditVm): Promise<UserEditVm> => {
  const result = await httpClient.put<UserEditVm>(`/api/user`, item);
  return result.data;
};

const deleteUser = async (id: string): Promise<void> => {
  await httpClient.delete<UserEditVm>(`/api/user/${id}`);
};

const getForEdit = async (id: string): Promise<UserEditVm> => {
  const response = await httpClient.get("api/user/edit/" + id);
  return response.data;
};

const changeWorkgroup = async (): Promise<void> => {
  await httpClient.put<UserEditVm>(`/api/user/changeWorkgroup`);
};

const userService = {
  getAll,
  create,
  update,
  deleteUser,
  getForEdit,
  changeWorkgroup,
};

export default userService;
