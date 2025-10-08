import React from "react";
import { Checkbox } from "antd";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

interface IShiftMultiSelectorProps {
  value: CheckboxValueType[];
  onChange: (value: CheckboxValueType[]) => void;
}

export const ShiftMultiSelector: React.FC<IShiftMultiSelectorProps> = ({
  onChange,
  value,
}) => {
  const options = [
    { label: "Frühschicht", value: "2" },
    { label: "Spätschicht", value: "3" },
    { label: "Nachtschicht", value: "1" },
  ];

  const handleChange = (checkedValues: CheckboxValueType[]) => {
    onChange(checkedValues);
  };

  return (
    <Checkbox.Group options={options} value={value} onChange={handleChange} />
  );
};
