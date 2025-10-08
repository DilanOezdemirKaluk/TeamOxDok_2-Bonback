import React, { useState } from "react";
import { ActionModal } from "../../../shared/components/ActionModal/ActionModal";
import { InputField } from "../../../shared/components/InputField/InputField";
import mailLogService from "../../../shared/api/services/mailLogService";
import { ILogStatus, IMailLogResultVM } from "../../../models/ILog";

interface ITestMailSendProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export const TestMailSend: React.FC<ITestMailSendProps> = ({
  open,
  onCancel,
  onOk,
}) => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<IMailLogResultVM | null>(null);

  const send = async () => {
    if (email.length === 0) {
      return;
    }
    const result = await mailLogService.sendTestMail(email);
    setResult(result);
  };

  return (
    <>
      <ActionModal
        title="Test Mail senden"
        open={open}
        onOk={send}
        onCancel={onCancel}
      >
        <InputField
          placeholder="Email Adresse"
          onChange={setEmail}
          value={email}
        />
        {result && (
          <div>
            <p>Ergebnis: {result.result}</p>
            <p>
              Status:{" "}
              {result.status === ILogStatus.Success ? "Erfolgreich" : "Fehler"}
            </p>
          </div>
        )}
      </ActionModal>
    </>
  );
};
