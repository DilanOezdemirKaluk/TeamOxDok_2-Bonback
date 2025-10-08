import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { IShiftReportTemplateVM } from "../../../models/IShiftReportTemplate";
import { formatDateString } from "../../../shared/globals/global";
import { EditButton } from "../../../shared/components/EditButton/EditButton";
import { IDocumentCategoryVM } from "../../../models/IDocumentCategory";
import styles from "./TemplateTable.module.css";
import { CaretRightButton } from "../../../shared/components/CaretRightButton/CaretRightButton";
import { useState } from "react";
import { TamplateValidPopUp } from "../TamplateValidPopUp/TamplateValidPopUp";
import { XFilledButton } from "../../../shared/components/XFilledButton/XFilledButton";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { CopyOutlined } from "@ant-design/icons";
import { TemplateCopy } from "../TemplateCopy/TemplateCopy";

interface ITemplateTableProps {
  data: IShiftReportTemplateVM[];
  onEdit: (obj: IShiftReportTemplateVM) => void;
  authorized: boolean;
  setValid: (valid: boolean, obj: IShiftReportTemplateVM) => void;
}

export const TemplateTable: React.FC<ITemplateTableProps> = ({
  data,
  onEdit,
  authorized,
  setValid,
}) => {
  const [popUp, setpopUp] = useState(false);
  const [isValid, setisValid] = useState(false);
  const [popUpText, setpopUpText] = useState("");
  const [item, setItem] = useState<IShiftReportTemplateVM | null>(null);
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [showCopy, setShowCopy] = useState(false);
  const [copyTemplateId, setCopyTemplateId] = useState<number>(0);

  const handleSort = (columnKey: string, sorter: Function) => {
    return (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) => {
      setSortedColumn(columnKey);
      setSortOrder((prevOrder) =>
        prevOrder === "ascend" ? "descend" : "ascend"
      );
      return sorter(a, b);
    };
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: handleSort(
        "name",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          a.name.localeCompare(b.name)
      ),
      className: sortedColumn === "name" ? styles.sortedColumn : "",
    },
    {
      title: "Dokumentenart",
      dataIndex: "documentCategory",
      key: "documentCategory",
      render: (documentCategory: IDocumentCategoryVM) => (
        <span>
          {documentCategory ? documentCategory.name : "Keine Dokmentenart"}
        </span>
      ),
      sorter: handleSort(
        "documentCategory",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          (a.documentCategory?.name || "").localeCompare(
            b.documentCategory?.name || ""
          )
      ),
      className: sortedColumn === "documentCategory" ? styles.sortedColumn : "",
    },
    {
      title: "Bereich",
      dataIndex: "documentCategory",
      key: "documentCategory",
      render: (documentCategory: IDocumentCategoryVM) => (
        <span>
          {documentCategory ? documentCategory.section.name : "Keine Bereich"}
        </span>
      ),
      sorter: handleSort(
        "section",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          (a.documentCategory?.section.name || "").localeCompare(
            b.documentCategory?.section.name || ""
          )
      ),
      className: sortedColumn === "section" ? styles.sortedColumn : "",
    },
    {
      title: "Gültig",
      dataIndex: "isValid",
      key: "isValid",
      render: (valid: boolean) => <span>{valid ? "Ja" : "Nein"}</span>,
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      sorter: handleSort(
        "version",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          a.version - b.version
      ),
      className: sortedColumn === "version" ? styles.sortedColumn : "",
    },
    {
      title: "Angelegt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text: string, obj: IShiftReportTemplateVM) => (
        <span>
          {`${obj.createdByName} ${formatDateString(obj.createdAt.toString())}`}
        </span>
      ),
      sorter: handleSort(
        "createdAt",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          (a.createdByName || "").localeCompare(b.createdByName || "")
      ),
    },
    {
      title: "Geändert",
      dataIndex: "changedAt",
      key: "changedAt",
      render: (_text: string, obj: IShiftReportTemplateVM) => (
        <span>
          {`${obj.changedByName} ${formatDateString(obj.changedAt.toString())}`}
        </span>
      ),
      sorter: handleSort(
        "createdAt",
        (a: IShiftReportTemplateVM, b: IShiftReportTemplateVM) =>
          (a.changedByName || "").localeCompare(b.changedByName || "")
      ),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IShiftReportTemplateVM) => (
        <div className={styles.contentButton}>
          {/* Nur anzeigen, wenn autorisiert */}
          {authorized && (
            <>
              <CaretRightButton
                onClick={() => {
                  setItem(obj);
                  setisValid(true);
                  setpopUpText(
                    `Möchten Sie Schichtrapport ${obj.name} mit der Version ${obj.version} <span style='color:green;'> gültig</span> setzen?`
                  );
                  setpopUp(true);
                }}
              />
              <XFilledButton
                onClick={() => {
                  setItem(obj);
                  setisValid(false);
                  setpopUpText(
                    `Möchten Sie Schichtrapport ${obj.name} mit der Version ${obj.version} <span style='color:red;'> ungültig</span> setzen?`
                  );
                  setpopUp(true);
                }}
              />
            </>
          )}
    
          {/* Bearbeiten Button, nur wenn autorisiert */}
          {authorized && (
            <EditButton onClick={() => onEdit(obj)} />
          )}
    
          {/* Kopieren Button, nur wenn autorisiert */}
          {authorized && (
            <ActionButton
              onClick={() => {
                setShowCopy(true);
                setCopyTemplateId(obj.id);
              }}
            >
              <CopyOutlined style={{ fontSize: "16px" }} />
            </ActionButton>
          )}
        </div>
      ),
    }
  ];

  const isCorrect = () => {
    if (item) {
      setValid(isValid, item);
    }
    setpopUp(false);
  };

  return (
    <>
      <OverviewTable dataSource={data} columns={columns} />
      <TamplateValidPopUp
        open={popUp}
        onNo={() => setpopUp(false)}
        onYes={isCorrect}
        title={<span dangerouslySetInnerHTML={{ __html: popUpText }} />}
      />
      <TemplateCopy
        open={showCopy}
        onCancel={() => {
          setShowCopy(false);
          setCopyTemplateId(0);
        }}
        title="Vorlage kopieren"
        templateId={copyTemplateId}
      />
    </>
  );
};
