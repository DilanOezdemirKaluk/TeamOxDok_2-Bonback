import { Card } from "antd";
import styles from "./ListContent.module.css";
import { ReactNode } from "react";

interface ListContentProps {
  children?: ReactNode;
}

export const ListContent: React.FC<ListContentProps> = ({ children }) => {
  return (
    <>
      <Card
        className={styles.card}
        style={{ fontSize: 14, fontFamily: "Calibri, Arial, Verdana" }}
      >
        {children}{" "}
      </Card>
    </>
  );
};
