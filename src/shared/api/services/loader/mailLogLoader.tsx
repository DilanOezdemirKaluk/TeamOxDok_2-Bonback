import { useData } from "../../../masterDataHelpers";
import { IMailLogVM } from "../../../../models/ILog";
import mailLogService from "../mailLogService";

export const useMailLogLoader = () => {
  const loadMailLogData = (): Promise<IMailLogVM[]> => {
    const logResult = mailLogService.getAll();
    return logResult;
  };

  const {
    data: mailLogs,
    loading: loadingMailLogs,
    triggerReload: reloadMailLogs,
  } = useData<IMailLogVM[]>("", () => loadMailLogData());

  return { mailLogs, loadingMailLogs, reloadMailLogs };
};
