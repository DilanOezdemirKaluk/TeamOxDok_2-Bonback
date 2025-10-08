import {
  IMailLogResultVM,
  IMailLogVM,
  IMailLogVMResponse,
} from "../../../models/ILog";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (): Promise<IMailLogVM[]> => {
  const response = await httpClient.get<IMailLogVMResponse>("api/log/mails");
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(response: IMailLogVMResponse): IMailLogVM[] {
  return _.map(response.logs);
}

const deleteLogs = async (): Promise<void> => {
  await httpClient.delete(`/api/log/mails`);
};

const sendTestMail = async (email: string): Promise<IMailLogResultVM> => {
  const response = await httpClient.post<IMailLogResultVM>(
    `/api/log/testMail/${email}`
  );
  return response.data;
};

const sendReportTestMail = async (
  email: string,
  documentCategoryId: string
): Promise<IMailLogResultVM> => {
  const response = await httpClient.post<IMailLogResultVM>(
    `/api/log/testReportMail/${email}/${documentCategoryId}`
  );
  return response.data;
};

const sendReportTestMailForMailingList = async (
  mlId: string,
  documentCategoryId: string
): Promise<IMailLogResultVM> => {
  const response = await httpClient.post<IMailLogResultVM>(
    `/api/log/testReportMail/mailinglist/${mlId}/${documentCategoryId}`
  );
  return response.data;
};

const mailLogService = {
  getAll,
  deleteLogs,
  sendTestMail,
  sendReportTestMail,
  sendReportTestMailForMailingList,
};

export default mailLogService;
