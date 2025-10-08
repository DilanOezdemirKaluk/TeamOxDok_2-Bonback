import { ActionSelect } from "../ActionSelect/ActionSelect";

interface IShiftSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ShiftSelector: React.FC<IShiftSelectorProps> = ({
  onChange,
  value,
}) => {
  const getOptions = () => {
    const items = [
      { Text: "Frühschicht", Value: "2" },
      { Text: "Spätschicht", Value: "3" },
      { Text: "Nachtschicht", Value: "1" },
    ];

    const result = items.map((item) => ({
      key: item.Value,
      label: item.Text,
      value: item.Value,
    }));

    return result;
  };

  return (
    <ActionSelect
      onChange={onChange}
      defaultValue={value}
      options={getOptions()}
      width={150}
    />
  );
};
