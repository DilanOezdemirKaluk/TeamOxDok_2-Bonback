import { Button, Modal } from "antd";
import React, { PropsWithChildren } from "react";

interface IShiftReportModalProps {
  open: boolean;
  onOk: () => void;
  title: string;
}

export const ShiftReportModal: React.FC<PropsWithChildren<IShiftReportModalProps>> = ({
  open,
  onOk,
  title,
}) => {
  return (
    <>
      <Modal
        title={title}
        open={open}
        footer={[
          <Button key="ok" type="primary" onClick={onOk}>
            OK
          </Button>,
        ]}
      />
    </>
  );
};
