import { PropsWithChildren, useEffect, useState } from "react";
import { ColorPicker } from "antd";
import { Color } from "antd/es/color-picker";

interface IEditColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const EditColorPicker: React.FC<
  PropsWithChildren<IEditColorPickerProps>
> = ({ color, onChange }) => {
  const [inputValue, setInputValue] = useState<string>();
  const handleInputChange = (hex: string) => {
    setInputValue(hex);
    onChange(hex);
  };
  useEffect(() => {
    setInputValue(color);
  }, [color]);
  return (
    <ColorPicker
      format="hex"
      value={inputValue}
      onChange={(v, h) => handleInputChange(h)}
    />
  );
};
