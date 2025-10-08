import editStyles from "../../shared/components/FormComponents/FormComponents.module.css";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DrawerModule } from "../../shared/components/DrawerModule/DrawerModule";
import {
  ConstantEditVm,
  ConstantGroupEditVM,
  IConstantGroup,
  IConstantVM,
} from "../../models/IConstant";
import React, { useEffect, useState } from "react";
import {
  FormButtonControls,
  FormInputField,
} from "../../shared/components/FormComponents/FormComponents";
import { ActionButton } from "../../shared/components/ActionButton/ActionButton";
import styles from "./ConstantList.module.css";
import { AuthorizationType } from "../../models/IAuthorization";
import useAuthorizationCheck from "../../shared/Authorization/Authorization";
import { ConstantList } from "./ConstantList";
import { ConstantEdit } from "./ConstantListEdit";
import { generateUniqueId } from "../../shared/globals/global";

interface ConstantGroupEditProps {
  open: boolean;
  onClose: () => void;
  constantGroup?: ConstantGroupEditVM;
  onSave: (obj: ConstantGroupEditVM) => void;
}

export const ConstantGroupListEdit: React.FC<ConstantGroupEditProps> = ({
  open,
  onClose,
  constantGroup,
  onSave,
}) => {
  const [currentConstants, setCurrentConstants] = useState<IConstantVM[]>([]);
  const [constantOpen, setConstantOpen] = useState(false);
  const [editConstant, setEditConstant] = useState<IConstantVM>();
  const [initialValues, setInitialValues] = useState<ConstantGroupEditVM>();

  useEffect(() => {
    if (constantGroup && constantGroup.constants) {
      const data = constantGroup.constants.sort(
        (a, b) => a.sortIndex - b.sortIndex
      );
      setCurrentConstants(data);
    }
    if (constantGroup) {
      setInitialValues(constantGroup);
    } else {
      setInitialValues(ConstantGroupEditVM.emptyForNew());
      setCurrentConstants([]);
    }
  }, [constantGroup]);

  const hasCreateAuth = useAuthorizationCheck(AuthorizationType.CreateConstant);

  const getTitle = () => {
    if (constantGroup !== undefined) return "Konstanten Gruppe bearbeiten";
    else return "Konstanten Gruppe hinzufügen";
  };

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
  });

  const handleSubmit = (
    obj: ConstantGroupEditVM,
    actions: FormikHelpers<ConstantGroupEditVM>
  ) => {
    obj.constants = currentConstants;
    onSave(obj);
    actions.resetForm();
  };

  const addConstant = () => {
    setConstantOpen(true);
  };

  const onConstantSort = (fromIndex: number, toIndex: number) => {
    const updatedConstants = [...currentConstants];
    const [movedItem] = updatedConstants.splice(fromIndex, 1);
    updatedConstants.splice(toIndex, 0, movedItem);
    updatedConstants.forEach((item, index) => {
      item.sortIndex = index + 1;
    });
    setCurrentConstants(updatedConstants);
  };

  const onConstantEdit = (item: IConstantVM) => {
    setEditConstant(item);
    setConstantOpen(true);
  };

  const onConstantDelete = (id: string) => {
    const updatedConstants = currentConstants.filter((item) => item.id !== id);
    updatedConstants.forEach((item, index) => {
      item.sortIndex = index + 1;
    });
    setCurrentConstants(updatedConstants);
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
          initialValues={initialValues ?? ConstantGroupEditVM.emptyForNew()}
          onSubmit={handleSubmit}
          validationSchema={ValidationSchema}
        >
          {(formik) => {
            const { errors, touched, resetForm } = formik;
            const cancel = () => {
              resetForm();
              onClose();
            };

            return (
              <Form>
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
                {hasCreateAuth && (
                  <ActionButton
                    className={styles.add}
                    title="Konstante hinzufügen"
                    onClick={addConstant}
                  />
                )}
                <div className={styles.scrollablecontainer}>
                  <ConstantList
                    constants={currentConstants}
                    onSortEnd={onConstantSort}
                    onEdit={onConstantEdit}
                    onDelete={onConstantDelete}
                  />
                </div>
                <ConstantEdit
                  open={constantOpen}
                  constant={editConstant}
                  onClose={() => setConstantOpen(false)}
                  onSave={(obj: ConstantEditVm) => {
                    const constants = [...currentConstants];
                    if (!obj.id && constantGroup) {
                      const cGrp: IConstantGroup = {
                        id: constantGroup.id || "",
                        name: constantGroup.name || "",
                        description: constantGroup.description || "",
                        workgroupId: constantGroup.workgroupId || 0,
                        constants: [],
                        createdBy: "",
                        createdAt: new Date(),
                        changedBy: "",
                        changedAt: new Date(),
                      };

                      constants.push({
                        id: generateUniqueId().toString(),
                        name: obj.name || "",
                        description: obj.description || "",
                        group: cGrp,
                        workgroupId: 0,
                        sortIndex: constants.length + 1,
                      });
                    } else if (!constantGroup) {
                      constants.push({
                        id: generateUniqueId().toString(),
                        name: obj.name || "",
                        description: obj.description || "",
                        group: {
                          id: "0",
                          name: initialValues?.name || "",
                          description: initialValues?.description || "",
                          workgroupId: initialValues?.workgroupId || 0,
                          constants: [],
                          createdBy: "",
                          createdAt: new Date(),
                          changedBy: "",
                          changedAt: new Date(),
                        },
                        workgroupId: 0,
                        sortIndex: constants.length + 1,
                      });
                    } else {
                      const index = constants.findIndex(
                        (item) => item.id === obj.id
                      );
                      let constant = constants[index];
                      if (obj.name) {
                        constant.name = obj.name;
                      }
                      if (obj.description) {
                        constant.description = obj.description;
                      }
                      constants[index] = constant;
                    }
                    setCurrentConstants(constants);
                    setConstantOpen(false);
                    setEditConstant(undefined);
                  }}
                />
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
