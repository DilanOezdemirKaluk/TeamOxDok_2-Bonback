import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useShiftReportEditLoader } from "../../../shared/api/services/loader/shiftReportEditLoader";
import { IShiftReportEditVM } from "../../../models/IShiftReport";
import { ListEditContent } from "../../../shared/components/ListEditContent/ListEditContent";
import { Loading } from "../../../shared/components/Loading/Loading";
import { ShiftReportInformation } from "../../components/ShiftReportInformation/ShiftReportInformation";
import { ShiftReportEditContent } from "../../components/ShiftReportEditContent/ShiftReportEditContent";
import {
  IObjectType,
  IShiftReportTemplateDatabaseTableItemVM,
  IShiftReportTemplateTableHiddedRowVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableVM,
} from "../../../models/IShiftReportTemplateTable";
import { IConstantVM } from "../../../models/IConstant";
import shiftReportService from "../../../shared/api/services/shiftReportService";
import { getCalculationValue } from "../../../shared/globals/global";
import { SaveDialog } from "../../../shared/components/SaveDialog/SaveDialog";
import { ReportListContent } from "../../../shared/components/ReportListContent/ReportListContent";
import documentService from "../../../shared/api/services/documentService";
import { IDocumentUploadMode } from "../../../models/IDocument";
import { IDisturbanceNoticeVM } from "../../../models/IDisturbanceNotice";
import { ShiftReportDisturbanceNoticesList } from "../../components/ShiftReportDisturbanceNoticesList/ShiftReportDisturbanceNoticesList";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import {
  useCurrentUserId,
  useCurrentUserName,
} from "../../../shared/api/services/loader/currentUserLoader";
import { IMessageVM } from "../../../models/IMessage";
import { ShiftReportMessagesList } from "../../components/ShiftReportMessagesList/ShiftReportMessagesList";

