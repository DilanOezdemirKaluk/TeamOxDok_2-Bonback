import { IShiftReportObject } from "../../models/IShiftReport";
import { IShiftReportTemplateTableVM } from "../../models/IShiftReportTemplateTable";

export const formatDateString = (originalDate: string): string => {
  const formattedDate = new Date(originalDate).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formattedDate;
};

export const formatDateStringWithoutSeconds = (
  originalDate: string
): string => {
  const formattedDate = new Date(originalDate).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formattedDate;
};

export const formatDateWithTime = (dt: Date): string => {
  const formattedDate = new Date(dt).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formattedDate;
};

export const formatDate = (dt: Date): string => {
  const formattedDate = new Date(dt).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formattedDate;
};

export const getShiftString = (shift: number) => {
  switch (shift) {
    case 1:
      return "Nachtschicht";
    case 2:
      return "Frühschicht";
    case 3:
      return "Spätschicht";
    default:
      return "";
  }
};

export const getShiftDate = (shift: number, dt: Date) => {
  if (shift === 1) {
    const date = new Date(dt);
    date.setDate(date.getDate() + 1);
    return date;
  }
  return dt;
};

export const generateUniqueId = (): number => {
  return Math.floor(10000000 + Math.random() * 90000000);
};

export const getCalculationValue = (
  value: string,
  inputValues: IShiftReportObject[]
) => {
  const parts: string[] = value.replace(/\$/g, "").split("+");
  const operator: string = value.includes("+") ? "+" : "-";
  const valueA: string = parts[0];
  const valueB: string = parts[1];
  let sum = 0;

  if (value.toUpperCase().startsWith("$SUM$")) {
    const values = value.replace("$SUM$", "");
    const valuesArray = values.split("$").filter((value) => value !== "");
    valuesArray.forEach((value) => {
      const obj = inputValues.find(
        (obj) =>
          obj.shiftReportTemplateTableObject?.outputlistName.toString() ===
          value
      );
      if (obj) {
        if (obj.value.length > 0) {
          sum += parseInt(obj.value, 10);
        }
        sum += 0;
      }
    });
  } else {
    const objA = inputValues.find(
      (obj) =>
        obj.shiftReportTemplateTableObject.outputlistName.toString() === valueA
    );
    const objB = inputValues.find(
      (obj) =>
        obj.shiftReportTemplateTableObject.outputlistName.toString() === valueB
    );
    if (objA && objB) {
      const parsedA = parseInt(objA.value);
      const parsedB = parseInt(objB.value);
      if (!isNaN(parsedA) && !isNaN(parsedB)) {
        if (operator === "+") {
          sum = parsedA + parsedB;
        } else if (operator === "-") {
          sum = parsedA - parsedB;
        } else {
          console.error("Ungültiger Operator");
        }
      }
    }
  }
  return sum.toString();
};

export function getColumnWidth_ShiftReportTableData(
  tableItem: IShiftReportTemplateTableVM,
  currentIndex: number
): number {
  if (tableItem.columnWidth !== undefined) {
    const columnWidth = tableItem.columnWidth.find(
      (c) => c.columnIndex === currentIndex
    );
    if (columnWidth) {
      if (columnWidth.width !== 0) {
        return columnWidth.width;
      }
    }
  }

  let maxWidth = 1045;
  let countColumnsWidthWidth = 0;
  if (tableItem.columnWidth !== undefined) {
    for (let i = 0; i < tableItem.columnWidth.length; i++) {
      const currentWidth = tableItem.columnWidth[i].width;
      if (currentWidth !== 0) {
        maxWidth = maxWidth - currentWidth;
        countColumnsWidthWidth++;
      }
    }
  }
  let sumPadding = 10 * (tableItem.columns - 1);
  maxWidth = maxWidth - sumPadding;
  const result = maxWidth / (tableItem.columns - countColumnsWidthWidth);
  return result;
}

export const dateFormat = "DD.MM.YYYY";
