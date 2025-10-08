import React from "react";
import { ILogVM } from "../../../models/ILog";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { formatDateWithTime } from "../../../shared/globals/global";
import { DeleteConfirm } from "../../../shared/components/DeleteConfirm/DeleteConfirm";

interface ILogExceptionListProps {
  logs: ILogVM[];
  onDelete: () => void;
}

export const LogExceptionList: React.FC<ILogExceptionListProps> = ({
  logs,
  onDelete,
}) => {
  const columns = [
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "MessageTemplate",
      dataIndex: "messageTemplate",
      key: "messageTemplate",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Timestamp",
      dataIndex: "timeStamp",
      key: "timeStamp",
      render: (text: Date) => <span>{formatDateWithTime(text)}</span>,
    },
    {
      title: "Exception",
      dataIndex: "exception",
      key: "exception",
      render: (text: string | null | undefined) => (
        <span>
          {text && text.length > 200 ? `${text.slice(0, 200)}...` : text}
        </span>
      ),
    },
  ];
  return (
    <>
      <DeleteConfirm
        onConfirm={onDelete}
        title={"Möchten Sie das Log leeren"}
      />
      <OverviewTable dataSource={logs} columns={columns} />
    </>
  );
};
