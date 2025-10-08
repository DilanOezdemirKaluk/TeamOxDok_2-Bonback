import { Modal } from "antd";
import React, { useEffect } from "react";

interface IErrorModalProps {
  text: string;
  open: boolean;
  onClose: () => void;
}

export const ErrorModal: React.FC<IErrorModalProps> = ({
  open,
  onClose,
  text,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Modal title={"Fehler"} open={open} footer={null} onCancel={onClose}>
      {text}
    </Modal>
  );
};
