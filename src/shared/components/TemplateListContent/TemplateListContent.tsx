import { Card } from "antd";
import styles from "./TemplateListContent.module.css";
import { ReactNode } from "react";

interface ITemplateListContentProps {
  children?: ReactNode;
}

export const TemplateListContent: React.FC<ITemplateListContentProps> = ({
  children,
}) => {
  return (
    <>
      <Card
        className={styles.card}
        style={{ fontSize: 14, fontFamily: "Calibri, Arial, Verdana" }}
      >
        {children}
      </Card>
    </>
  );
};
