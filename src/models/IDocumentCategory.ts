import { ISectionVM, emptySection } from "./ISection";

export interface IDocumentCategoryVM {
  id: number;
  name: string;
  description: string;
  section: ISectionVM;
  workgroupId: number;
  color: string;
}

export class DocumentCategoryEditVM {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  section: ISectionVM | undefined;
  workgroupId: number | undefined;
  color: string | undefined;

  static emptyForNew(): DocumentCategoryEditVM {
    let retval = new DocumentCategoryEditVM();
    retval.color = "#c1bdbdE3";
    return retval;
  }

  static fromDocumentCategory(documentCategory: DocumentCategoryEditVM) {
    let retval = new DocumentCategoryEditVM();
    retval.id = documentCategory.id;
    retval.name = documentCategory.name;
    retval.description = documentCategory.description;
    retval.section = documentCategory.section;
    retval.workgroupId = documentCategory.workgroupId;
    retval.color = documentCategory.color;
    return retval;
  }
}

export interface IDocumentCategoryQueryResponse {
  documentCategory: IDocumentCategoryVM[];
}

export const emptyDocumentCategory: IDocumentCategoryVM = {
  id: 0,
  name: "",
  description: "",
  section: emptySection,
  workgroupId: 0,
  color: "",
};

export interface IDocumentCategoryRequest {
  sectionId: number;
  workgroupId: number;
}
export interface IDocumentCategoryResponse {
  documentCategory: IDocumentCategoryVM[];
}
