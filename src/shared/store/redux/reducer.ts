import { IUserLoginQueryResult } from "../../../models/IUser";
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CLEAR_REPORT_CURRENT_DOCUMENT_CATEGORY_IDS,
  REPORT_CURRENT_DOCUMENT_CATEGORY_IDS,
} from "./action";

export interface AppState {
  user: IUserLoginQueryResult;
  error: string | null;
  documentCategoryIds: number[];
}

const initialState: AppState = {
  user: { expiration: null, token: null, user: null },
  error: null,
  documentCategoryIds: [],
};

const reducer = (state: AppState = initialState, action: any) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        error: null,
        token: action.payload.token,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        user: initialState.user,
        error: "Login failed. Please check your credentials.",
        token: null,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        error: null,
        token: null,
      };
    case REPORT_CURRENT_DOCUMENT_CATEGORY_IDS:
      return { ...state, documentCategoryIds: action.payload };
    case CLEAR_REPORT_CURRENT_DOCUMENT_CATEGORY_IDS:
      return { ...state, documentCategoryIds: [] };
    default:
      return state;
  }
};

export default reducer;
