import React from "react";
import styles from "./ShiftReportPrintHeader.module.css";
import logo from "../../../assets/images/tk_logo_small.png";
import { TitleField } from "../../../shared/components/TitleField/TitleField";
import {
  formatDate,
  formatDateWithTime,
  getShiftString,
} from "../../../shared/globals/global";

interface IShiftReportPrintHeaderProps {
  workgroup: string;
  section: string;
  documentCategory: string;
  changedAt: Date;
  changedBy: string;
  createdAt: Date;
  shiftId: number;
}

export const ShiftReportPrintHeader: React.FC<IShiftReportPrintHeaderProps> = ({
  workgroup,
  section,
  documentCategory,
  changedAt,
  changedBy,
  createdAt,
  shiftId,
}) => {
  const getDate = (date: Date, shiftId: number) => {
    const newDate = new Date(date);
    if (shiftId === 1) {
      newDate.setDate(newDate.getDate() + 1);
    }
    return newDate;
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src={logo} alt="TK" width={140} />
      </div>
      <div className={styles.tkInfo}>
        <TitleField text="Bonback" isBold />
        <TitleField text={section} isBold />
        <TitleField text={documentCategory} isBold />
      </div>
      <div className={styles.info}>
        {shiftId > -1 && (
          <TitleField
            text={`${getShiftString(shiftId)} ${formatDate(
              getDate(createdAt, shiftId)
            )}`}
            isBold
          />
        )}
        <TitleField
          text={`Lt. Änderung: ${formatDate(changedAt)} durch ${changedBy}`}
          isBold
        />
      </div>
      <div className={styles.siteInfo}>
        <TitleField text={`Datum: ${formatDateWithTime(new Date())}`} isBold />
      </div>
    </div>
  );
};
