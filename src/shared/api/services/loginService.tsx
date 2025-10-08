import {
  IUserAutoLoginQueryRequest,
  IUserLoginQueryRequest,
  IUserLoginQueryResult,
  IUserVm,
} from "../../../models/IUser";
import { httpClient } from "../httpClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const login = async (
  query: IUserLoginQueryRequest
): Promise<IUserLoginQueryResult> => {
  const response = await httpClient.post<IUserLoginQueryResult>(
    `${API_BASE_URL}/api/login`,
    query
  );
  return response.data;
};

const loginByToken = async (): Promise<IUserVm> => {
  const response = await httpClient.post<IUserVm>(
    `${API_BASE_URL}/api/login/loginByToken`
  );
  return response.data;
};

const autoLogin = async (
  query: IUserAutoLoginQueryRequest
): Promise<IUserLoginQueryResult> => {
  const response = await httpClient.post<IUserLoginQueryResult>(
    `${API_BASE_URL}/api/login/autoLogin`,
    query
  );
  return response.data;
};

const loginService = {
  login,
  loginByToken,
  autoLogin,
};

export default loginService;
