import React from "react";
import editStyles from "../../shared/components/FormComponents/FormComponents.module.css";
import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DrawerModule } from "../../shared/components/DrawerModule/DrawerModule";
import { SectionEditVM } from "../../models/ISection";
import {
  FormButtonControls,
  FormInputField,
} from "../../shared/components/FormComponents/FormComponents";

interface SectionListProps {
  open: boolean;
  onClose: () => void;
  selction?: SectionEditVM;
  onSave: (obj: SectionEditVM) => void;
}

export const SectionListEdit: React.FC<SectionListProps> = ({
  open,
  onClose,
  selction,
  onSave,
}) => {
  let initialValues = SectionEditVM.emptyForNew();
  if (selction) {
    initialValues = SectionEditVM.fromSection(selction);
  }

  const handleSubmit = (
    obj: SectionEditVM,
    actions: FormikHelpers<SectionEditVM>
  ) => {
    onSave(obj);
    actions.resetForm();
  };

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
  });

  const getTitle = () => {
    if (selction !== undefined) return "Bereich bearbeiten";
    else return "Bereich hinzufügen";
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
            let { errors, touched } = formik;
            let { resetForm } = formik;
            let cancel = () => {
              resetForm();
              onClose();
            };

            return (
              <Form>
                <FormButtonControls onCancel={cancel} />
                <FormInputField title="Name eingeben" value="name" placeholder="Name"/>
                {errors.name && touched.name && (
                  <div className={editStyles.errorMsg}>{errors.name}</div>
                )}
                <div style={{ marginBottom: '20px' }}></div>
                <FormInputField title="Beschreibung eingeben" value="description" placeholder="Beschreibung"/>
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
