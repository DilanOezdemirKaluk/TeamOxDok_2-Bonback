import { IAuthorizationVM } from "./IAuthorization";
import { ISectionVM } from "./ISection";
import { IUserVm } from "./IUser";

export interface IUserGroupVm {
  id: string;
  name: string;
  description: string;
  workgroupId: number;
  users: IUserVm[];
  sections: ISectionVM[];
  authorizations: IAuthorizationVM[];
}

export class UserGroupEditVm {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  workgroupId: number | undefined;
  users: IUserVm[] | undefined;
  sections: ISectionVM[] | undefined;
  authorizations: IAuthorizationVM[] | undefined;

  static emptyForNew(): UserGroupEditVm {
    let retval = new UserGroupEditVm();
    return retval;
  }

  static fromUserGroup(value: UserGroupEditVm) {
    let retval = new UserGroupEditVm();
    retval.id = value.id;
    retval.name = value.name;
    retval.description = value.description;
    retval.workgroupId = value.workgroupId;
    retval.users = value.users;
    retval.sections = value.sections;
    retval.authorizations = value.authorizations;
    return retval;
  }
}

export interface IUserGroupQueryResponse {
  usergroup: IUserGroupVm[];
}
