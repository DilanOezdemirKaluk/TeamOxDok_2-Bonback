import React from "react";
import { ShiftReportModal } from "../ShiftReportModal/ShiftReportModal";

interface IShiftReportErrorProps {
  open: boolean;
  onOk: () => void;
  title: string;
}

export const ShiftReportError: React.FC<IShiftReportErrorProps> = ({
  open,
  onOk,
  title
}) => {
  return (
    <>
      <ShiftReportModal
        title={title}
        open={open}
        onOk={onOk}
      />
    </>
  );
};
