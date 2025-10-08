export interface IConstantGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  changedBy: string;
  changedAt: Date;
  workgroupId: number;
  constants: IConstantVM[];
}

export interface IConstantGroupVM {
  id: string;
  name: string;
  description: string;
  workgroupId: number;
  constants: IConstantVM[];
}

export class ConstantGroupEditVM {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  workgroupId: number | undefined;
  constants: IConstantVM[] | undefined;

  static emptyForNew(): ConstantGroupEditVM {
    let retval = new ConstantGroupEditVM();
    return retval;
  }

  static fromConstantGroup(constantGroup: ConstantGroupEditVM) {
    let retval = new ConstantGroupEditVM();
    retval.id = constantGroup.id;
    retval.name = constantGroup.name;
    retval.description = constantGroup.description;
    retval.workgroupId = constantGroup.workgroupId;
    retval.constants = constantGroup.constants;
    return retval;
  }
}

export interface IConstantGroupQueryResponse {
  constantGroup: IConstantGroup[];
}

export interface IConstant {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  changedBy: string;
  changedAt: Date;
  group: IConstantGroup;
  workgroupId: number;
  sortIndex: number;
}

export interface IConstantVM {
  id: string;
  name: string;
  description: string;
  group: IConstantGroup;
  workgroupId: number;
  sortIndex: number;
}

export class ConstantEditVm {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  group: IConstantGroup | undefined;
  workgroupId: number | undefined;
  sortIndex: number | undefined;

  static emptyForNew(): ConstantEditVm {
    let retval = new ConstantEditVm();
    return retval;
  }

  static fromConstant(constant: ConstantEditVm) {
    let retval = new ConstantEditVm();
    retval.id = constant.id;
    retval.name = constant.name;
    retval.description = constant.description;
    retval.group = constant.group;
    retval.sortIndex = constant.sortIndex;
    return retval;
  }
}

export interface IConstantQueryRequest {
  groupId: number;
  workgroupId: number;
}
export interface IConstantQueryResponse {
  constant: IConstant[];
}
