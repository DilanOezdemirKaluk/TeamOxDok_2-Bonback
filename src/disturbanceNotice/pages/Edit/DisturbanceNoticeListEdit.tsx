import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import React, { useEffect, useState } from "react";
import {
  FormButtonControls,
  FormCheckBoxField,
  FormInputField,
  FormSelectField,
} from "../../../shared/components/FormComponents/FormComponents";
import { DisturbanceNoticeEditVm } from "../../../models/IDisturbanceNotice";
import { ISectionVM } from "../../../models/ISection";
import styles from "./DisturbanceNoticeListEdit.module.css";
import { formatDateWithTime } from "../../../shared/globals/global";
import { IMessageStates, stateLabels } from "../../../models/IMessage";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";
import { UploadButton } from "../../../shared/components/UploadButton/UploadButton";
import { IDocument, IDocumentUploadMode } from "../../../models/IDocument";
import documentService from "../../../shared/api/services/documentService";
import { useCurrentUserName } from "../../../shared/api/services/loader/currentUserLoader";
import editStyles from "../../../shared/components/FormComponents/FormComponents.module.css";

interface DisturbanceNoticeListEditProps {
  open: boolean;
  onClose: () => void;
  disturbanceNotice?: DisturbanceNoticeEditVm;
  onSave: (obj: DisturbanceNoticeEditVm) => void;
  sections: ISectionVM[];
}

export const DisturbanceNoticeListEdit: React.FC<
  DisturbanceNoticeListEditProps
> = ({ open, onClose, disturbanceNotice, onSave, sections }) => {
  const currentUsername = useCurrentUserName();

  const [documents, setDocuments] = useState(
    disturbanceNotice ? disturbanceNotice.documents : []
  );

  let initialValues = DisturbanceNoticeEditVm.emptyForNew();
  if (disturbanceNotice) {
    initialValues =
      DisturbanceNoticeEditVm.fromDisturbanceNotice(disturbanceNotice);
  } else {
    initialValues.isActive = true;
    initialValues.createdByName = currentUsername;
    initialValues.section = undefined;
  }

  const handleSubmit = (
    obj: DisturbanceNoticeEditVm,
    actions: FormikHelpers<DisturbanceNoticeEditVm>
  ) => {
    obj.documents = documents;
    onSave(obj);
    actions.resetForm();
  };

  const ValidationSchema = Yup.object().shape({
    description: Yup.string().required("Bitte ausfüllen"),
    state: Yup.string().required("Bitte ausfüllen"),
    section: Yup.object()
      .nullable()
      .shape({
        id: Yup.string().required("Eine Sektion muss ausgewählt werden."),
      }),
  });
  const getOptions = () => {
    const result = sections.map((s) => {
      return {
        label: s.name,
        value: s.id.toString(),
      };
    });
    return result;
  };

  const getStates = () => {
    const result = Object.entries(IMessageStates)
      .filter(([key, value]) => typeof value === "number")
      .map(([key, value]) => {
        return {
          label: stateLabels[value as IMessageStates],
          value: value.toString(),
        };
      });
    return result;
  };

  const onUpload = (document: IDocument) => {
    if (documents) {
      const newDocuments = [...documents];
      newDocuments.push(document);
      setDocuments(newDocuments);
    }
  };

  useEffect(() => {
    if (disturbanceNotice) {
      setDocuments(disturbanceNotice.documents);
    } else {
      setDocuments([]);
    }
  }, [disturbanceNotice]);

  const onRemoveDocument = async (id: string) => {
    if (documents) {
      const newDocuments = documents.filter(
        (d) => d.id.toLowerCase() !== id.toLowerCase()
      );
      setDocuments(newDocuments);
      await documentService.deleteDocument(
        id,
        IDocumentUploadMode.disturbanceNotices.toString()
      );
    }
  };

  const getTitle = () => {
    if (disturbanceNotice !== undefined) return "Störmitteilung bearbeiten";
    else return "Störmitteilung hinzufügen";
  };

  return (
    <>
      <DrawerModule
        title={getTitle()}
        open={open}
        onClose={onClose}
        width={800}
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
              <div className={styles.content}>
                <Form>
                  <FormButtonControls onCancel={cancel} />
                  <div className={styles.headGridContainer}>
                    <div>
                      <div className={styles.markedHeader}>Autor</div>
                      <div className={styles.item}>
                        {formik.values.createdByName}
                      </div>
                    </div>
                    <div>
                      <div className={styles.header}>Ort</div>
                      <div className={styles.item}>
                        <FormInputField title="" value="location" />
                      </div>
                    </div>
                    <div>
                      <div className={styles.header}>Status</div>
                      <div className={styles.item}>
                        <FormSelectField
                          title=""
                          value={formik.values.state?.toString() ?? ""}
                          options={getStates()}
                          onChange={(selectedValue) => {
                            setFieldValue("state", selectedValue);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className={styles.header}>Aktiv</div>
                      <div className={styles.item}>
                        <FormCheckBoxField title="" value="isActive" disabled />
                      </div>
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.markedHeader}>Bereich</div>
                    <div>
                      <FormSelectField
                        title=""
                        value={formik.values.section?.id?.toString() ?? ""}
                        options={getOptions()}
                        onChange={(selectedValue) => {
                          const section = sections.find(
                            (g) => g.id.toString() === selectedValue
                          );
                          if (section) {
                            setFieldValue("section", section);
                          }
                        }}
                      />
                      {errors.section && touched.section && (
                        <div className={editStyles.errorMsg}>
                          Bitte wählen Sie einen Bereich aus
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.infoContainer}>
                    <div>
                      <div className={styles.header}>Erstelldatum</div>
                      <div className={styles.item}>
                        {formatDateWithTime(
                          formik.values.createdAt ?? new Date()
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={styles.header}>Wem wurde es gemeldet</div>
                      <div className={styles.item}>
                        <FormInputField title="" value="reportTo" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.markedHeader}>Titel</div>
                    <div>
                      <FormInputField title="" value="description" />
                      {errors.description && touched.description && (
                        <div className={editStyles.errorMsg}>
                          {errors.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.markedHeader}>Text</div>
                    <div>
                      <FormInputField title="" value="note" />
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.header}>Auswirkungen</div>
                    <div>
                      <FormInputField title="" value="effect" />
                    </div>
                  </div>
                  {documents && (
                    <>
                      <DocumentList
                        documents={documents}
                        onRemove={onRemoveDocument}
                      />
                    </>
                  )}
                  <UploadButton
                    mode={IDocumentUploadMode.disturbanceNotices}
                    onUploadSuccess={onUpload}
                    id={disturbanceNotice?.id ?? "0"}
                  />
                </Form>
              </div>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
