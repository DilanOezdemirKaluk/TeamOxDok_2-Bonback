import { IConstantVM } from "../../../../models/IConstant";
import constantService from "../constantService";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useConstantLoader = (currentGroupId: number) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadConstantData = (): Promise<IConstantVM[]> => {
    const constantResult = constantService.getAll({
      groupId: currentGroupId,
      workgroupId: workgroupId,
    });
    return constantResult;
  };

  const {
    data: constants,
    loading: loadingConstants,
    triggerReload: reloadConstants,
  } = useData<IConstantVM[]>("loadConstantData", () => loadConstantData());

  return { constants, loadingConstants, reloadConstants };
};
