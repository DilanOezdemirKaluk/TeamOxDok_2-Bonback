import React, { useState, ChangeEvent, useEffect } from "react";
import { Input } from "antd";

interface INumericInputFieldProps {
  onChange?: (value: string) => void;
  value?: string;
  width?: number;
  maxLength?: number;
  max?: number;
  disabled?: boolean;
  waitForInput?: boolean;
  min?: number;
}

export const NumericInputField: React.FC<INumericInputFieldProps> = ({
  onChange,
  value,
  width,
  maxLength,
  max,
  disabled,
  waitForInput,
  min,
}) => {
  const [inputValue, setInputValue] = useState<string>(value ?? "");
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputTimeoutId, setInputTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [processTimeoutId, setProcessTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let numericValue = rawValue.replace(/[^0-9]/g, "");

    if (max && parseInt(numericValue) > max) {
      numericValue = max.toString();
    }

    setInputValue(numericValue);

    if (waitForInput) {
      if (inputTimeoutId) {
        clearTimeout(inputTimeoutId);
      }
      if (processTimeoutId) {
        clearTimeout(processTimeoutId);
      }

      const newInputTimeoutId = setTimeout(() => {
        setIsWaiting(true);
        setIsWaiting(false);
        setIsProcessing(true);

        const newProcessTimeoutId = setTimeout(() => {
          setIsProcessing(false);
          if (numericValue.length === 0) {
            numericValue = min?.toString() ?? "0";
          }
          if (onChange) {
            onChange(numericValue);
          }
        }, 1000);

        setProcessTimeoutId(newProcessTimeoutId);
      }, 500);

      setInputTimeoutId(newInputTimeoutId);
    } else {
      if (onChange) {
        onChange(numericValue);
      }
    }
  };

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <Input
      onChange={handleInputChange}
      value={inputValue}
      style={{ width: width }}
      maxLength={maxLength}
      max={max}
      disabled={disabled || isWaiting || isProcessing}
      min={min}
    />
  );
};
