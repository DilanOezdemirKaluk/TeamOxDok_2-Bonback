import { useData } from "../../../masterDataHelpers";
import { IConfigurationVM } from "../../../../models/IConfiguration";
import configurationService from "../configurationService";

export const useConfigurationLoader = () => {
  const loadData = (): Promise<IConfigurationVM[]> => {
    const logResult = configurationService.getAll();
    return logResult;
  };

  const {
    data: configurations,
    loading: loadingConfigurations,
    triggerReload: reloadConfiguration,
  } = useData<IConfigurationVM[]>("", () => loadData());

  return { configurations, loadingConfigurations, reloadConfiguration };
};
