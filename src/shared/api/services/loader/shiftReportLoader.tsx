import { useData } from "../../../masterDataHelpers";
import { IShiftReportVM } from "../../../../models/IShiftReport";
import shiftReportService from "../shiftReportService";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useShiftReportLoader = (
  documentCategories: number[],
  startDate: Date | undefined,
  endDate: Date | undefined,
  shiftId: string,
  testMode: boolean
) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadData = (): Promise<IShiftReportVM[]> => {
    const result = shiftReportService.getAll({
      documentCategories,
      workgroupId: workgroupId,
      startDate,
      endDate,
      shiftId,
      testMode,
    });
    return result;
  };

  const { data, loading, triggerReload } = useData<IShiftReportVM[]>("", () =>
    loadData()
  );

  return {
    data,
    loading,
    triggerReload,
  };
};
