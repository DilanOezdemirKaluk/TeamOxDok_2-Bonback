import { IDocumentCategoryVM } from "./IDocumentCategory";

export interface ISection {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  changedBy: string;
  changedAt: Date;
}

export interface ISectionVM {
  id: number;
  name: string;
  description: string;
  documentCategories: IDocumentCategoryVM[];
  workgroupId: number;
}
export const emptySection: ISectionVM = {
  id: 0,
  name: "",
  description: "",
  documentCategories: [],
  workgroupId: 0,
};

export interface ISectionWithDocumentCategoriesVM {
  id: string;
  name: string;
  description: string;
  documentCategories: IDocumentCategoryVM[];
}

export interface ISectionQueryResponse {
  section: ISectionVM[];
}
export class SectionEditVM {
  id: number | undefined;
  name: string | undefined;
  description: string | undefined;
  documentCategories: IDocumentCategoryVM[] | undefined;
  workgroupId: number | undefined;

  static emptyForNew(): SectionEditVM {
    let retval = new SectionEditVM();
    return retval;
  }

  static fromSection(section: SectionEditVM) {
    let retval = new SectionEditVM();
    retval.id = section.id;
    retval.name = section.name;
    retval.description = section.description;
    retval.documentCategories = section.documentCategories;
    retval.workgroupId = section.workgroupId;
    return retval;
  }
}
