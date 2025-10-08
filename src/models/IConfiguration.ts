export interface IConfigurationVM {
  id: number;
  name: string;
  value: string;
}

export interface IConfigurationVMResponse {
  configurations: IConfigurationVM[];
}

export enum IConfigurationTypes {
  DisableReportAfterDays,
}

export const getAuthorizationTranslation = (
  authType: IConfigurationTypes
): string => {
  const names = {
    [IConfigurationTypes.DisableReportAfterDays]:
      "Schichtrapport nach X Tagen deaktivieren",
  };

  return names[authType] || "Unbekannte konfiguration";
};
