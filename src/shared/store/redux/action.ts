import { IUserLoginQueryResult } from "../../../models/IUser";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT = "LOGOUT";
export const REPORT_CURRENT_DOCUMENT_CATEGORY_IDS =
  "REPORT_CURRENT_DOCUMENT_CATEGORY_IDS";
export const CLEAR_REPORT_CURRENT_DOCUMENT_CATEGORY_IDS =
  "CLEAR_REPORT_CURRENT_DOCUMENT_CATEGORY_IDS";

export const loginSuccess = (user: IUserLoginQueryResult) => ({
  type: LOGIN_SUCCESS,
  payload: user,
});

export const loginFailure = () => ({
  type: LOGIN_FAILURE,
});

export const logout = () => ({
  type: LOGOUT,
});

export const setReportDocumentCategoryIds = (ids: number[]) => ({
  type: REPORT_CURRENT_DOCUMENT_CATEGORY_IDS,
  payload: ids,
});

export const clearReportDocumentCategoryIds = () => ({
  type: CLEAR_REPORT_CURRENT_DOCUMENT_CATEGORY_IDS,
});
