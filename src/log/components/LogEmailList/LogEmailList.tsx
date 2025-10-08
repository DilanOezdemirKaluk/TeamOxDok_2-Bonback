import React, { useState } from "react";
import { IMailLogVM } from "../../../models/ILog";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { formatDateWithTime } from "../../../shared/globals/global";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { IMailingListVm } from "../../../models/IMailingList";
import styles from "./LogEmailList.module.css";
import { TestMailSend } from "../TestMailSend/TestMailSend";
import { DeleteConfirm } from "../../../shared/components/DeleteConfirm/DeleteConfirm";
import { TestReportMailSend } from "../TestReportMailSend/TestReportMailSend";

interface ILogEmailListProps {
  logs: IMailLogVM[];
  onDelete: () => void;
}

export const LogEmailList: React.FC<ILogEmailListProps> = ({
  logs,
  onDelete,
}) => {
  const [showTestMail, setShowTestMail] = useState(false);
  const [showTestReportMail, setShowTestReportMail] = useState(false);

  const columns = [
    {
      title: "Versendet am",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: Date) => <span>{formatDateWithTime(text)}</span>,
    },
    {
      title: "Verteilerliste",
      dataIndex: "mailingList",
      key: "mailingList",
      render: (obj: IMailingListVm) => <span>{obj.name}</span>,
    },
    {
      title: "Dateien",
      dataIndex: "fileNames",
      key: "fileNames",
    },
    {
      title: "Fehlermeldung",
      dataIndex: "error",
      key: "error",
    },
  ];
  return (
    <>
      <div className={styles.buttonContainer}>
        <ActionButton
          title="Test Mail senden"
          onClick={() => setShowTestMail(true)}
        />
        <ActionButton
          title="Test Report Mail senden"
          onClick={() => setShowTestReportMail(true)}
        />
        <DeleteConfirm
          onConfirm={onDelete}
          title={"Möchten Sie das Log leeren"}
        />
      </div>
      <OverviewTable dataSource={logs} columns={columns} />
      <TestMailSend
        open={showTestMail}
        onCancel={() => setShowTestMail(false)}
        onOk={() => setShowTestMail(false)}
      />
      <TestReportMailSend
        open={showTestReportMail}
        onCancel={() => setShowTestReportMail(false)}
        onOk={() => setShowTestReportMail(false)}
      />
    </>
  );
};
