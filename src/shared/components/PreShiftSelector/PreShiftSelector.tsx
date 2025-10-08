import { ActionSelect } from "../ActionSelect/ActionSelect";

interface IPreShiftSelectorProps {
  defaultValue: string;
  onChange: (value: string) => void;
}

export const PreShiftSelector: React.FC<IPreShiftSelectorProps> = ({
  defaultValue,
  onChange,
}) => {
  const getOptions = () => {
    const items = [
      { Text: "Aktuelle Schicht", Value: "0" },
      { Text: "-1", Value: "1" },
      { Text: "-2", Value: "2" },
      { Text: "-3", Value: "3" },
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
      defaultValue={defaultValue}
      options={getOptions()}
      width={200}
    />
  );
};
