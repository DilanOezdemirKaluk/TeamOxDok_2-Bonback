import React from "react";
import { ActionButton } from "../../ActionButton/ActionButton";
import styles from "./LoginButton.module.css";

interface ILoginButtonProps {
  icon?: React.ReactNode;
  text: string;
  autoFocus?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  htmlType?: "button" | "submit" | "reset";
}

export const LoginButton: React.FC<ILoginButtonProps> = ({
  icon,
  text,
  autoFocus,
  onClick,
  disabled,
  htmlType = "button",
}) => {
  return (
    <ActionButton
      icon={icon}
      className={styles.button}
      autoFocus={autoFocus}
      onClick={onClick}
      disabled={disabled}
      title={text}
      htmlType={htmlType} 
      buttonType="primary"
    />
  );
};
