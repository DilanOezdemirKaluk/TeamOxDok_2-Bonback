import React, { PropsWithChildren } from "react";
import styles from "./TemplateEditTableHeaderItem.module.css";

interface ITemplateEditTableHeaderItemProps {
  title: string;
}

export const TemplateEditTableHeaderItem: React.FC<
  PropsWithChildren<ITemplateEditTableHeaderItemProps>
> = ({ title, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.infoField}>{title}</div>
      {children}
    </div>
  );
};
