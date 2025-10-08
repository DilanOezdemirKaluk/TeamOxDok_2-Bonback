import { Checkbox } from "antd";
import { ISectionVM } from "../../../models/ISection";
import styles from "./SectionMultiSelect.module.css";
import { useState } from "react";
import { CheckboxValueType } from "antd/es/checkbox/Group";

interface ISectionMultiSelectProps {
  sections: ISectionVM[];
  onChange: (sectionIds: number[]) => void;
}

export const SectionMultiSelect: React.FC<ISectionMultiSelectProps> = ({
  sections,
  onChange,
}) => {
  const [checkedAll, setCheckedAll] = useState(true);
  const [checkedIds, setCheckedIds] = useState<CheckboxValueType[]>([]);

  const checkedChange = (checkedValues: CheckboxValueType[]) => {
    const values: number[] = checkedValues.map((value) => Number(value));
    setCheckedIds(checkedValues);
    setCheckedAll(checkedValues.length === sections.length);
    onChange(values);
  };

  const getOptions = () => {
    return sections.map((s) => ({
      label: s.name,
      value: s.id.toString(),
    }));
  };

  return (
    <>
      <div className={styles.sectionsContainer}>
        <Checkbox
          checked={checkedAll}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setCheckedAll(isChecked);
            if (isChecked) {
              const allIds = sections.map((s) => s.id.toString());
              setCheckedIds(allIds);
              onChange(sections.map((s) => s.id));
            } else {
              setCheckedIds([]);
              onChange([]);
            }
          }}
        >
          Alle
        </Checkbox>
        <Checkbox.Group
          options={getOptions()}
          value={checkedIds}
          onChange={checkedChange}
        />
      </div>
    </>
  );
};
