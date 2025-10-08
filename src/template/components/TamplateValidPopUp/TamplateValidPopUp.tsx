import React from "react";
import { TemplateModal } from "../TamplateModal/TamplateModal";
interface ITamplateValidPopUpProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  title: React.ReactNode;
}

export const TamplateValidPopUp: React.FC<ITamplateValidPopUpProps> = ({
  open,
  onYes,
  onNo,
  title,
}) => {
  return (
    <>
      <TemplateModal title={title} open={open} onYes={onYes} onNo={onNo} />
    </>
  );
};
