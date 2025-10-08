import React from "react";
import { MassageModal } from "../MessageModal/MessageModal";
import { MessageEditVm } from "../../../models/IMessage";

interface IMessagePopUp {
  open: boolean;
  title: string;
  onYes: () => void;
  obj?: MessageEditVm;
}

export const MessagePopUp: React.FC<IMessagePopUp> = ({
  open,
  title,
  onYes,
  obj,
}) => {
  return (
    <>
      <MassageModal title={title} open={open} onYes={onYes} obj={obj} />
    </>
  );
};
