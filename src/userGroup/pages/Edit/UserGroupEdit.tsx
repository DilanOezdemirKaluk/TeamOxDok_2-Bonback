import { Form, Formik, FormikHelpers } from "formik";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  FormButtonControls,
  FormInputField,
  LabelField,
} from "../../../shared/components/FormComponents/FormComponents";
import { UserGroupEditVm } from "../../../models/IUserGroup";
import userGroupService from "../../../shared/api/services/userGroupService";
import { IUserVm } from "../../../models/IUser";
import { UserTransfer } from "../../../shared/components/UserTransfer/UserTransfer";
import { ISectionVM } from "../../../models/ISection";
import { SectionTransfer } from "../../../shared/components/SectionTransfer/SectionTransfer";
import styles from "./UserGroupEdit.module.css";
import { AuthorizationSelect } from "../../../shared/components/AuthorizationSelect/AuthorizationSelect";
import * as Yup from "yup";
import editStyles from "../../../shared/components/FormComponents/FormComponents.module.css";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { UserEdit } from "../../../user/pages/Edit/UserEdit";
import { UserEditVm } from "../../../models/IUser";
import userService from "../../../shared/api/services/userService";
import { AllWorkgroups } from "../../../models/IWorkgroup";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";

interface IUserGroupEditProps {
  open: boolean;
  onClose: () => void;
  userGroup?: UserGroupEditVm;
  onSave: (obj: UserGroupEditVm) => void;
  users: IUserVm[];
  sections: ISectionVM[];
  onReloadUsers: () => void;
}

