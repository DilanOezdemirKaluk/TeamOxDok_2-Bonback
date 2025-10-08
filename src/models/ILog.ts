import { IMailingListVm } from "./IMailingList";

export interface ILogVM {
  id: number;
  message: string;
  messageTemplate: string;
  level: string;
  timeStamp: Date;
  exception: string;
  logEvent: string;
}

export interface IMailLogVM {
  id: number;
  createdAt: Date;
  fileNames: string[];
  error: string;
  mailingList: IMailingListVm;
}

export interface ILogVMResponse {
  logs: ILogVM[];
}
export interface IMailLogVMResponse {
  logs: IMailLogVM[];
}

export enum ILogStatus {
  Success = 1,
  Failed = 2,
}

export interface IMailLogResultVM {
  result: string;
  status: ILogStatus;
}
