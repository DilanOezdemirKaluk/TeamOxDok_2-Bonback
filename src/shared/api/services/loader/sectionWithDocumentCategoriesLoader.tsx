import sectionService from "../sectionService";
import { ISectionVM } from "../../../../models/ISection";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useSectionWithDocumentCategoriesLoader = () => {
  const workgroupId = useCurrentWorkgroupId();

  const loadSectionData = (): Promise<ISectionVM[]> => {
    const sectionsResult = sectionService.getAllWithDocumentCategories({
      workgroupId: workgroupId,
    });
    return sectionsResult;
  };

  const {
    data: sections,
    loading: loadingSections,
    triggerReload: reloadSections,
  } = useData<ISectionVM[]>("", () => loadSectionData());

  return { sections, loadingSections, reloadSections };
};
