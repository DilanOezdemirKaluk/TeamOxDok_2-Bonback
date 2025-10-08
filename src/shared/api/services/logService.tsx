import { ILogVM, ILogVMResponse } from "../../../models/ILog";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (): Promise<ILogVM[]> => {
  const response = await httpClient.get<ILogVMResponse>("api/log");
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(response: ILogVMResponse): ILogVM[] {
  return _.map(response.logs);
}

const deleteLogs = async (): Promise<void> => {
  await httpClient.delete(`/api/log`);
};

const logService = {
  getAll,
  deleteLogs,
};

export default logService;
