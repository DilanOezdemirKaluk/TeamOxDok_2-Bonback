import { Checkbox, Input, Select } from "antd";
import styles from "./FormComponents.module.css";
import { Field } from "formik";
import { TitleField } from "../TitleField/TitleField";
import { ActionButton } from "../ActionButton/ActionButton";
import { ActionSelect } from "../ActionSelect/ActionSelect";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { InputField } from "../../../shared/components/InputField/InputField";
import React, { useEffect } from "react";
import TextArea from "antd/es/input/TextArea";

interface FormButtonControlsProps {
  onCancel: () => void;
}
export const FormButtonControls: React.FC<FormButtonControlsProps> = ({
  onCancel,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.containerItem}>
        <ActionButton
          className={styles.button}
          onClick={() => onCancel()}
          title="Abbrechen"
          buttonType="default"
        />
      </div>
      <div className={styles.containerItem}>
        <ActionButton
          htmlType="submit"
          className={styles.button}
          title="Speichern"
        />
      </div>
    </div>
  );
};

interface FormInputFieldProps {
  title: string;
  value: string;
  placeholder?: string;
  as?: React.ElementType;
}
export const FormInputField: React.FC<FormInputFieldProps> = ({
  title,
  value,
  placeholder,
  as: Component = Input,
}) => {
  return (
    <div className={styles.containerItem}>
      <TitleField text={title} level={5} />
      <Field
        as={Component}
        type="text"
        name={value}
        placeholder={placeholder}
      />
    </div>
  );
};

interface FormCheckBoxFieldProps {
  title: string;
  value: string;
  disabled?: boolean;
}
export const FormCheckBoxField: React.FC<FormCheckBoxFieldProps> = ({
  title,
  value,
  disabled = false,
}) => {
  return (
    <div className={styles.containerItem}>
      <TitleField text={title} level={5} />
      <Field as={Checkbox} type="checkbox" name={value} disabled={disabled} />
    </div>
  );
};

interface LabelFieldProps {
  title: string;
}
export const LabelField: React.FC<LabelFieldProps> = ({ title }) => {
  return (
    <div className={styles.containerItem}>
      <TitleField text={title} level={5} />
    </div>
  );
};

interface FormSelectFieldProps {
  title: string;
  value: string;
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  onChange: (selectedValue: string) => void;
  placeholder?: string; //neu
}
export const FormSelectField: React.FC<FormSelectFieldProps> = ({
  title,
  value,
  options,
  onChange,
  placeholder, //neu
}) => {
  const allOptions = placeholder
    ? [{ value: "", label: placeholder, disabled: true }, ...options]
    : options;

  return (
    <div className={styles.containerItem}>
      <TitleField text={title} level={5} />
      <ActionSelect
        defaultValue={value}
        options={allOptions}
        onChange={onChange}
      />
    </div>
  );
};

interface FormMultiSelectFieldProps {
  title: string;
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  onChange: (checkedValues: CheckboxValueType[]) => void;
  checkedValues: CheckboxValueType[];
}
export const FormMultiSelectField: React.FC<FormMultiSelectFieldProps> = ({
  title,
  options,
  onChange,
  checkedValues,
}) => {
  const getOptions = () => {
    const result = options.map((s) => {
      return {
        label: s.label,
        value: s.value,
      };
    });
    return result;
  };

  return (
    <div className={styles.containerItem}>
      <TitleField text={title} level={5} />
      <Checkbox.Group
        options={getOptions()}
        onChange={onChange}
        value={checkedValues}
      />
    </div>
  );
};
