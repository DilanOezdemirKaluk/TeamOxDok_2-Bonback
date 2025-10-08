import userGroupService from "../userGroupService";
import { IUserGroupVm } from "../../../../models/IUserGroup";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useUserGroupLoader = () => {
  const workgroupId = useCurrentWorkgroupId();

  const loadData = (): Promise<IUserGroupVm[]> => {
    const userGroupsResult = userGroupService.getAll({
      workgroupId: workgroupId,
    });
    return userGroupsResult;
  };

  const {
    loading: loadingUserGroups,
    data: userGroups,
    triggerReload: reloadUserGroups,
  } = useData<IUserGroupVm[]>("loadData", () => loadData());

  return { loadingUserGroups, userGroups, reloadUserGroups };
};
