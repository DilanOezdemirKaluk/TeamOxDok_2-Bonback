import { ISectionVM } from "../../../models/ISection";
import { ActionSelect } from "../ActionSelect/ActionSelect";

interface ISectionSingleSelectProps {
  sections: ISectionVM[];
  onChange: (id: string) => void;
  defaultValue: string;
}

export const SectionSingleSelect: React.FC<ISectionSingleSelectProps> = ({
  sections,
  onChange,
  defaultValue,
}) => {
  const getOptions = () => {
    const result = [
      {
        value: "-1",
        label: "Alle",
      },
    ];

    if (sections !== undefined) {
      sections.forEach((section) => {
        result.push({
          label: section.name,
          value: section.id.toString(),
        });
      });
    }

    return result;
  };

  return (
    <ActionSelect
      onChange={onChange}
      defaultValue={defaultValue}
      options={getOptions()}
    />
  );
};
