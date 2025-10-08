import { Checkbox } from "antd";
import { ISectionVM } from "../../../models/ISection";
import styles from "./SectionsWithDocumentCategories.module.css";
import { useEffect, useState } from "react";

interface ISectionsWithDocumentCategoriesProps {
  sections: ISectionVM[];
  onChange: (documentCategoryIds: number[]) => void;
  reset: boolean;
  selectedDocumentCategoryIds: number[];
}

export const SectionsWithDocumentCategories: React.FC<
  ISectionsWithDocumentCategoriesProps
> = ({ sections, onChange, reset, selectedDocumentCategoryIds }) => {
  const [documentCategoryIds, setDocumentCategoryIds] = useState<number[]>(
    selectedDocumentCategoryIds
  );
  const checkedChange = (documentCategoryId: number, checked: boolean) => {
    setDocumentCategoryIds((prevIds) => {
      const index = prevIds.indexOf(documentCategoryId);
      if (checked && index === -1) {
        return [...prevIds, documentCategoryId];
      } else if (!checked && index !== -1) {
        return prevIds.filter((id) => id !== documentCategoryId);
      }
      return prevIds;
    });
  };

  useEffect(() => {
    if (reset) {
      setDocumentCategoryIds([]);
    }
  }, [reset]);

  useEffect(() => {
    onChange(documentCategoryIds);
  }, [documentCategoryIds]);

  useEffect(() => {
    setDocumentCategoryIds(selectedDocumentCategoryIds);
  }, [selectedDocumentCategoryIds]);

  return (
    <div className={styles.sectionsContainer}>
      {sections.map((s) => (
        <div key={s.id}>
          <div className={styles.sectionItem}>{s.name}</div>
          <div>
            <div
              key={`${s.id}-documentcategories`}
              className={styles.documentCategoriesContainer}
            >
              {s.documentCategories.map((d) => (
                <Checkbox
                  key={`${d.id}-doc`}
                  onChange={(e) => checkedChange(d.id, e.target.checked)}
                  checked={documentCategoryIds.includes(d.id)}
                >
                  {d.name}
                </Checkbox>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
