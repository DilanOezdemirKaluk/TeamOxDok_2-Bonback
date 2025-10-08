import editStyles from "../../../shared/components/FormComponents/FormComponents.module.css";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import { UserEditVm } from "../../../models/IUser";
import {
  FormButtonControls,
  FormCheckBoxField,
  FormInputField,
  FormMultiSelectField,
  LabelField,
} from "../../../shared/components/FormComponents/FormComponents";
import { useEffect, useState, useMemo, useCallback } from "react";
import { AllWorkgroups, IWorkgroup } from "../../../models/IWorkgroup";
import { UserTransferGroup } from "../../../shared/components/UserGroupTransfer/UserTransferGroup";
import { IUserGroupVm } from "../../../models/IUserGroup";

interface IUserEditProps {
  open: boolean;
  onClose: () => void;
  user?: UserEditVm;
  onSave: (obj: UserEditVm) => void;
  isCreate?: boolean;
  userGroups?: IUserGroupVm[];
}

export const UserEdit: React.FC<IUserEditProps> = ({
  open,
  onClose,
  user,
  onSave,
  isCreate = false,
  userGroups,
}) => {
  useEffect(() => {
    if (user) {
      setCurrentWorkgroups(user.workgroups);
      setCurrentUserGroup(user?.groups ?? []);
    } else {
      setCurrentWorkgroups([]);
      setCurrentUserGroup([]);
    }
  }, [user, open]);

  let initialValues = UserEditVm.emptyForNew();

  if (user) {
    initialValues = UserEditVm.fromUser(user);
  }

  const [currentWorkgroups, setCurrentWorkgroups] = useState(
    user ? user.workgroups : []
  );

  const [currentUserGroup, setCurrentUserGroup] = useState<IUserGroupVm[]>(
    userGroups ?? []
  );
  const [filteredUserGroupData, setFilteredUserGroupData] = useState<
    IUserGroupVm[]
  >(userGroups ?? []);

  useEffect(() => {
    if (userGroups) {
      setFilteredUserGroupData(
        userGroups.sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [userGroups]);

  const onUserGroupChange = useCallback(
    (ids: string[]) => {
      const selected = filteredUserGroupData.filter((userGroups) =>
        ids.some((id) => id === (userGroups.id ?? "").toString())
      );
      setCurrentUserGroup(selected);
    },
    [filteredUserGroupData]
  );

  const userTransferGroupComponent = useMemo(
    () => (
      <UserTransferGroup
        usergroups={filteredUserGroupData}
        selectedusergroups={currentUserGroup}
        onChange={onUserGroupChange}
      />
    ),
    [filteredUserGroupData, currentUserGroup, onUserGroupChange]
  );

  const handleSubmit = (
    obj: UserEditVm,
    actions: FormikHelpers<UserEditVm>
  ) => {
    obj.workgroups = currentWorkgroups;
    obj.groups = currentUserGroup;
    onSave(obj);
  };

  const ValidationSchema = Yup.object().shape({
    firstName: Yup.string().required("Bitte geben Sie einen Vornamen ein"),
    surname: Yup.string().required("Bitte geben Sie einen Nachnamen ein"),
    username: Yup.string()
      .matches(/^\d{8}$/, "Der Benutzername muss genau 8 Ziffern enthalten")
      .required("Bitte geben Sie einen Benutzernamen ein"),
    workgroups: Yup.array().min(
      1,
      "Mindestens eine Arbeitsgruppe muss ausgewählt werden."
    ),
  });

  const getWorkgroupOptions = () => {
    const result = AllWorkgroups.map((w) => {
      return {
        label: w.name,
        value: w.id.toString(),
      };
    });
    return result;
  };

  const getWorkgroupIds = () => {
    if (currentWorkgroups) {
      return currentWorkgroups.map((w) => w.id.toString());
    }
    return ["-1"];
  };

  const getTitle = () => {
    if (user !== undefined && isCreate == false) return "Benutzer bearbeiten";
    else return "Benutzer hinzufügen";
  };

  return (
    <>
      <DrawerModule
        title={getTitle()}
        open={open}
        onClose={onClose}
        width={500}
      >
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
              onClose();
            };

            return (
              <Form>
                <FormButtonControls onCancel={cancel} />
                <div className={editStyles.container}>
                  <div className={editStyles.containerItem}>
                    <FormInputField
                      title="Vorname eingeben"
                      value="firstName"
                      placeholder="Vorname"
                    />
                    {errors.firstName && touched.firstName && (
                      <div className={editStyles.errorMsg}>
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className={editStyles.containerItem}>
                    <FormInputField
                      title="Nachname eingeben"
                      value="surname"
                      placeholder="Nachname"
                    />
                    {errors.surname && touched.surname && (
                      <div className={editStyles.errorMsg}>
                        {errors.surname}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}></div>
                <FormInputField
                  title="8-ID eingeben"
                  value="username"
                  placeholder="8-ID zwingend erforderlich"
                />
                {errors.username && touched.username && (
                  <div className={editStyles.errorMsg}>{errors.username}</div>
                )}
                <div style={{ marginBottom: "20px" }}></div>
                <FormCheckBoxField
                  title="Aktiv"
                  value="isActive"
                  disabled={user === undefined}
                />
                <div style={{ marginBottom: "20px" }}></div>
                <LabelField title="Arbeitsgruppen" />
                <FormMultiSelectField
                  title=""
                  options={getWorkgroupOptions()}
                  checkedValues={getWorkgroupIds()}
                  onChange={(selectedValues) => {
                    const selectedWorkgroups: IWorkgroup[] = [];
                    selectedValues.forEach((selectedId) => {
                      const workGroup = AllWorkgroups.find(
                        (w) => w.id.toString() === selectedId
                      );
                      if (workGroup) {
                        selectedWorkgroups.push(workGroup);
                      }
                    });
                    setCurrentWorkgroups(selectedWorkgroups);
                    setFieldValue("workgroups", selectedWorkgroups);
                  }}
                />
                {errors.workgroups && touched.workgroups && (
                  <div className={editStyles.errorMsg}>
                    Bitte wählen Sie mindestens eine Arbeitsgruppe aus
                  </div>
                )}
                <div style={{ marginBottom: "20px" }}></div>
                <LabelField title="Gruppen" />
                {userTransferGroupComponent}
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
