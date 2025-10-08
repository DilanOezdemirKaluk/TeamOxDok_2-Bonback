import { useData } from "../../../masterDataHelpers";
import logService from "../logService";
import { ILogVM } from "../../../../models/ILog";

export const useLogLoader = () => {
  const loadLogData = (): Promise<ILogVM[]> => {
    const logResult = logService.getAll();
    return logResult;
  };

  const {
    data: logs,
    loading: loadingLogs,
    triggerReload: reloadLogs,
  } = useData<ILogVM[]>("", () => loadLogData());

  return { logs, loadingLogs, reloadLogs };
};
