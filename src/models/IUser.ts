import { IUserAuthorizationVm } from "./IAuthorization";
import { IUserGroupVm } from "./IUserGroup";
import { IWorkgroup } from "./IWorkgroup";

export interface IUserVm {
  id: string;
  firstName: string;
  surname: string;
  username: string;
  isActive: boolean;
  displayName: string;
  defaultWorkgroupId: number;
  workgroups: IWorkgroup[];
  groups: IUserGroupVm[];
}

export class UserEditVm {
  id: string | undefined;
  firstName: string | undefined;
  surname: string | undefined;
  username: string | undefined;
  isActive: boolean | undefined;
  defaultWorkgroupId: number | undefined;
  displayName: string = "";
  workgroups: IWorkgroup[] = [];
  groups: IUserGroupVm[] = [];

  static emptyForNew(): UserEditVm {
    let retval = new UserEditVm();
    retval.isActive = true;
    return retval;
  }

  static fromUser(user: UserEditVm) {
    let retval = new UserEditVm();
    retval.id = user.id;
    retval.firstName = user.firstName;
    retval.surname = user.surname;
    retval.username = user.username;
    retval.isActive = user.isActive;
    retval.defaultWorkgroupId = user.defaultWorkgroupId;
    retval.displayName = user.displayName;
    retval.workgroups = user.workgroups;
    retval.groups = user.groups;
    return retval;
  }
}

export interface IUserLoginVm {
  id: string;
  firstName: string;
  surname: string;
  username: string;
  isActive: boolean;
  displayName: string;
  defaultWorkgroupId: number;
  workgroups: IWorkgroup[];
  authorizations: IUserAuthorizationVm[];
  groups: IUserGroupVm[];
}

export interface IUserLoginQueryRequest {
  Username: string;
  Password: string;
}

export interface IUserAutoLoginQueryRequest {
  stahlwerk: string;
  eightID: string;
  hash: string;
}

export interface IUserLoginQueryResult {
  user: IUserLoginVm | null;
  token: string | null;
  expiration: Date | null;
}

export interface IUserQueryResponse {
  user: IUserVm[];
}

export const createUser = (options: Partial<IUserVm> = {}): IUserVm => {
  return Object.assign(
    {
      id: "",
      firstName: "",
      surname: "",
      username: "",
      isActive: false,
      displayName: "",
      defaultWorkgroupId: 0,
      workgroups: [],
      groups: [],
    },
    options
  );
};

export interface UserCreationVM {
  id: number;
  success: boolean;
  message: string;
  user: IUserVm;
}
