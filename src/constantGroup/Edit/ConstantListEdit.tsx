import React, { useEffect, useState } from "react";
import { ConstantEditVm } from "../../models/IConstant";
import { Formik, FormikHelpers, Form } from "formik";
import { DrawerModule } from "../../shared/components/DrawerModule/DrawerModule";
import {
  FormButtonControls,
  FormInputField,
} from "../../shared/components/FormComponents/FormComponents";
import * as Yup from "yup";
import editStyles from "../../shared/components/FormComponents/FormComponents.module.css";

interface ConstantEditProps {
  open: boolean;
  onClose: () => void;
  constant?: ConstantEditVm;
  onSave: (obj: ConstantEditVm) => void;
}

export const ConstantEdit: React.FC<ConstantEditProps> = ({
  open,
  onClose,
  constant,
  onSave,
}) => {
  const [initialValues, setInitialValues] = useState<ConstantEditVm>();

  useEffect(() => {
    if (constant) {
      setInitialValues(constant);
    } else {
      setInitialValues(ConstantEditVm.emptyForNew());
    }
  }, [constant]);

  const getTitle = () => {
    if (constant !== undefined) return "Konstante bearbeiten";
    else return "Konstante hinzufügen";
  };

  const handleSubmit = (
    obj: ConstantEditVm,
    actions: FormikHelpers<ConstantEditVm>
  ) => {
    onSave(obj);
    actions.resetForm();
  };

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
  });

  return (
    <DrawerModule title={getTitle()} open={open} onClose={onClose} width={500}>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues ?? ConstantEditVm.emptyForNew()}
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
            </Form>
          );
        }}
      </Formik>
    </DrawerModule>
  );
};
