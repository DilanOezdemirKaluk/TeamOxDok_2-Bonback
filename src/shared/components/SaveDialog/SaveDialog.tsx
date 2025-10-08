import React, { useState, useEffect } from "react";
import { ActionModal } from "../ActionModal/ActionModal";

interface ISaveDialogProps {
  show: boolean;
  title: string;
}

export const SaveDialog: React.FC<ISaveDialogProps> = ({ show, title }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (!show) {
      const timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setIsVisible(true);
    }
  }, [show]);

  return (
    <ActionModal
      title={title}
      open={isVisible}
      onOk={() => setIsVisible(false)}
      showCancel={false}
    />
  );
};
