import constantService from "../constantService";
import { IConstantGroupVM } from "../../../../models/IConstant";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useConstantGroupLoader = () => {
  const workgroupId = useCurrentWorkgroupId();

  const loadData = (): Promise<IConstantGroupVM[]> => {
    const constantGroupResult = constantService.getAllGroups({
      workgroupId: workgroupId,
    });
    return constantGroupResult;
  };

  const {
    loading: loadingConstantGroups,
    data: constantGroups,
    triggerReload: reloadConstantGroups,
  } = useData<IConstantGroupVM[]>("loadData", () => loadData());

  return { loadingConstantGroups, constantGroups, reloadConstantGroups };
};
