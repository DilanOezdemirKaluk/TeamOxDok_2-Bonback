import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import React, { useEffect, useState } from "react";
import {
  FormCheckBoxField,
  FormInputField,
  FormMultiSelectField,
  FormSelectField,
} from "../../../shared/components/FormComponents/FormComponents";
import { ISectionVM } from "../../../models/ISection";
import styles from "./MessageList.module.css";
import { formatDateWithTime } from "../../../shared/globals/global";
import {
  IMessageStates,
  MessageEditVm,
  stateLabels,
} from "../../../models/IMessage";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";
import { UploadButton } from "../../../shared/components/UploadButton/UploadButton";
import { IDocument, IDocumentUploadMode } from "../../../models/IDocument";
import documentService from "../../../shared/api/services/documentService";
import {
  useCurrentUserId,
  useCurrentUserName,
} from "../../../shared/api/services/loader/currentUserLoader";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import TextArea from "antd/es/input/TextArea";
import { FavoriteHook } from "../../../shared/components/FavoriteHook/FavoiteHook";
import TextEditor from "../../../shared/components/TextEditor/textEditor";
import Toolbar from "../../../shared/components/TextEditor/toolbar";
import { EditorProvider } from "../../../shared/components/TextEditor/editorContext";

interface IMessageListEditProps {
  open: boolean;
  onClose: () => void;
  message?: MessageEditVm;
  onSave: (obj: MessageEditVm) => void;
  sections: ISectionVM[];
}

export const MessageListEdit: React.FC<IMessageListEditProps> = ({
  open,
  onClose,
  message,
  onSave,
  sections,
}) => {
  const currentUsername = useCurrentUserName();
  const currentUserId = useCurrentUserId();
  const [documents, setDocuments] = useState(message ? message.documents : []);
  const [currentSections, setCurrentSections] = useState(
    message ? message.sections : []
  );
  let initialValues = MessageEditVm.emptyForNew();
  if (message) {
    initialValues = MessageEditVm.fromMessage(message);
  } else {
    initialValues.isActive = true;
    initialValues.createdByName = currentUsername;
    initialValues.sections = undefined;
  }

  const handleSubmit = (
    obj: MessageEditVm,
    actions: FormikHelpers<MessageEditVm>
  ) => {
    obj.documents = documents;
    onSave(obj);
    actions.resetForm();
  };

  const ValidationSchema = Yup.object().shape({
    description: Yup.string().required("Bitte ausfüllen"),
    state: Yup.string().required("Bitte ausfüllen"),
    sections: Yup.array()
      .default([])
      .min(1, "Mindestens eine Sektion muss ausgewählt werden."),
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
    setCurrentSections([]);
    setDocuments([]);
  }, [open]);

  const onRemoveDocument = async (id: string) => {
    if (documents) {
      const newDocuments = documents.filter(
        (d) => d.id.toLowerCase() !== id.toLowerCase()
      );
      setDocuments(newDocuments);
      await documentService.deleteDocument(
        id,
        IDocumentUploadMode.messages.toString()
      );
    }
  };

  const getSectonIds = () => {
    if (currentSections) {
      return currentSections.map((section) => section.id.toString());
    }
    return ["-1"];
  };

  const getTitle = () => {
    if (message !== undefined) return "Mitteilung bearbeiten";
    else return "Mitteilung hinzufügen";
  };

  return (
    <EditorProvider>
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
                  <div className={styles.controlContainer}>
                    <div className={styles.controlItem}>
                      <ActionButton
                        className={styles.controlButton}
                        onClick={() => cancel()}
                        title="Abbrechen"
                        buttonType="default"
                      />
                    </div>
                    <div className={styles.controlItem}>
                      <ActionButton
                        htmlType="submit"
                        className={styles.controlButton}
                        title="Speichern"
                      />
                    </div>
                    <FavoriteHook
                      message={message}
                      title="Favorit"
                      onFavoriteChange={onClose}
                    />
                  </div>

                  <div className={styles.divider}></div>
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
                          value={formik.values.state?.toString() ?? "1"}
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
                        <FormCheckBoxField title="" value="isActive" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.markedHeader}>Bereich</div>
                    <div>
                      <FormMultiSelectField
                        title=""
                        options={getOptions()}
                        checkedValues={getSectonIds()}
                        onChange={(selectedValues) => {
                          const selectedSections: ISectionVM[] = [];
                          selectedValues.forEach((v) => {
                            const section = sections.find(
                              (s) => s.id.toString() === v
                            );
                            if (section) {
                              selectedSections.push(section);
                            }
                          });
                          setCurrentSections(selectedSections);
                          setFieldValue("sections", selectedSections);
                        }}
                      />
                      {errors.sections && touched.sections ? (
                        <div
                          className="error"
                          style={{ color: "red", marginTop: "5px" }}
                        >
                          Bitte wählen Sie einen Bereich aus
                        </div>
                      ) : null}
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
                    <Toolbar />
                    <div className={styles.markedHeader}>Titel</div>
                    <div>
                      <TextEditor
                        value={formik.values.description ?? ""}
                        onChange={(newValue) =>
                          formik.setFieldValue("description", newValue)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.markedHeader}>Text</div>
                    <div>
                      <TextEditor
                        value={formik.values.note ?? ""}
                        onChange={(newValue) =>
                          formik.setFieldValue("note", newValue)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.singleContainer}>
                    <div className={styles.header}>Auswirkungen</div>
                    <div>
                      <TextEditor
                        value={formik.values.effect ?? ""}
                        onChange={(newValue) =>
                          formik.setFieldValue("effect", newValue)
                        }
                      />
                    </div>
                  </div>
                  {documents && (
                    <DocumentList
                      documents={documents}
                      onRemove={onRemoveDocument}
                    />
                  )}
                  <UploadButton
                    mode={IDocumentUploadMode.messages}
                    onUploadSuccess={onUpload}
                    id={message?.id ?? "0"}
                  />
                </Form>
              </div>
            );
          }}
        </Formik>
      </DrawerModule>
    </EditorProvider>
  );
};
