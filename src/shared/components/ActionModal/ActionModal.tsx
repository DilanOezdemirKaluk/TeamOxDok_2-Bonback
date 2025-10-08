import { Button, Modal } from "antd";
import React, { PropsWithChildren } from "react";

interface IActionModalProps {
  open: boolean;
  onCancel?: () => void;
  onOk: () => void;
  title: string;
  showCancel?: boolean;
}

export const ActionModal: React.FC<PropsWithChildren<IActionModalProps>> = ({
  open,
  onCancel,
  onOk,
  title,
  children,
  showCancel = true,
}) => {
  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={onCancel}
        footer={[
          showCancel && (
            <Button key="cancel" onClick={onCancel}>
              Abbrechen
            </Button>
          ),
          <Button key="ok" type="primary" onClick={onOk}>
            OK
          </Button>,
        ]}
      >
        {children}
      </Modal>
    </>
  );
};
