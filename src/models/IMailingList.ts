import { IDocumentCategoryVM } from "./IDocumentCategory";

export interface IMailingListVm {
  id: string;
  name: string;
  description: string;
  mailingListMembers: IMailingListMemberVm[];
  documentCategories: IDocumentCategoryVM[];
  workgroupId: number;
}

export interface IMailingListMemberVm {
  id: string;
  eMail: string;
}

export interface IMailingListQueryResponse {
  mailingList: IMailingListVm[];
}

export class MailingListEditVm {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  mailingListMembers: IMailingListMemberVm[] | undefined;
  documentCategories: IDocumentCategoryVM[] | undefined;
  workgroupId: number | undefined;

  static emptyForNew(): MailingListEditVm {
    let retval = new MailingListEditVm();
    return retval;
  }

  static fromMailingList(mailingList: MailingListEditVm) {
    let retval = new MailingListEditVm();
    retval.id = mailingList.id;
    retval.name = mailingList.name;
    retval.description = mailingList.description;
    retval.mailingListMembers = mailingList.mailingListMembers;
    retval.documentCategories = mailingList.documentCategories;
    retval.workgroupId = mailingList.workgroupId;
    return retval;
  }
}
