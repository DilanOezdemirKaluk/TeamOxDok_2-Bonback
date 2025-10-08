import {
  IMailingListQueryResponse,
  IMailingListVm,
  MailingListEditVm,
} from "../../../models/IMailingList";
import { IWorkgroupQueryRequest } from "../../../models/IWorkgroup";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (
  query: IWorkgroupQueryRequest
): Promise<IMailingListVm[]> => {
  const response = await httpClient.post<IMailingListQueryResponse>(
    "api/mailinglist",
    query
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(
  response: IMailingListQueryResponse
): IMailingListVm[] {
  return _.map(response.mailingList);
}

const update = async (item: MailingListEditVm): Promise<MailingListEditVm> => {
  const result = await httpClient.put<MailingListEditVm>(
    `/api/mailingList`,
    item
  );
  return result.data;
};

const deleteMailingList = async (id: string): Promise<void> => {
  await httpClient.delete<MailingListEditVm>(`/api/mailingList/${id}`);
};

const mailingListService = {
  getAll,
  update,
  deleteMailingList,
};

export default mailingListService;
