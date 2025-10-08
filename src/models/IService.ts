export interface ILockedReportUserVM {
  reportId: number;
  reportName: string;
  documentCategory: string;
  firstName: string;
  surname: string;
  username: string;
  lockedAt: string;
  unlockedat: string;
}

export interface GetLockedReportsWithUserQueryResponse {
  data: ILockedReportUserVM[];
}

export interface IMenuItemCountsResponse {
  data: IMenuItemCounts;
}

export interface IMenuItemCounts {
  disturbanceNoticeCount: number;
  messageCount: number;
}
