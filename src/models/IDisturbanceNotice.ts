import { IDocument } from "./IDocument";
import { IMessageStates } from "./IMessage";
import { ISectionVM } from "./ISection";

export enum DisturbanceNoticeStateType {
  Open = 1,
  InProgress = 2,
  Closed = 3,
}

export interface IDisturbanceNoticeVM {
  id: string;
  description: string;
  location: string;
  state: IMessageStates;
  reportTo: string;
  note: string;
  effect: string;
  section: ISectionVM;
  createdAt: Date;
  isActive: boolean;
  createdBy: string;
  documents: IDocument[];
  createdByName: string;
}

export class DisturbanceNoticeEditVm {
  id: string | undefined;
  description: string | undefined;
  location: string | undefined;
  state: IMessageStates | undefined;
  reportTo: string | undefined;
  note: string | undefined;
  effect: string | undefined;
  section: ISectionVM | undefined;
  createdAt: Date | undefined;
  createdBy: string | undefined;
  isActive: boolean | undefined;
  documents: IDocument[] | undefined;
  createdByName: string | undefined;

  static emptyForNew(): DisturbanceNoticeEditVm {
    let retval = new DisturbanceNoticeEditVm();
    retval.state = IMessageStates.open;
    return retval;
  }

  static fromDisturbanceNotice(disturbanceNotice: DisturbanceNoticeEditVm) {
    let retval = new DisturbanceNoticeEditVm();
    retval.id = disturbanceNotice.id;
    retval.description = disturbanceNotice.description;
    retval.location = disturbanceNotice.location;
    retval.state = disturbanceNotice.state;
    retval.reportTo = disturbanceNotice.reportTo;
    retval.note = disturbanceNotice.note;
    retval.effect = disturbanceNotice.effect;
    retval.section = disturbanceNotice.section;
    retval.createdAt = disturbanceNotice.createdAt;
    retval.isActive = disturbanceNotice.isActive;
    retval.createdBy = disturbanceNotice.createdBy;
    retval.documents = disturbanceNotice.documents;
    retval.createdByName = disturbanceNotice.createdByName;
    return retval;
  }
}

export interface IDisturbanceNoticeRequest {
  workgroupId: number;
  sectionId: number;
  stateType: string;
  notRead: boolean;
}

export interface IDisturbanceNoticeResponse {
  disturbanceNotices: IDisturbanceNoticeVM[];
  sections: ISectionVM[];
}
