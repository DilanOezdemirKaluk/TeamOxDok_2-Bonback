import { useSelector } from "react-redux";
import { IUserLoginQueryResult } from "../../../../models/IUser";

export const useCurrentWorkgroupId = () => {
  const user: IUserLoginQueryResult = useSelector((state: any) => state.user);
  return user?.user?.defaultWorkgroupId ?? -1;
};

export const useCurrentUserId = () => {
  const user: IUserLoginQueryResult = useSelector((state: any) => state.user);
  return user?.user?.id ?? "-1";
};

export const useCurrentUserName = () => {
  const user: IUserLoginQueryResult = useSelector((state: any) => state.user);
  return user?.user?.displayName ?? "";
};
