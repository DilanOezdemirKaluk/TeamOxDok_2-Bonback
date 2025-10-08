import { useParams } from "react-router-dom";
import { ShiftReportPrintHeader } from "../../components/ShiftReportPrintHeader/ShiftReportPrintHeader";
import styles from "./ShiftReportPrint.module.css";
import { useEffect, useState } from "react";
import { IShiftReportTemplateVM } from "../../../models/IShiftReportTemplate";
import { useShiftReportTemplateEditLoader } from "../../../shared/api/services/loader/shiftReportTemplateEditLoader";
import { Loading } from "../../../shared/components/Loading/Loading";
import { ShiftReportPrintTable } from "../../components/ShiftReportPrintTable/ShiftReportPrintTable";
import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import {
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateShowTablesVM,
} from "../../../models/IShiftReportTemplateTable";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";

export const ShiftReportTemplatePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<IShiftReportTemplateVM>();
  const [sqlViews, setSqlViews] =
    useState<IShiftReportTemplateSqlViewDataVM[]>();
  const [constantGroups, setConstantGroups] = useState<IConstantGroupVM[]>();
  const [constants, setConstants] = useState<IConstantVM[]>();
  const [showTables, setShowTables] =
    useState<IShiftReportTemplateShowTablesVM>();
  const [loading, setLoading] = useState(true);

  const { getForEdit } = useShiftReportTemplateEditLoader();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const templateId = parseInt(id || "0");
      const data = await getForEdit(templateId);
      setTemplate(data.item);
      setSqlViews(data.views);
      setConstantGroups(data.constantGroups);
      setConstants(data.constants);
      setShowTables(data.showTables);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const getSortedItems = () => {
    if (template == undefined) {
      return [];
    }
    const sortedItems = template.tables.sort(
      (a, b) => a.sortIndex - b.sortIndex
    );
    return sortedItems;
  };

  return (
    <>
      <div className={styles.container}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {template && constants && constantGroups && (
              <>
                <ShiftReportPrintHeader
                  workgroup={template.workgroup.name}
                  section={template.documentCategory.section.name}
                  documentCategory={template.documentCategory.name}
                  changedAt={template.changedAt}
                  changedBy={template.changedByName}
                  createdAt={template.createdAt}
                  shiftId={-1}
                />
                {getSortedItems().map((table, index) => (
                  <ShiftReportPrintTable
                    key={table.id}
                    item={table}
                    objects={[]}
                    constants={constants}
                    constantGroups={constantGroups}
                  />
                ))}
                <div className={styles.documents}>
                  <DocumentList
                    documents={template.documents}
                    onRemove={() => true}
                    showDelete={false}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};
