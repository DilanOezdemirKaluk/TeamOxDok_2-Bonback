import mailingListService from "../mailingListService";
import { IMailingListVm } from "../../../../models/IMailingList";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useMailingListLoader = () => {
  const workgroupId = useCurrentWorkgroupId();

  const loadData = (): Promise<IMailingListVm[]> => {
    const mailingListsResult = mailingListService.getAll({
      workgroupId: workgroupId,
    });
    return mailingListsResult;
  };

  const {
    loading: loadingMailingLists,
    data: mailingLists,
    triggerReload: reloadMailingLists,
  } = useData<IMailingListVm[]>("loadData", () => loadData());

  return { loadingMailingLists, mailingLists, reloadMailingLists };
};
