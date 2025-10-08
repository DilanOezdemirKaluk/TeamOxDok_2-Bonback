import { Form, Formik, FormikHelpers } from "formik";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import React, { useEffect, useState } from "react";
import {
  FormButtonControls,
  FormInputField,
  LabelField,
} from "../../../shared/components/FormComponents/FormComponents";
import {
  IMailingListMemberVm,
  MailingListEditVm,
} from "../../../models/IMailingList";
import { InputField } from "../../../shared/components/InputField/InputField";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { DocumentCategoryTransfer } from "../../../shared/components/DocumentCategoryTransfer/DocumentCategoryTransfer";
import { IDocumentCategoryVM } from "../../../models/IDocumentCategory";
import { DeleteOutlined } from "@ant-design/icons";
import * as Yup from "yup";
import editStyles from "../../../shared/components/FormComponents/FormComponents.module.css";

import styles from "./MailingListEdit.module.css";

interface MailingListEditProps {
  open: boolean;
  onClose: () => void;
  mailingList?: MailingListEditVm;
  onSave: (obj: MailingListEditVm) => void;
  documentCategories: IDocumentCategoryVM[];
}

export const MailingListEdit: React.FC<MailingListEditProps> = ({
  open,
  onClose,
  mailingList,
  onSave,
  documentCategories,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [currentEmails, setCurrentEmails] = useState(
    mailingList ? mailingList.mailingListMembers : []
  );
  const [selectedDocumentCategories, setSelectedDocumentCategories] = useState(
    mailingList ? mailingList.documentCategories : []
  );

  let initialValues = MailingListEditVm.emptyForNew();

  if (mailingList) {
    initialValues = MailingListEditVm.fromMailingList(mailingList);
  }

  const ValidationSchema = Yup.object().shape({
    name: Yup.string().required("Bitte geben Sie einen Namen ein"),
  });

  useEffect(() => {
    if (mailingList) {
      setCurrentEmails(mailingList.mailingListMembers);
      setSelectedDocumentCategories(mailingList.documentCategories);
    } else {
      setCurrentEmails([]);
      setSelectedDocumentCategories([]);
    }
  }, [mailingList]);

  const handleSubmit = (
    obj: MailingListEditVm,
    actions: FormikHelpers<MailingListEditVm>
  ) => {
    obj.documentCategories = selectedDocumentCategories;
    onSave(obj);
    actions.resetForm();
  };

  const onDocumentCategoryChange = (ids: string[]) => {
    const selected = documentCategories.filter((dc) =>
      ids.some((id) => id === (dc.id ?? "").toString())
    );
    if (selected) {
      setSelectedDocumentCategories(selected);
    }
  };

  const close = () => {
    onClose();
    setSelectedDocumentCategories(undefined);
    setCurrentEmails(undefined);
    setNewEmail("");
    onClose();
  };

  const getTitle = () => {
    if (mailingList !== undefined) return "Verteilerliste bearbeiten";
    else return "Verteilerliste hinzufügen";
  };

  return (
    <>
      <DrawerModule title={getTitle()} open={open} onClose={close} width={500}>
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
                <LabelField title="Mitglieder eingeben" />
                {currentEmails?.map((m, index) => (
                  <div>
                    <InputField
                      placeholder="EMail"
                      className={styles.inputEMail}
                      value={m.eMail}
                      onChange={(value) => {
                        if (currentEmails) {
                          const updatedMembers = [...currentEmails];
                          updatedMembers[index].eMail = value;
                          setCurrentEmails(updatedMembers);
                          setFieldValue("mailingListMembers", updatedMembers);
                        }
                      }}
                      key={m.id}
                    />
                    <DeleteOutlined
                      className={styles.deleteButton}
                      onClick={() => {
                        const updatedMembers = [
                          ...currentEmails.filter((ml) => ml.eMail !== m.eMail),
                        ];
                        setCurrentEmails(updatedMembers);
                        setFieldValue("mailingListMembers", updatedMembers);
                      }}
                    />
                  </div>
                ))}
                <InputField
                  placeholder="EMail"
                  value={newEmail}
                  onChange={setNewEmail}
                  className={styles.inputEMail}
                  clearable
                  key={"newEmail"}
                />
                <ActionButton
                  onClick={() => {
                    if (newEmail.length > 0) {
                      const emailExists = currentEmails?.some(
                        (member) =>
                          member.eMail.toLowerCase() === newEmail.toLowerCase()
                      );
                      if (!emailExists) {
                        let updatedMembers: IMailingListMemberVm[] = [];
                        if (currentEmails) {
                          updatedMembers = [...currentEmails];
                        }
                        let newId = -1;
                        const existingIds = updatedMembers.map(
                          (member) => member.id
                        );
                        while (existingIds.includes(newId.toString())) {
                          newId -= 1;
                        }
                        updatedMembers.push({
                          id: newId.toString(),
                          eMail: newEmail,
                        });
                        setCurrentEmails(updatedMembers);
                        setFieldValue("mailingListMembers", updatedMembers);
                        setNewEmail("");
                      }
                    }
                  }}
                  title="Hinzufügen"
                />
                <div style={{ marginBottom: "20px" }}></div>
                <DocumentCategoryTransfer
                  documentCategories={documentCategories}
                  selectedDocumentCategories={selectedDocumentCategories}
                  onChange={onDocumentCategoryChange}
                />
              </Form>
            );
          }}
        </Formik>
      </DrawerModule>
    </>
  );
};
