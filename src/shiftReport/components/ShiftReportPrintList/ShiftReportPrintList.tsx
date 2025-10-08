import { useState } from "react";
import { ISectionVM } from "../../../models/ISection";
import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import styles from "./ShiftReportPrintList.module.css";
import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";
import { dateFormat } from "../../../shared/globals/global";
import { ShiftMultiSelector } from "../../../shared/components/ShiftMultiSelector/ShiftMultiSelector";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import shiftReportService from "../../../shared/api/services/shiftReportService";

interface IShiftReportPrintListProps {
  show: boolean;
  onClose: () => void;
  sections: ISectionVM[];
}

export const ShiftReportPrintList: React.FC<IShiftReportPrintListProps> = ({
  show,
  onClose,
  sections,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDocumentCategoryId, setSelectedDocumentCategoryId] =
    useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [shiftFilter, setShiftFilter] = useState<CheckboxValueType[]>([]);
  const [isEmptyList, setIsEmptyList] = useState(false);
  const [dateError, setDateError] = useState("");

  const getSectionOptions = () => {
    const result = sections.map((s) => ({
      label: s.name,
      value: s.id.toString(),
    }));
    return result;
  };

  const getDocumentCategories = () => {
    const section = sections.find((s) => s.id.toString() === selectedSectionId);
    if (section) {
      const result = section.documentCategories.map((dc) => ({
        label: dc.name,
        value: dc.id.toString(),
      }));
      return result;
    }
    return [];
  };

  const onStartChange: DatePickerProps["onChange"] = (date, dateString) => {
    const dateDayjs = date ? dayjs(dateString, dateFormat) : null;
    setStartDate(dateDayjs);
  };

  const onEndChange: DatePickerProps["onChange"] = (date, dateString) => {
    const dateDayjs = date ? dayjs(dateString, dateFormat) : null;
    setEndDate(dateDayjs);
  };

  const openNewWindow = (ids: string) => {
    const windowFeatures =
      "width=1090,height=600,toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes";
    const newWindow = window.open(
      "/print/shiftReportPrint/" + ids,
      "_blank",
      windowFeatures
    );
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.scrollTo(0, 1);
      };
    }
  };

  const onPrint = async () => {
    setDateError("");
    setIsEmptyList(false);

    if (!startDate || !endDate || !selectedDocumentCategoryId) {
      setDateError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (endDate.isBefore(startDate)) {
      setDateError("Das Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    const diffInDays = endDate.diff(startDate, "day");
    if (diffInDays > 14) {
      setDateError(
        "Die Differenz zwischen Start- und Enddatum darf maximal 14 Tage betragen."
      );
      return;
    }

    const result = await shiftReportService.getForPrintList({
      documentCategoryId: selectedDocumentCategoryId,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      shiftIds: shiftFilter.map((s) => s.toString()),
    });

    if (result.length > 0) {
      setIsEmptyList(false);
      var ids = result.map((item) => item.id).join("_");
      openNewWindow(ids);
    } else {
      setIsEmptyList(true);
    }
  };

  return (
    <>
      <DrawerModule
        title="Schichtrapporte drucken"
        open={show}
        onClose={() => onClose()}
        width={500}
      >
        <div className={styles.label}>Bereich</div>
        <div className={styles.container}>
          <ActionSelect
            onChange={setSelectedSectionId}
            defaultValue={selectedSectionId}
            options={getSectionOptions()}
            width={500}
          />
        </div>
        <div className={styles.label}>Dokumentenart</div>
        <div className={styles.container}>
          <ActionSelect
            onChange={setSelectedDocumentCategoryId}
            defaultValue={selectedDocumentCategoryId}
            options={getDocumentCategories()}
            width={500}
          />
        </div>
        <div className={styles.container}>
          <DatePicker
            value={startDate}
            onChange={(date, dateString) => onStartChange(date, dateString)}
            format={dateFormat}
          />
          <DatePicker
            value={endDate}
            onChange={(date, dateString) => onEndChange(date, dateString)}
            format={dateFormat}
          />
        </div>
        <div className={styles.container}>
          <ShiftMultiSelector value={shiftFilter} onChange={setShiftFilter} />
        </div>
        {isEmptyList && (
          <div className={styles.container}>
            Es wurden keine Schichtrapporte gefunden
          </div>
        )}
        <div className={styles.container}>{dateError}</div>
        <div className={styles.container}>
          <ActionButton title="Drucken" onClick={() => onPrint()} />
        </div>
      </DrawerModule>
    </>
  );
};
