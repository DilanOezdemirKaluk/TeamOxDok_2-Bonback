import { DatePicker, DatePickerProps } from "antd";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";
import styles from "./ShiftReportSearch.module.css";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ShiftSelector } from "../../../shared/components/ShiftSelector/ShiftSelector";
import { dateFormat } from "../../../shared/globals/global";

interface IShiftReportSearchProps {
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onShiftChange: (value: string) => void;
  onResetFilter: () => void;
  initStart: Date | undefined;
  initEnd: Date | undefined;
}

export const ShiftReportSearch: React.FC<IShiftReportSearchProps> = ({
  onStartDateChange,
  onEndDateChange,
  onShiftChange,
  onResetFilter,

}) => {
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>();
  const [shiftFilter, setShiftFilter] = useState("");

  const onStartChange: DatePickerProps["onChange"] = (date, dateString) => {
    const dateDayjs = date ? dayjs(dateString, dateFormat) : null;
    setStartDate(dateDayjs);
    onStartDateChange(dateDayjs ? dateDayjs.toDate() : undefined);
  };

  const onEndChange: DatePickerProps["onChange"] = (date, dateString) => {
    const dateDayjs = date ? dayjs(dateString, dateFormat) : null;
    setEndDate(dateDayjs);
    onEndDateChange(dateDayjs ? dateDayjs.toDate() : undefined);
  };

  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    onStartDateChange(undefined);
    onEndDateChange(undefined);
    setShiftFilter("");
    onResetFilter();
  };

  
  return (
    <>
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.boldText}>
            <FieldDescription title="Schicht">
              <ShiftSelector
                value={shiftFilter}
                onChange={(value) => {
                  setShiftFilter(value);
                  onShiftChange(value);
                }}
              />
            </FieldDescription>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.boldText}>
            <FieldDescription title="Von">
              <DatePicker
                value={startDate}
                onChange={(date, dateString) => onStartChange(date, dateString)}
                format={dateFormat}
              />
            </FieldDescription>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.boldText}>
            <FieldDescription title="Bis">
              <DatePicker
                value={endDate}
                onChange={(date, dateString) => onEndChange(date, dateString)}
                format={dateFormat}
              />
            </FieldDescription>
          </div>
        </div>
        <div
          className={styles.box}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <div className={styles.boldText}>
            <ActionButton
              title="Filter löschen"
              onClick={() => resetFilter()}
            />
          </div>
        </div>
      </div>
    </>
  );
};
