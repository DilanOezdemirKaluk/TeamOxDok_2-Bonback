import React, { useEffect, useState } from "react";
import { ActionModal } from "../../../shared/components/ActionModal/ActionModal";
import { SectionSingleSelect } from "../../../shared/components/SectionSingleSelect/SectionSingleSelect";
import { Loading } from "../../../shared/components/Loading/Loading";
import { InputField } from "../../../shared/components/InputField/InputField";
import styles from "./TemplateCopy.module.css";
import { useSectionWithDocumentCategoriesLoader } from "../../../shared/api/services/loader/sectionWithDocumentCategoriesLoader";
import { DocumentCategorySelect } from "../../../shared/components/DocumentCategorySelect/DocumentCategorySelect";
import { IDocumentCategoryVM } from "../../../models/IDocumentCategory";
import shiftReportTemplateService from "../../../shared/api/services/shiftReportTemplateService";

interface ITemplateCopyProps {
  open: boolean;
  onCancel: () => void;
  title: string;
  templateId: number;
}

export const TemplateCopy: React.FC<ITemplateCopyProps> = ({
  open,
  onCancel,
  title,
  templateId,
}) => {
  const [currentSectionId, setCurrentSectionId] = useState(-1);
  const [documentCategoryId, setDocumentCategoryId] = useState(0);
  const [templateName, setTemplateName] = useState("");
  const { sections, loadingSections, reloadSections } =
    useSectionWithDocumentCategoriesLoader();
  const [currentDocumentCategories, setCurrentDocumentCategories] = useState<
    IDocumentCategoryVM[]
  >([]);
  const [nameError, setNameError] = useState(false);
  const [documentCategoryError, setDocumentCategoryError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(loadingSections);
  }, [loadingSections]);

  const changeGroup = (value: string) => {
    setCurrentSectionId(parseInt(value));
    reloadSections();
  };

  const createTemplate = async () => {
    setDocumentCategoryError(false);
    setNameError(false);

    if (documentCategoryId > 0 && templateName.length > 0) {
      setLoading(true);
      const newId = await shiftReportTemplateService.copyTemplate(
        documentCategoryId,
        templateId,
        templateName
      );
      setCurrentSectionId(-1);
      setDocumentCategoryId(0);
      setTemplateName("");
      onCancel();
      setLoading(false);
    }
    if (documentCategoryId === 0) {
      setDocumentCategoryError(true);
    }
    if (templateName.length === 0) {
      setNameError(true);
    }
  };

  const setCurrentDocumentCategoryId = (id: string) => {
    const newId = parseInt(id);
    setDocumentCategoryId(newId);
  };

  const getDocumentCategoriesForCurrentSetion = () => {
    if (sections) {
      if (currentSectionId === -1) {
        return sections.flatMap((section) => section.documentCategories);
      }
      const section = sections.find((s) => s.id === currentSectionId);
      if (section) {
        return section.documentCategories;
      }
    }
  };

  useEffect(() => {
    const documentCategories = getDocumentCategoriesForCurrentSetion();
    if (documentCategories) {
      setCurrentDocumentCategories(documentCategories);
    }
  }, [currentSectionId]);

  useEffect(() => {
    if (documentCategoryId !== 0) {
      setDocumentCategoryError(false);
    }
  }, [documentCategoryId]);

  useEffect(() => {
    if (templateName.length > 0) {
      setNameError(false);
    }
  }, [templateName]);

  return (
    <ActionModal
      onCancel={onCancel}
      onOk={createTemplate}
      open={open}
      title={title}
    >
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className={styles.content}>
            <div style={{ fontWeight: "600", color: "rgba(0, 0, 0, 1)" }}>
              Bereich
            </div>
            {sections && (
              <SectionSingleSelect
                defaultValue={currentSectionId.toString()}
                onChange={changeGroup}
                sections={sections}
                key={currentSectionId}
              />
            )}
          </div>
          <div className={styles.content}>
            <div style={{ fontWeight: "600", color: "rgba(0, 0, 0, 1)" }}>
              Dokumentart
            </div>
            <DocumentCategorySelect
              documentCategories={currentDocumentCategories}
              onChange={setCurrentDocumentCategoryId}
              showAll={false}
              defaultValue={documentCategoryId.toString()}
            />
          </div>
          {documentCategoryError && (
            <div className={styles.errorMsg}>
              Bitte wählen Sie eine Dokumentenart aus
            </div>
          )}
          <div className={styles.content}>
            <div style={{ fontWeight: "600", color: "rgba(0, 0, 0, 1)" }}>
              Name eingeben
            </div>
            <InputField
              placeholder="Name"
              value={templateName}
              onChange={setTemplateName}
            />
          </div>
          {nameError && (
            <div className={styles.errorMsg}>
              Bitte geben Sie einen Namen ein
            </div>
          )}
        </div>
      )}
    </ActionModal>
  );
};
