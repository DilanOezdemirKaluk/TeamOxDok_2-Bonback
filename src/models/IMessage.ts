import { IDocument } from "./IDocument";
import { ISectionVM } from "./ISection";

export interface IMessageVM {
  id: string;
  description: string;
  location: string;
  state: IMessageStates;
  reportTo: string;
  note: string;
  effect: string;
  sections: ISectionVM[];
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  documents: IDocument[];
  favoriteUserIds: string[];
  createdByName: string;
  isFavorite: boolean;
}

export interface IMessageRequest {
  workgroupId: number;
  sectionIds: number[];
  onlyActive: boolean;
}

export interface IMessageResponse {
  unread: IMessageVM[];
  favorite: IMessageVM[];
  read: IMessageVM[];
}

export enum IMessageStates {
  open = 1,
  inEdit = 2,
  completed = 3,
}

export const stateLabels = {
  [IMessageStates.open]: "Offen",
  [IMessageStates.inEdit]: "In Bearbeitung",
  [IMessageStates.completed]: "Abgeschlossen",
};

export class MessageEditVm {
  id: string | undefined;
  description: string | undefined;
  location: string | undefined;
  state: IMessageStates | undefined;
  reportTo: string | undefined;
  note: string | undefined;
  effect: string | undefined;
  sections: ISectionVM[] | undefined;
  createdAt: Date | undefined;
  createdBy: string | undefined;
  isActive: boolean | undefined;
  documents: IDocument[] | undefined;
  favoriteUserIds: string[] | undefined;
  createdByName: string | undefined;
  isFavorite: boolean | undefined;

  static emptyForNew(): MessageEditVm {
    let retval = new MessageEditVm();
    retval.state = IMessageStates.open;
    retval.sections = [];
    return retval;
  }

  static fromMessage(message: MessageEditVm) {
    let retval = new MessageEditVm();
    retval.id = message.id;
    retval.description = message.description;
    retval.location = message.location;
    retval.state = message.state;
    retval.reportTo = message.reportTo;
    retval.note = message.note;
    retval.effect = message.effect;
    retval.sections = message.sections;
    retval.createdAt = message.createdAt;
    retval.isActive = message.isActive;
    retval.createdBy = message.createdBy;
    retval.documents = message.documents;
    retval.favoriteUserIds = message.favoriteUserIds;
    retval.createdByName = message.createdByName;
    retval.isFavorite = message.isFavorite;
    return retval;
  }
}
