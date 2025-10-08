import sectionService from "../sectionService";
import { ISectionVM } from "../../../../models/ISection";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useSectionShiftReportLoader = (testMode: boolean) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadSectionData = (testMode: boolean): Promise<ISectionVM[]> => {
    const sectionsResult = sectionService.getForShiftReports({
      workgroupId: workgroupId,
      testMode: testMode,
    });
    return sectionsResult;
  };

  const {
    data: sections,
    loading: loadingSections,
    triggerReload: reloadSections,
  } = useData<ISectionVM[]>("", () => loadSectionData(testMode));

  return { sections, loadingSections, reloadSections };
};
