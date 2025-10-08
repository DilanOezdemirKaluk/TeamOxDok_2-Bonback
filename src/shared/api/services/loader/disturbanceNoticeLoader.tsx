import disturbanceNoticeService from "../disturbanceNoticeService";
import { IDisturbanceNoticeVM } from "../../../../models/IDisturbanceNotice";
import { ISectionVM } from "../../../../models/ISection";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useDisturbanceNoticeLoader = (
  currentSectionId: number,
  currentState: string,
  notRead: boolean
) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadDisturbanceNoticeData = (): Promise<{
    disturbanceNotices: IDisturbanceNoticeVM[];
    sections: ISectionVM[];
  }> => {
    const disturbanceNoticeResult = disturbanceNoticeService.getAll({
      workgroupId: workgroupId,
      sectionId: currentSectionId,
      stateType: currentState,
      notRead: notRead,
    });
    return disturbanceNoticeResult;
  };

  const {
    data: disturbanceNotices,
    loading: loadingDisturbanceNotices,
    triggerReload: reloadDisturbanceNotices,
  } = useData<{
    disturbanceNotices: IDisturbanceNoticeVM[];
    sections: ISectionVM[];
  }>("loadDisturbanceNoticeData", () => loadDisturbanceNoticeData());

  return {
    disturbanceNotices,
    loadingDisturbanceNotices,
    reloadDisturbanceNotices,
  };
};