export const UserGroupEdit: React.FC<IUserGroupEditProps> = ({
  open,
  onClose,
  userGroup,
  onSave,
  users,
  sections,
  onReloadUsers,
}) => {
  const [editUserGroup, setEditUserGroup] = useState<
    UserGroupEditVm | undefined
  >();
  const [currentUser, setCurrentUser] = useState<IUserVm[]>(
    userGroup?.users ?? []
  );
  const [currentSections, setCurrentSections] = useState<ISectionVM[]>(
    userGroup?.sections ?? []
  );
  const [currentAuthorization, setCurrentAuthorization] = useState(
    userGroup?.authorizations ?? []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserField, setAddUserField] = useState(false);
  const [editUser, setEditUser] = useState<UserEditVm | undefined>();
  const [userData, setUserData] = useState<IUserVm[]>(users);
  const [filteredUserData, setFilteredUserData] = useState<IUserVm[]>(users);
  const [triggerRender, setTriggerRender] = useState<boolean>(false);
  const currentWorkgroupId = useCurrentWorkgroupId();

  useEffect(() => {
    const fetchData = async () => {
      if (userGroup && userGroup.id) {
        const result = await userGroupService.getForEdit(userGroup.id);
        setEditUserGroup(result);
        setCurrentUser(result.users ?? []);
        setCurrentSections(result.sections ?? []);
        setCurrentAuthorization(result.authorizations ?? []);
      } else {
        setEditUserGroup(undefined);
        setCurrentUser([]);
        setCurrentSections([]);
        setCurrentAuthorization([]);
      }
    };
    fetchData();
  }, [userGroup]);

  let initialValues = UserGroupEditVm.emptyForNew();

  if (editUserGroup) {
    initialValues = UserGroupEditVm.fromUserGroup(editUserGroup);
  }

  const handleSubmit = (
    obj: UserGroupEditVm,
    actions: FormikHelpers<UserGroupEditVm>
  ) => {
    obj.users = currentUser;
    obj.sections = currentSections;
    obj.authorizations = currentAuthorization;
    onSave(obj);
    actions.resetForm();
  };

  const close = () => {
    onClose();
  };

  const onUserChange = useCallback(
    (ids: string[]) => {
      const selected = userData.filter((user) =>
        ids.some((id) => id === (user.id ?? "").toString())
      );
      setCurrentUser(selected);
    },
    [userData]
  );

  const onSectionChange = useCallback(
    (ids: string[]) => {
      const selected = sections.filter((section) =>
        ids.some((id) => id === (section.id ?? "").toString())
      );
      setCurrentSections(selected);
    },
    [sections]
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [users, searchTerm]);

  useEffect(() => {
    setFilteredUserData(filteredUsers);
  }, [filteredUsers, triggerRender]);

  const userTransferComponent = useMemo(
    () => (
      <UserTransfer
        users={filteredUserData}
        selectedUsers={currentUser}
        onChange={onUserChange}
      />
    ),
    [filteredUserData, currentUser, onUserChange]
  );

  const sectionTransferComponent = useMemo(
    () => (
      <SectionTransfer
        sections={sections}
        selectedSections={currentSections}
        onChange={onSectionChange}
      />
    ),
    [sections, currentSections, onSectionChange]
  );

  const authorizationTransferComponent = useMemo(
    () => (
      <AuthorizationSelect
        selectedAuthorization={currentAuthorization}
        onChange={setCurrentAuthorization}
      />
    ),
    [currentAuthorization, setCurrentAuthorization]
  );

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
  });

  const getTitle = () => {
    if (editUserGroup != undefined) return "Benutzergruppe bearbeiten";
    else return "Benutzergruppe hinzufügen";
  };

  const addUser = () => {
    const newUser = UserEditVm.emptyForNew();
    const currentWorkgroup = AllWorkgroups.find(
      (w) => w.id === currentWorkgroupId
    );
    if (currentWorkgroup) {
      newUser.workgroups = [currentWorkgroup];
    }
    setEditUser(newUser);
    setAddUserField(true);
  };

  useEffect(() => {
    if (!addUserField) {
      setFilteredUserData(filteredUsers);
    }
  }, [addUserField, filteredUsers]);

  const onUserSave = async (obj: UserEditVm) => {
    var result = await userService.create(obj);
    if (!result.success) {
      return;
    }
    const newUser: IUserVm = result.user;
    setUserData((prevUsers) => [...(prevUsers ?? []), newUser]);
    setCurrentUser((prevUsers) => [...(prevUsers ?? []), newUser]);
    setTriggerRender(!triggerRender);
    setAddUserField(false);
    setEditUser(undefined);
    onReloadUsers();
  };

  return (
    <>
      <DrawerModule title={getTitle()} open={open} onClose={close} width={700}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={ValidationSchema}
        >
          {(formik) => {
            let { errors, touched, setFieldValue } = formik;
            let { resetForm } = formik;
            let cancel = () => {
              resetForm();
              close();
            };

            return (
              <Form>
                <div className={styles.content}>
                  <FormButtonControls onCancel={cancel} />
                  <FormInputField
                    title="Name eingeben"
                    value="name"
                    placeholder="Name"
                  />
                  {errors.name && touched.name && (
                    <div className={editStyles.errorMsg}>{errors.name}</div>
                  )}
                  <div style={{ marginBottom: "20px" }}></div>
                  <FormInputField
                    title="Beschreibung eingeben"
                    value="description"
                    placeholder="Beschreibung"
                  />
                  <div style={{ marginBottom: "20px" }}></div>
                  <LabelField title="Mitglieder" />
                  <div className={styles.usercontent}>
                    <input
                      type="text"
                      placeholder="Mitglieder suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                    <ActionButton
                      className={styles.adduser}
                      onClick={addUser}
                      title="Neuen Benutzer hinzufügen "
                    />
                  </div>
                  {userTransferComponent}
                  <div style={{ marginBottom: "20px" }}></div>
                  <LabelField title="Bereiche" />
                  {sectionTransferComponent}
                  <div style={{ marginBottom: "20px" }}></div>
                  <LabelField title="Berechtigungen" />
                  {authorizationTransferComponent}
                </div>
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
      {addUserField && (
        <UserEdit
          open={open}
          onClose={() => {
            setAddUserField(false);
            setEditUser(undefined);
          }}
          user={editUser}
          onSave={onUserSave}
          isCreate={addUserField}
          userGroups={[]}
        />
      )}
    </>
  );
};
