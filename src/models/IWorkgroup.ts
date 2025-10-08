export interface IWorkgroup {
  id: number;
  name: string;
  description: string;
}

export interface IWorkgroupQueryRequest {
  workgroupId: number;
}

export const emptyWorkgroup: IWorkgroup = {
  id: 0,
  name: "",
  description: "",
};

const workgroup1: IWorkgroup = {
  id: 1,
  name: "Ox1",
  description: "",
};
const workgroup2: IWorkgroup = {
  id: 2,
  name: "Ox2",
  description: "",
};
export const AllWorkgroups: IWorkgroup[] = [workgroup1, workgroup2];
