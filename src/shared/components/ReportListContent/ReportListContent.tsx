import { Card } from "antd";
import styles from "./ReportListContent.module.css";
import { ReactNode } from "react";

interface IReportListContentProps {
  children?: ReactNode;
}

export const ReportListContent: React.FC<IReportListContentProps> = ({
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
