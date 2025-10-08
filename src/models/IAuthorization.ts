export interface IAuthorizationVM {
  id: number;
  groupId: number;
  authorizationId: string;
  isGranted: boolean;
}

export enum AuthorizationType {
  FillShiftReport = 1,

  CreateTemplate = 4,
  ChangeTemplate = 5,
  ReleaseTemplate = 6,

  CreateSection = 7,
  ChangeSection = 8,
  DeleteSection = 9,

  CreateDocumentCategory = 10,
  ChangeDocumentCategory = 11,
  DeleteDocumentCategory = 12,

  CreateConstantGroup = 13,
  ChangeConstantGroup = 14,
  DeleteConstantGroup = 15,

  CreateConstant = 16,
  ChangeConstant = 17,
  DeleteConstant = 18,

  CreateUser = 19,
  ChangeUser = 20,
  DeleteUser = 21,

  CreateUserGroup = 22,
  ChangeUserGroup = 23,
  DeleteUserGroup = 24,

  CreateWorkgroup = 25,
  ChangeWorkgroup = 26,
  DeleteWorkgroup = 27,

  CreateMailinglist = 28,
  ChangeMailinglist = 29,
  DeleteMailinglist = 30,

  EditDeleteDisturbanceNotice = 31,

  EditDeleteMessage = 32,

  EditDeleteLog = 33,

  EditConfiguration = 40,
}

export const getAuthorizationTranslation = (
  authorizationType: AuthorizationType
): string => {
  const authorizationNames = {
    [AuthorizationType.FillShiftReport]: "Schichtbericht ausfüllen",
    [AuthorizationType.CreateTemplate]: "Vorlage erstellen",
    [AuthorizationType.ChangeTemplate]: "Vorlage ändern",
    [AuthorizationType.ReleaseTemplate]: "Vorlage freigeben",
    [AuthorizationType.CreateSection]: "Bereich erstellen",
    [AuthorizationType.ChangeSection]: "Bereich ändern",
    [AuthorizationType.DeleteSection]: "Bereich löschen",
    [AuthorizationType.CreateDocumentCategory]: "Dokumentenkategorie erstellen",
    [AuthorizationType.ChangeDocumentCategory]: "Dokumentenkategorie ändern",
    [AuthorizationType.DeleteDocumentCategory]: "Dokumentenkategorie löschen",
    [AuthorizationType.CreateConstantGroup]: "Konstantengruppe erstellen",
    [AuthorizationType.ChangeConstantGroup]: "Konstantengruppe ändern",
    [AuthorizationType.DeleteConstantGroup]: "Konstantengruppe löschen",
    [AuthorizationType.CreateConstant]: "Konstante erstellen",
    [AuthorizationType.ChangeConstant]: "Konstante ändern",
    [AuthorizationType.DeleteConstant]: "Konstante löschen",
    [AuthorizationType.CreateUser]: "Benutzer erstellen",
    [AuthorizationType.ChangeUser]: "Benutzer ändern",
    [AuthorizationType.DeleteUser]: "Benutzer löschen",
    [AuthorizationType.CreateUserGroup]: "Benutzergruppe erstellen",
    [AuthorizationType.ChangeUserGroup]: "Benutzergruppe ändern",
    [AuthorizationType.DeleteUserGroup]: "Benutzergruppe löschen",
    [AuthorizationType.CreateWorkgroup]: "Arbeitsgruppe erstellen",
    [AuthorizationType.ChangeWorkgroup]: "Arbeitsgruppe ändern",
    [AuthorizationType.DeleteWorkgroup]: "Arbeitsgruppe löschen",
    [AuthorizationType.CreateMailinglist]: "Verteilerlist erstellen",
    [AuthorizationType.ChangeMailinglist]: "Verteilerlist ändern",
    [AuthorizationType.DeleteMailinglist]: "Verteilerlist löschen",
    [AuthorizationType.EditDeleteDisturbanceNotice]:
      "Störungsmeldung bearbeiten/löschen",
    [AuthorizationType.EditDeleteMessage]: "Nachricht bearbeiten/löschen",
    [AuthorizationType.EditDeleteLog]: "Log bearbeiten/löschen",
    [AuthorizationType.EditConfiguration]: "Konfiguration / Gesperrte Rapporte bearbeiten",
  };

  return authorizationNames[authorizationType] || "Unbekannte Berechtigung";
};

export interface IUserAuthorizationVm {
  workgroupId: number;
  authorizations: IUserAuthorizationItemVm[];
}

export interface IUserAuthorizationItemVm {
  authorizationId: number;
  isGranted: boolean;
}

export class AuthorizationChecker {
  private user: any;

  constructor(user: any) {
    this.user = user;
  }

  hasAuthorization(
    workgroupId: number,
    authorizationType: AuthorizationType
  ): boolean {
    if (this.user.authorizations) {
      const authWorkgroup = this.user.authorizations.find(
        (o: { workgroupId: number }) => o.workgroupId === workgroupId
      );

      if (!authWorkgroup) {
        return false;
      }

      const hasAuthorization = authWorkgroup.authorizations.some(
        (auth: { authorizationId: AuthorizationType; isGranted: boolean }) =>
          auth.authorizationId === authorizationType && auth.isGranted
      );

      return hasAuthorization;
    }
    return false;
  }
}
