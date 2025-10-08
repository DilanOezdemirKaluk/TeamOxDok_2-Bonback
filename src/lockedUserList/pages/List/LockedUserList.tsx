import { useEffect, useState } from "react";
import serviceService from "../../../shared/api/services/serviceService";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { ILockedReportUserVM } from "../../../models/IService";
import { formatDateStringWithoutSeconds } from "../../../shared/globals/global";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { UnlockOutlined } from "@ant-design/icons";
import styles from "./LockedUserList.module.css";

export const LockedUserList: React.FC = () => {
  const [data, setData] = useState<ILockedReportUserVM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await serviceService.getLockedReportsWithUser();
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  const columns = [
    {
      title: "ReportId",
      dataIndex: "reportId",
      key: "reportId",
    },
    {
      title: "Report",
      dataIndex: "reportName",
      key: "reportName",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.reportName.localeCompare(b.reportName),
    },
    {
      title: "Dokumentenart (Bereich)",
      dataIndex: "documentCategory",
      key: "documentCategory",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.documentCategory.localeCompare(b.documentCategory),
    },
    {
      title: "Vorname",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Nachname",
      dataIndex: "surname",
      key: "surname",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.surname.localeCompare(b.surname),
    },
    {
      title: "Benutzername",
      dataIndex: "username",
      key: "username",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.username.localeCompare(b.username),
    },
    {
      title: "Gespert seit",
      dataIndex: "lockedAt",
      key: "lockedAt",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.lockedAt.localeCompare(b.lockedAt),
      render: (d: string) => <span>{formatDateStringWithoutSeconds(d)}</span>,
    },
    {
      title: "Entspert um",
      dataIndex: "unlockedat",
      key: "unlockedat",
      sorter: (a: ILockedReportUserVM, b: ILockedReportUserVM) =>
        a.unlockedat.localeCompare(b.unlockedat),
      render: (d: string) => <span>{formatDateStringWithoutSeconds(d)}</span>,
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: ILockedReportUserVM) => (
        <div className={styles.buttonContainer}>
          <ActionButton
            onClick={async () => {
              await serviceService.unlockReport(obj.reportId);
              const result = await serviceService.getLockedReportsWithUser();
              setData(result);
            }}
          >
            <UnlockOutlined style={{ fontSize: "16px" }} />
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListContent>
        <OverviewTable dataSource={data} columns={columns} loading={loading} />
      </ListContent>
    </>
  );
};
