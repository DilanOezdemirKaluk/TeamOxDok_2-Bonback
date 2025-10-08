import { IDocumentCategoryVM } from "../../../../models/IDocumentCategory";
import documentCategoryService from "../documentCategoryService";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useDocumentCategoryLoader = (sectionId: number) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadDocumentCategoryData = (): Promise<IDocumentCategoryVM[]> => {
    const documentCategorieResult = documentCategoryService.getAll({
      sectionId,
      workgroupId: workgroupId,
    });
    return documentCategorieResult;
  };

  const {
    data: documentCategories,
    loading: loadingDocumentCategories,
    triggerReload: reloadDocumentCategories,
  } = useData<IDocumentCategoryVM[]>("", () => loadDocumentCategoryData());

  return {
    documentCategories,
    loadingDocumentCategories,
    reloadDocumentCategories,
  };
};
