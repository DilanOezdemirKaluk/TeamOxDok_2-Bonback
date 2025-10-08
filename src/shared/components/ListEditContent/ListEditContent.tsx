import { Card } from "antd";
import styles from "./ListEditContent.module.css";
import { ReactNode } from "react";

interface IListEditContentProps {
  children?: ReactNode;
}

export const ListEditContent: React.FC<IListEditContentProps> = ({
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
