import userService from "../userService";
import { IUserVm } from "../../../../models/IUser";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useUserLoader = () => {
  const workgroupId = useCurrentWorkgroupId();

  const loadUserData = (): Promise<IUserVm[]> => {
    const usersResult = userService.getAll({
      workgroupId: workgroupId,
    });
    return usersResult;
  };

  const {
    loading: loadingUsers,
    data: users,
    triggerReload: reloadUsers,
  } = useData<IUserVm[]>("loadUserData", () => loadUserData());

  return { loadingUsers, users, reloadUsers };
};
