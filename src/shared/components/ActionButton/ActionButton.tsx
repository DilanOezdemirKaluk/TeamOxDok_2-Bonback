import React, { CSSProperties, PropsWithChildren } from "react";
import { Button as AntdButton } from "antd";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
  icon?: React.ReactNode;
  title?: string;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
  autoFocus?: boolean;
  htmlType?: "button" | "submit" | "reset";
  loading?: boolean;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
  disabled?: boolean;
  style?: CSSProperties;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ActionButton: React.FC<PropsWithChildren<ActionButtonProps>> = ({
  icon,
  title,
  onClick,
  children,
  danger = false,
  className,
  autoFocus,
  htmlType = "button",
  loading = false,
  buttonType = "primary",
  disabled,
  style,
  onMouseDown,
}) => {
  return (
    <div className={styles.actionButtons} style={style}>
      <AntdButton
        icon={icon}
        type={buttonType}
        onClick={onClick}
        danger={danger}
        className={className}
        autoFocus={autoFocus}
        htmlType={htmlType}
        loading={loading}
        disabled={disabled}
        onMouseDown={onMouseDown}
      >
        {children || title}
      </AntdButton>
    </div>
  );
};
