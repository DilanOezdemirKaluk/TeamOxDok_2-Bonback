import { useParams } from "react-router-dom";
import { ShiftReportPrintHeader } from "../../components/ShiftReportPrintHeader/ShiftReportPrintHeader";
import { useShiftReportEditLoader } from "../../../shared/api/services/loader/shiftReportEditLoader";
import { useEffect, useState } from "react";
import { IShiftReportEditVM } from "../../../models/IShiftReport";
import { IConstantVM } from "../../../models/IConstant";
import styles from "./ShiftReportPrint.module.css";
import { ShiftReportPrintTable } from "../../components/ShiftReportPrintTable/ShiftReportPrintTable";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";
import { Loading } from "../../../shared/components/Loading/Loading";

export const ShiftReportPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const idArray: number[] = id ? id.split("_").map(Number) : [];

  const [loading, setLoading] = useState(true);
  const [shiftReports, setShiftReports] = useState<IShiftReportEditVM[]>();
  const [constants, setConstants] = useState<IConstantVM[]>();

  const { getForPrint } = useShiftReportEditLoader();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (id) {
        const data = await getForPrint(idArray);
        setShiftReports(data.items);
        setConstants(data.constants);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading]);

  const getSortedItems = (shiftreport: IShiftReportEditVM) => {
    const sortedItems = shiftreport.shiftReportTemplate.tables.sort(
      (a, b) => a.sortIndex - b.sortIndex
    );
    return sortedItems;
  };

  return (
    <>
      {loading && (
        <div className={styles.content}>
          <Loading />
        </div>
      )}
      {shiftReports &&
        constants &&
        shiftReports.map((shiftreport) => (
          <>
            <div className={styles.container} key={shiftreport.id}>
              <ShiftReportPrintHeader
                workgroup={shiftreport.shiftReportTemplate.workgroup.name}
                section={
                  shiftreport.shiftReportTemplate.documentCategory.section.name
                }
                documentCategory={
                  shiftreport.shiftReportTemplate.documentCategory.name
                }
                changedAt={shiftreport.changedAt}
                changedBy={shiftreport.changedByName}
                createdAt={shiftreport.createdAt}
                shiftId={shiftreport.shiftId}
              />

              {/* Dokumente an erster Stelle anzeigen */}
              <div className={styles.documents}>
                <DocumentList
                  documents={shiftreport.documents}
                  onRemove={() => true}
                  showDelete={false}
                />
              </div>

              <div className={styles.content}>
                {getSortedItems(shiftreport).map((table, index) => (
                  <ShiftReportPrintTable
                    key={table.id}
                    item={table}
                    objects={shiftreport.shiftReportObjects}
                    constants={constants}
                    constantGroups={[]}
                    report={shiftreport}
                  />
                ))}
              </div>
            </div>
            <div className={styles.printEndPage} />
          </>
        ))}
    </>
  );
};

