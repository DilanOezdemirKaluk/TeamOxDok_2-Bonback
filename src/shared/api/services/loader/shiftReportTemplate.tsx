import { IShiftReportTemplateVM } from "../../../../models/IShiftReportTemplate";
import shiftReportTemplateService from "../shiftReportTemplateService";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useShiftReportTemplateLoader = (
  documentCategoryId: string,
  onlyValid: boolean
) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadData = (): Promise<IShiftReportTemplateVM[]> => {
    const result = shiftReportTemplateService.getAll({
      documentCategoryId,
      workgroupId: workgroupId,
      onlyValid: onlyValid,
    });
    return result;
  };

  const { data, loading, triggerReload } = useData<IShiftReportTemplateVM[]>(
    "",
    () => loadData()
  );

  return {
    data,
    loading,
    triggerReload,
  };
};
