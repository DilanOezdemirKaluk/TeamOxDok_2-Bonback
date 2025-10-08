import { Select } from "antd";
import { CSSProperties, useEffect, useState } from "react";

interface ActionSelectProps {
  onChange: (value: string) => void;
  defaultValue: string;
  options: { value: string; label: string; disabled?: boolean }[];
  width?: number;
  disabled?: boolean;
  style?: CSSProperties;
  allowClear?: boolean;
}

export const ActionSelect: React.FC<ActionSelectProps> = ({
  onChange,
  defaultValue,
  options,
  width = 300,
  disabled = false,
  style,
  allowClear = false,
}) => {
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    const isDefaultValueValid = options.some(
      (opt) => opt.value === defaultValue
    );
    setSelectedValue(isDefaultValueValid ? defaultValue.toString() : "");
  }, [options, defaultValue]);

  return (
    <Select
      defaultValue={selectedValue}
      onChange={onChange}
      options={options}
      style={{ width: width, ...style }}
      disabled={disabled}
      value={selectedValue}
      allowClear={allowClear && selectedValue !== ""}
    />
  );
};
