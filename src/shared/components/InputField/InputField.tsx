import React, { useState, ChangeEvent, useEffect } from "react";
import { Input } from "antd";

interface IInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  width?: number;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
}

export const InputField: React.FC<IInputProps> = ({
  placeholder,
  onChange,
  value,
  width,
  className,
  clearable = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(value ?? "");
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (onChange) {
      onChange(value);
    }
  };
  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <>
      <Input
        placeholder={placeholder}
        onChange={handleInputChange}
        value={inputValue}
        style={{ width: width }}
        className={className}
        allowClear={clearable}
        disabled={disabled}
      />
    </>
  );
};
