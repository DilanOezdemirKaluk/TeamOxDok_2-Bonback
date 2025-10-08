import { Checkbox } from "antd";

interface EditCheckboxProps {
  checked: boolean;
  onChecked: (c: boolean) => void;
  disabled?: boolean;
}

export const EditCheckbox: React.FC<EditCheckboxProps> = ({
  checked,
  onChecked,
  disabled,
}) => {
  return (
    <Checkbox
      checked={checked}
      onChange={(e) => onChecked(e.target.checked)}
      disabled={disabled}
    />
  );
};
