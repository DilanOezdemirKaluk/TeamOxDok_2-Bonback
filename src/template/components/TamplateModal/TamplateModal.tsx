import { Button, Modal } from "antd";
import React, { PropsWithChildren } from "react";

interface ITemplateModalModalProps {
  onYes: () => void;
  onNo: () => void;
  title: React.ReactNode;
  open: boolean;
}

export const TemplateModal: React.FC<
  PropsWithChildren<ITemplateModalModalProps>
> = ({ onYes, onNo, title, open }) => {
  return (
    <>
      <Modal
        title={title}
        open={open}
        footer={[
          <Button key="yes" type="primary" onClick={onYes}>
            Ja
          </Button>,
          <Button key="no" type="primary" onClick={onNo} danger>
            Nein
          </Button>,
        ]}
        onCancel={onNo}
      />
    </>
  );
};
