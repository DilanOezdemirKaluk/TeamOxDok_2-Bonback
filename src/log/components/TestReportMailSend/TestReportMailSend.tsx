import React, { useState } from "react";
import { ActionModal } from "../../../shared/components/ActionModal/ActionModal";
import { InputField } from "../../../shared/components/InputField/InputField";
import mailLogService from "../../../shared/api/services/mailLogService";
import { ILogStatus, IMailLogResultVM } from "../../../models/ILog";
import { useDocumentCategoryLoader } from "../../../shared/api/services/loader/documentCategoryLoader";
import { DocumentCategorySelect } from "../../../shared/components/DocumentCategorySelect/DocumentCategorySelect";
import { Radio, RadioChangeEvent } from "antd";
import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { useMailingListLoader } from "../../../shared/api/services/loader/mailingListLoader";
import { IMailingListVm } from "../../../models/IMailingList";

interface ITestReportMailSendProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export const TestReportMailSend: React.FC<ITestReportMailSendProps> = ({
  open,
  onCancel,
  onOk,
}) => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<IMailLogResultVM | null>(null);
  const [documentCategoryId, setDocumentCategoryId] = useState("-1");
  const [value, setValue] = useState(1);
  const [selectedMailingList, setSelectedMailingList] =
    useState<IMailingListVm>();

  const { loadingMailingLists, mailingLists } = useMailingListLoader();

  const { documentCategories, loadingDocumentCategories } =
    useDocumentCategoryLoader(-1);

  const send = async () => {
    if (value === 1) {
      if (email.length === 0 || documentCategoryId === "-1") {
        return;
      }
      const result = await mailLogService.sendReportTestMail(
        email,
        documentCategoryId
      );
      setResult(result);
    }

    if (value === 2) {
      if (selectedMailingList === undefined) {
        return;
      }
      const result = await mailLogService.sendReportTestMailForMailingList(
        selectedMailingList.id,
        documentCategoryId
      );
    }
  };

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const getMailingListOptions = () => {
    if (mailingLists === undefined) return [];
    const result = mailingLists.map((ml) => {
      return {
        label: ml.name,
        value: ml.id.toString(),
      };
    });
    return result;
  };

  return (
    <>
      <ActionModal
        title="Test Report Mail senden"
        open={open}
        onOk={send}
        onCancel={onCancel}
      >
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={1}>E-Mail Adresse</Radio>
          <Radio value={2}>Verteilerliste</Radio>
        </Radio.Group>
        {value === 1 ? (
          <InputField
            placeholder="Email Adresse"
            onChange={setEmail}
            value={email}
          />
        ) : (
          <ActionSelect
            onChange={(e) => {
              const ml = mailingLists?.find((obj) => obj.id.toString() === e);
              setSelectedMailingList(ml);
            }}
            options={getMailingListOptions()}
            defaultValue={selectedMailingList?.id.toString() ?? ""}
          />
        )}
        {documentCategories && (
          <DocumentCategorySelect
            documentCategories={documentCategories}
            defaultValue={documentCategoryId}
            onChange={(id) => {
              setDocumentCategoryId(id);
            }}
          />
        )}
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
