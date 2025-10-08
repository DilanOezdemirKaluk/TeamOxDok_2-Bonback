import { useEffect, useState } from "react";
import { ISectionVM } from "../../../models/ISection";
import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import styles from "./ShiftReportCreate.module.css";
import { useShiftReportTemplateEditLoader } from "../../../shared/api/services/loader/shiftReportTemplateEditLoader";
import { IShiftReportTemplateVM } from "../../../models/IShiftReportTemplate";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import serviceService from "../../../shared/api/services/serviceService";
import { useNavigate } from "react-router-dom";

interface IShiftReportCreateProps {
  show: boolean;
  onClose: () => void;
  sections: ISectionVM[];
}

export const ShiftReportCreate: React.FC<IShiftReportCreateProps> = ({
  show,
  onClose,
  sections,
}) => {
  const navigate = useNavigate();
  const { getForSingleCreate } = useShiftReportTemplateEditLoader();
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDocumentCategoryId, setSelectedDocumentCategoryId] =
    useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<
    IShiftReportTemplateVM[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<IShiftReportTemplateVM>();

  const getSectionOptions = () => {
    const result = sections.map((s) => ({
      label: s.name,
      value: s.id.toString(),
    }));
    return result;
  };

  const getDocumentCategories = () => {
    const section = sections.find((s) => s.id.toString() === selectedSectionId);
    if (section) {
      const result = section.documentCategories.map((dc) => ({
        label: dc.name,
        value: dc.id.toString(),
      }));
      return result;
    }
    return [];
  };

  const getTemplatesSelect = () => {
    const result = selectedTemplates.map((t) => ({
      label: t.isValid ? `${t.version} (Gültig)` : t.version.toString(),
      value: t.id.toString(),
    }));
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedDocumentCategoryId.length > 0) {
        const templates = await getForSingleCreate(selectedDocumentCategoryId);
        setSelectedTemplates(templates);
      }
    };
    fetchData();
  }, [selectedDocumentCategoryId]);

  const createShiftReport = async () => {
    if (selectedTemplate) {
      const newId = await serviceService.createShiftReport(
        selectedTemplate.id.toString(),
        true
      );
      navigate(`/shiftReportListTest/shiftReportEdit/${newId}`);
    }
  };

  return (
    <>
      <DrawerModule
        title="Schichtrapport anlegen"
        open={show}
        onClose={() => onClose()}
        width={500}
      >
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Bereich</label>
          <ActionSelect
            onChange={setSelectedSectionId}
            defaultValue={selectedSectionId}
            options={getSectionOptions()}
            width={500}
          />
        </div>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Dokumentenart</label>
          <ActionSelect
            onChange={setSelectedDocumentCategoryId}
            defaultValue={selectedDocumentCategoryId}
            options={getDocumentCategories()}
            width={500}
          />
        </div>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Template Version</label>
          <ActionSelect
            onChange={(e) =>
              setSelectedTemplate(
                selectedTemplates.find((t) => t.id.toString() === e)
              )
            }
            defaultValue={selectedTemplate?.id.toString() ?? ""}
            options={getTemplatesSelect()}
            width={500}
          />
        </div>
        <div className={styles.container}>
          {selectedTemplate ? (
            <>
              <div className={styles.container}>{selectedTemplate.name}</div>
              <div className={styles.container}>
                <ActionButton
                  title="Anlegen"
                  onClick={() => createShiftReport()}
                />
              </div>
            </>
          ) : (
            "Template nicht gefunden"
          )}
        </div>
      </DrawerModule>
    </>
  );
};
