import { FieldDescription } from "../FieldDescription/FieldDescription";
import { InputField } from "../InputField/InputField";
import s from "./SearchContent.module.css";

interface ISearchContentProps {
  value: string;
  onChange: (v: string) => void;
  description: string;
  searchPlaceholder: string;
}

export const SearchContent: React.FC<ISearchContentProps> = ({
  value,
  onChange,
  description,
  searchPlaceholder,
}) => {
  return (
    <FieldDescription title={description}>
      <div className={s.content}>
        <InputField
          value={value}
          onChange={onChange}
          placeholder={searchPlaceholder}
          width={300}
          clearable
        />
      </div>
    </FieldDescription>
  );
};
