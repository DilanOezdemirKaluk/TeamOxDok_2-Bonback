import {
  IShiftReportEditResponse,
  IShiftReportPrintResponse,
} from "../../../../models/IShiftReport";
import shiftReportService from "../shiftReportService";

export const useShiftReportEditLoader = () => {
  const getForEdit = (id: number): Promise<IShiftReportEditResponse> => {
    const result = shiftReportService.getForEdit(id);
    return result;
  };
  const getForPrint = (ids: number[]): Promise<IShiftReportPrintResponse> => {
    const result = shiftReportService.getForPrint(ids);
    return result;
  };
  return {
    getForEdit,
    getForPrint,
  };
};
