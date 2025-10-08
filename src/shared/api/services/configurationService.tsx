import {
  IConfigurationVM,
  IConfigurationVMResponse,
} from "../../../models/IConfiguration";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (): Promise<IConfigurationVM[]> => {
  const response = await httpClient.get<IConfigurationVMResponse>(
    "api/configuration"
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(
  response: IConfigurationVMResponse
): IConfigurationVM[] {
  return _.map(response.configurations);
}

const update = async (
  items: IConfigurationVM[]
): Promise<IConfigurationVM[]> => {
  const result = await httpClient.put<IConfigurationVM[]>(
    `/api/configuration`,
    items
  );
  return result.data;
};

const configurationService = {
  getAll,
  update,
};

export default configurationService;
