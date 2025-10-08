import { DrawerModule } from "../../shared/components/DrawerModule/DrawerModule";
import { Form, Formik, FormikHelpers } from "formik";
import React from "react";
import * as Yup from "yup";
import { DocumentCategoryEditVM } from "../../models/IDocumentCategory";
import {
  FormButtonControls,
  FormInputField,
  FormSelectField,
} from "../../shared/components/FormComponents/FormComponents";
import editStyles from "../../shared/components/FormComponents/FormComponents.module.css";
import { ISectionVM } from "../../models/ISection";
import { EditColorPicker } from "../../shared/components/EditColorPicker/EditColorPicker";

interface DocumentCategoryListEditProps {
  open: boolean;
  onClose: () => void;
  documentCategory?: DocumentCategoryEditVM;
  onSave: (obj: DocumentCategoryEditVM) => void;
  categorys: ISectionVM[];
}

export const DocumentCategoryListEdit: React.FC<
  DocumentCategoryListEditProps
> = ({ open, onClose, documentCategory, onSave, categorys }) => {
  let initialValues = DocumentCategoryEditVM.emptyForNew();
  if (documentCategory) {
    initialValues =
      DocumentCategoryEditVM.fromDocumentCategory(documentCategory);
  }

  const handleSubmit = (
    obj: DocumentCategoryEditVM,
    actions: FormikHelpers<DocumentCategoryEditVM>
  ) => {
    onSave(obj);
    actions.resetForm();
  };

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
    section: Yup.object()
      .nullable()
      .shape({
        id: Yup.string().required(""),
      }),
  });

  const getOptions = () => {
    const result = categorys.map((category) => {
      return {
        label: category.name,
        value: category.id.toString(),
      };
    });
    return result;
  };

  const getTitle = () => {
    if (documentCategory !== undefined) return "Dokumentenart bearbeiten";
    else return "Dokumentenart hinzufügen";
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
                <FormInputField title="Name eingeben" value="name" placeholder="Name"/>
                {errors.name && touched.name && (
                  <div className={editStyles.errorMsg}>{errors.name}</div>
                )}
                <div style={{ marginBottom: '20px' }}></div>
                <FormInputField title="Beschreibung eingeben" value="description" placeholder="Beschreibung"/>
                <div style={{ marginBottom: '20px' }}></div>
                <FormSelectField
                  title="Bereich"
                  placeholder="Bitte wählen sie einen Bereich aus"
                  value={formik.values.section?.id?.toString() ?? ""}
                  options={getOptions()}
                  onChange={(selectedValue) => {
                    const category = categorys.find(
                      (g) => g.id.toString() === selectedValue
                    );
                    if (category) {
                      setFieldValue("section", category);
                    }
                  }}
                />
                {errors.section && touched.section && (
                  <div className={editStyles.errorMsg}>
                    Bitte wählen Sie einen Bereich aus
                  </div>
                )}
                <EditColorPicker
                  onChange={(c) => setFieldValue("color", c)}
                  color={formik.values.color ?? "#c1bdbdE3"}
                />
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
