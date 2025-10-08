import { IDocumentCategoryVM } from "../../../models/IDocumentCategory";
import { ActionSelect } from "../ActionSelect/ActionSelect";

interface IDocumentCategorySelectProps {
  documentCategories: IDocumentCategoryVM[];
  onChange: (id: string) => void;
  defaultValue: string;
  showAll?: boolean;
}

export const DocumentCategorySelect: React.FC<IDocumentCategorySelectProps> = ({
  documentCategories,
  onChange,
  defaultValue,
  showAll = true,
}) => {
  const getOptions = () => {
    const result = [];
    if (showAll) {
      result.push({
        value: "-1",
        label: "Alle",
      });
    }

    if (documentCategories !== undefined) {
      documentCategories.forEach((documentCategory) => {
        result.push({
          label: documentCategory.name,
          value: documentCategory.id.toString(),
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