export const ShiftReportEdit: React.FC = () => {
  const navigate = useNavigate();
  const currentUsername = useCurrentUserName();
  const currentUserId = useCurrentUserId();

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const readOnly = queryParams.get("readOnly") === "true";

  const [current, setCurrent] = useState<IShiftReportEditVM>();
  const [constants, setConstants] = useState<IConstantVM[]>();
  const [disturbanceNotices, setDisturbanceNotices] =
    useState<IDisturbanceNoticeVM[]>();
  const [messages, setMessages] = useState<IMessageVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSave, setShowSave] = useState(false);
  const [showDisturbanceNotices, setShowDisturbanceNotices] = useState(false);
  const [showMessges, setShowMessages] = useState(false);
  const [lockedBy, setIsLockedBy] = useState("");
  const [previousShiftId, setPreviousShiftId] = useState(-1);
  const [nextShiftId, setNextShiftId] = useState(-1);
  const [databaseTableItemVM, setDatabaseTableItemVM] = useState<
    IShiftReportTemplateDatabaseTableItemVM[]
  >([]);
  const [isLockedAfterSave, setIsLockedAfterSave] = useState(false);
  const [lockedByEightId, setLockedByEightId] = useState("");
  const [currentFileSize, setCurrentFileSize] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { sections } = useSectionLoader();

  const { getForEdit } = useShiftReportEditLoader();
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const isCreateTrue = id.includes("Create=true");
        if (isCreateTrue === false) {
          setLoading(true);
          const reportId = parseInt(id);
          const data = await getForEdit(reportId);
          setCurrent(data.item);
          setConstants(data.constants);
          setDisturbanceNotices(data.disturbanceNotices);
          setMessages(data.messages);
          setIsLockedBy(data.lockedBy);
          setLockedByEightId(data.lockedByEightId);
          setPreviousShiftId(data.previousShiftId);
          setNextShiftId(data.nextShiftId);
          setIsAuthorized(data.isAuthorized);
          if (data.size) {
            setCurrentFileSize(data.size);
          } else {
            setCurrentFileSize(0);
          }

          if (
            data.item.disabled ||
            (data.lockedBy.toString() !== currentUserId.toString() &&
              data.lockedBy.toString() !== "-1")
          ) {
            setIsDisabled(true);
          } else {
            setIsDisabled(false);
          }

          if (readOnly) {
            setIsDisabled(true);
          }

          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const savedLockInfo = localStorage.getItem("shiftReportLockInfo");
    if (savedLockInfo) {
      const lockInfo = JSON.parse(savedLockInfo);
      if (
        id !== undefined &&
        lockInfo.reportId.toString() === id.toString() &&
        lockInfo.lockedUntil > Date.now()
      ) {
        setIsLockedAfterSave(true);
        setTimeout(() => {
          setIsLockedAfterSave(false);
          unLockReport();
          localStorage.removeItem("shiftReportLockInfo");
        }, lockInfo.lockedUntil - Date.now());
      }
    }
  }, [id]);

  useEffect(() => {
    const lockReport = async () => {
      if (lockedBy.toString() === "-1") {
        if (current && !isDisabled) {
          await shiftReportService.lockShiftReport(
            current.id,
            currentUserId,
            current.shiftReportTemplate.documentCategory.id,
            true
          );
          setIsLockedBy(currentUserId);
        }
      }
    };

    lockReport();
    return () => {};
  }, [lockedBy, isAuthorized, current, currentUserId]);

  const unLockReport = async () => {
    if (current && lockedBy.toString() === currentUserId.toString()) {
      await shiftReportService.lockShiftReport(
        current.id,
        currentUserId,
        current.shiftReportTemplate.documentCategory.id,
        false
      );
    }
  };

  const cancel = async () => {
    await unLockReport();
    navigate(`/shiftReportList`);
  };

  const updateValue = (
    value: string,
    object: IShiftReportTemplateTableObjectVM,
    tableItem: IShiftReportTemplateTableVM
  ) => {
    if (tableItem.isDatabase && object.type === IObjectType.Input) {
      const existingIndex = databaseTableItemVM.findIndex(
        (item) =>
          item.tableId === tableItem.id && item.rowIndex === object.rowIndex
      );
      if (existingIndex !== -1) {
        const updatedDatabaseTableItemVM = [...databaseTableItemVM];
        updatedDatabaseTableItemVM[existingIndex].value = value;
        setDatabaseTableItemVM(updatedDatabaseTableItemVM);
      } else {
        const newData: IShiftReportTemplateDatabaseTableItemVM = {
          tableId: tableItem.id,
          rowIndex: object.rowIndex,
          value: value,
        };
        setDatabaseTableItemVM((prevState) => [...prevState, newData]);
      }
      return;
    }

    setCurrent((prevCurrent) => {
      if (!prevCurrent) {
        return prevCurrent;
      }
      const reportObjIndex = prevCurrent?.shiftReportObjects?.findIndex(
        (o) =>
          o.shiftReportTemplateTableObject?.id?.toString() ===
          object?.id?.toString()
      );
      let updatedShiftReportObjects =
        reportObjIndex !== -1
          ? [
              ...prevCurrent.shiftReportObjects.slice(0, reportObjIndex),
              { ...prevCurrent.shiftReportObjects[reportObjIndex], value },
              ...prevCurrent.shiftReportObjects.slice(reportObjIndex + 1),
            ]
          : [
              ...prevCurrent.shiftReportObjects,
              { id: 0, value, shiftReportTemplateTableObject: object },
            ];

      updatedShiftReportObjects = updatedShiftReportObjects.filter(
        (obj) =>
          obj.shiftReportTemplateTableObject &&
          (obj.shiftReportTemplateTableObject.type === IObjectType.Input ||
            obj.shiftReportTemplateTableObject.type === IObjectType.LOV ||
            obj.shiftReportTemplateTableObject.type === IObjectType.Selection ||
            obj.shiftReportTemplateTableObject.type === IObjectType.Calculation)
      );

      const inputValues = updatedShiftReportObjects.filter(
        (obj) => obj.shiftReportTemplateTableObject.type === IObjectType.Input
      );
      const calculationObjects = updatedShiftReportObjects.filter(
        (obj) =>
          obj.shiftReportTemplateTableObject.type === IObjectType.Calculation
      );
      calculationObjects.map(
        (obj) =>
          (obj.value = getCalculationValue(
            obj.shiftReportTemplateTableObject.value,
            inputValues
          ))
      );

      return { ...prevCurrent, shiftReportObjects: updatedShiftReportObjects };
    });
  };

  const onSave = async () => {
    if (current) {
      const currentDate = new Date();
      current.changedAt = currentDate;
      current.changedByName = currentUsername;
      setShowSave(true);
      current.databaseTableItems = databaseTableItemVM;
      await shiftReportService.update(current);

      unLockReport();
      setShowSave(false);

      setIsLockedAfterSave(true);
      const lockedUntil = Date.now() + 20000;
      localStorage.setItem(
        "shiftReportLockInfo",
        JSON.stringify({ reportId: current.id, lockedUntil })
      );

      setTimeout(() => {
        setIsLockedAfterSave(false);
        unLockReport();
        localStorage.removeItem("shiftReportLockInfo");
      }, 20000);
    }
  };

  if (loading) {
    return (
      <ListEditContent>
        <Loading />
      </ListEditContent>
    );
  }

  const onDocumentRemove = async (id: string) => {
    if (current) {
      const size = await documentService.deleteDocument(
        id,
        IDocumentUploadMode.shiftReports.toString()
      );
      setCurrentFileSize(currentFileSize - size);
      await reload();
    }
  };

  const reload = async () => {
    if (current) {
      const data = await getForEdit(current.id);
      setCurrent(data.item);
    }
  };

  const redirectToShift = (id: number) => {
    if (current) {
      navigate(`/shiftReportList/shiftReportEdit/${id}?readOnly=${readOnly}`);
    }
  };

  const onRowsVisibleChange = (
    table: IShiftReportTemplateTableVM,
    rows: IShiftReportTemplateTableHiddedRowVM[]
  ) => {
    if (current) {
      const newCurrent = { ...current };
      const tableID = table.id;
      const index = newCurrent.shiftReportVisibleRows.findIndex(
        (entry) => entry.tableId === tableID
      );

      if (index !== -1) {
        newCurrent.shiftReportVisibleRows[index].rows = rows.map(
          (row) => row.rowIndex
        );
      } else {
        newCurrent.shiftReportVisibleRows.push({
          tableId: tableID,
          rows: rows.map((row) => row.rowIndex),
        });
      }
      setCurrent({ ...newCurrent });
    }
  };

  return (
    <>
      <SaveDialog show={showSave} title="Schichtrapport wird gespeichert..." />
      {current && (
        <>
          <ShiftReportInformation
            item={current}
            onSave={onSave}
            disturbanceNotices={disturbanceNotices}
            messages={messages}
            showDisturbanceNotices={() => setShowDisturbanceNotices(true)}
            showMessages={() => setShowMessages(true)}
            authorized={
              current.disabled === false &&
              isAuthorized &&
              lockedBy.toString() === currentUserId.toString() &&
              isLockedAfterSave === false
            }
            closeDialog={cancel}
            previousShiftId={previousShiftId}
            nextShiftId={nextShiftId}
            redirectToShift={redirectToShift}
            lockedBy={lockedBy}
            currentUserId={currentUserId}
            lockedByEightId={lockedByEightId}
            isDisabled={isDisabled}
          />
          {constants && (
            <ReportListContent>
              <ShiftReportEditContent
                item={current}
                updateValue={updateValue}
                constants={constants}
                onDocumentRemove={onDocumentRemove}
                onUpload={reload}
                isDisabled={isDisabled}
                onRowsVisibleChange={onRowsVisibleChange}
                documentSize={currentFileSize}
              />
            </ReportListContent>
          )}
          <ShiftReportDisturbanceNoticesList
            open={showDisturbanceNotices}
            onClose={() => setShowDisturbanceNotices(false)}
            disturbanceNotices={disturbanceNotices}
            sections={sections}
          />
          <ShiftReportMessagesList
            open={showMessges}
            onClose={() => setShowMessages(false)}
            messages={messages}
            sections={sections}
          />
        </>
      )}
    </>
  );
};
