import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShiftReportTemplateEditLoader } from "../../../shared/api/services/loader/shiftReportTemplateEditLoader";
import { TemplateEditInformation } from "../../components/TemplateEditInformation/TemplateEditInformation";
import {
  IShiftReportTemplateResponse,
  IShiftReportTemplateVM,
  emptyShiftReportTemplate,
} from "../../../models/IShiftReportTemplate";
import { TemplateEditContent } from "../../components/TemplateEditContent/TemplateEditContent";
import {
  IObjectFormat,
  IObjectType,
  IShiftReportTemplateShowTablesVM,
  IShiftReportTemplateSqlViewDataVM,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  IShiftReportTemplateTableShowTableVM,
  IShiftReportTemplateTableSqlViewVM,
  IShiftReportTemplateTableVM,
  ITableObjectType,
} from "../../../models/IShiftReportTemplateTable";
import { Loading } from "../../../shared/components/Loading/Loading";
import shiftReportTemplateService from "../../../shared/api/services/shiftReportTemplateService";
import { IConstantGroupVM, IConstantVM } from "../../../models/IConstant";
import { TemplateEditAddTable } from "../../components/TemplateEditAddTable/TemplateEditAddTable";
import { generateUniqueId } from "../../../shared/globals/global";
import { TemplateListContent } from "../../../shared/components/TemplateListContent/TemplateListContent";
import { ListEditContent } from "../../../shared/components/ListEditContent/ListEditContent";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";
import { IDocument, IDocumentUploadMode } from "../../../models/IDocument";
import documentService from "../../../shared/api/services/documentService";
import { UploadButton } from "../../../shared/components/UploadButton/UploadButton";
import {
  useCurrentUserId,
  useCurrentUserName,
  useCurrentWorkgroupId,
} from "../../../shared/api/services/loader/currentUserLoader";
import { OutputList } from "../../../shared/components/OutputList/OutputList";
import { IOutputList } from "../../../models/IOutputList";

export const TemplateEdit: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const currentWorkgroupId = useCurrentWorkgroupId();
  const currentUsername = useCurrentUserName();
  const { id, create, documentCategoryID, name } = useParams();
  const [template, setTemplate] = useState<IShiftReportTemplateVM>();
  const [sqlViews, setSqlViews] =
    useState<IShiftReportTemplateSqlViewDataVM[]>();
  const [constantGroups, setConstantGroups] = useState<IConstantGroupVM[]>();
  const [constants, setConstants] = useState<IConstantVM[]>();
  const [showTables, setShowTables] =
    useState<IShiftReportTemplateShowTablesVM>();
  const [outputlistObjects, setOutputlistObjects] =
    useState<IShiftReportTemplateTableOutputlistObjectsVM>();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState(
    template ? template.documents : []
  );
  const [currentOutputListNames, setCurrentOutputListNames] =
    useState<IShiftReportTemplateTableObjectVM[]>();
  const [lockedBy, setIsLockedBy] = useState("");
  const [lockedByEightId, setLockedByEightId] = useState("");
  const [currentFileSize, setCurrentFileSize] = useState(0);

  const { getForEdit, getForCreate, getSqlViewResult } =
    useShiftReportTemplateEditLoader();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let data: IShiftReportTemplateResponse;
      if (create === "true") {
        const numericDocumentCategoryID = documentCategoryID
          ? parseInt(documentCategoryID)
          : 0;
        data = await getForCreate(
          numericDocumentCategoryID,
          currentWorkgroupId
        );
        data.item.name = name ?? "";
      } else {
        const templateId = parseInt(id || "0");
        data = await getForEdit(templateId);
      }
      setDataToState(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const setDataToState = (data: IShiftReportTemplateResponse) => {
    setTemplate(data.item);
    setSqlViews(data.views);
    setConstantGroups(data.constantGroups);
    setConstants(data.constants);
    setShowTables(data.showTables);
    setOutputlistObjects(data.outputlistObjects);
    setDocuments(data.item.documents);
    setOutputListNames(data.item);
    setIsLockedBy(data.lockedBy);
    setLockedByEightId(data.lockedByEightId);
    if (data.size) {
      setCurrentFileSize(data.size);
    } else {
      setCurrentFileSize(0);
    }
  };

  const saveVersion = async () => {
    setLoading(true);
    if (template) {
      const currentDate = new Date();
      template.changedAt = currentDate;
      template.changedByName = currentUsername;

      template.outputLists = template.outputLists.filter(
        (o) => o.description !== "" && o.objectId !== ""
      );

      const result = await shiftReportTemplateService.update(template);
      navigate(`/templateList/templateEdit/${result.item.id}`);
    }
    setLoading(false);
  };

  const saveNewVersion = async () => {
    setLoading(true);
    if (template) {
      const currentDate = new Date();
      template.changedAt = currentDate;
      template.changedByName = currentUsername;
      template.documents = documents;
      template.outputLists = template.outputLists.filter(
        (o) => o.description !== "" && o.objectId !== ""
      );
      const result = await shiftReportTemplateService.updateNewVersion(
        template
      );
      navigate(`/templateList/templateEdit/${result.item.id}`);
    }
    setLoading(false);
  };

  const onUpdate = (items: IShiftReportTemplateTableVM[]) => {
    if (template) {
      template.tables = items;
      setOutputListNames(template);
    }
  };

  const setOutputListNames = (template: IShiftReportTemplateVM) => {
    const outputListNames: IShiftReportTemplateTableObjectVM[] = [];
    template.tables.forEach((t) => {
      t.objects.forEach((obj) => {
        if (obj.outputlistName.length > 0) {
          outputListNames.push(obj);
        }
      });
    });
    setCurrentOutputListNames(outputListNames);
  };

  const addTable = (type: ITableObjectType) => {
    const value: IShiftReportTemplateTableVM = {
      id: generateUniqueId(),
      columns: type === ITableObjectType.Table ? 5 : 0,
      rows: type === ITableObjectType.Table ? 5 : 0,
      hasSeperator: true,
      sortIndex: template?.tables.length ?? 0,
      name: "",
      type: type,
      hiddedRows: [],
      objects: [],
      template: emptyShiftReportTemplate,
      columnWidth: [],
      showOnlyFilledRows: false,
      isDatabase: false,
      hidden: false,
    };

    if (value.type === ITableObjectType.Table) {
      const countObjects = value.rows * value.columns;
      const tableObjects: IShiftReportTemplateTableObjectVM[] = [];
      for (let i = 1; i <= countObjects; i++) {
        const rowIndex = Math.ceil(i / value.columns);
        const columnIndex =
          i % value.columns === 0 ? value.columns : i % value.columns;

        const tableObject: IShiftReportTemplateTableObjectVM = {
          id: 0,
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          type: IObjectType.Label,
          format: IObjectFormat.Text,
          backgroundColor: "",
          value: "",
          outputlistName: "",
          inputLength: 0,
          width: 0,
          fontSize: 12,
          alignment: "center",
          showBorder: false,
        };
        tableObjects.push(tableObject);
      }
      value.objects = tableObjects;
    }

    if (template) {
      const newTemplate = { ...template };
      newTemplate.tables.push(value);

      newTemplate.tables.forEach((table, index) => {
        table.sortIndex = index + 1;
      });

      setTemplate(newTemplate);
    }
  };

  const onShowTableRefresh = (
    table: IShiftReportTemplateTableVM,
    index: number,
    preshift: number
  ) => {
    if (template) {
      const newTemplate = { ...template };

      newTemplate.tables[index].objects = table.objects;
      newTemplate.tables[index].rows = table.rows;
      newTemplate.tables[index].columns = table.columns;
      const showTable: IShiftReportTemplateTableShowTableVM = {
        id: 0,
        preShift: preshift,
        showTable: table,
        table: newTemplate.tables[index],
      };
      let showTables = [...newTemplate.showTables];
      showTables = showTables.filter(
        (s) => s.table.id !== newTemplate.tables[index].id
      );
      showTables.push(showTable);
      newTemplate.showTables = showTables;
      setTemplate(newTemplate);
    }
  };

  const onSqlTableRefresh = async (
    view: IShiftReportTemplateSqlViewDataVM,
    index: number,
    sqlView: IShiftReportTemplateTableSqlViewVM
  ) => {
    if (template) {
      const newTemplate = { ...template };
      const data = await getSqlViewResult(sqlView);
      if (index >= 0 && index < newTemplate.tables.length) {
        newTemplate.tables[index].objects = data.item.objects;
        newTemplate.tables[index].rows = data.item.rows;
        newTemplate.tables[index].columns = data.item.columns;

        let sqlViews = [...newTemplate.sqlViews];
        sqlViews = sqlViews.filter(
          (s) => s.tableId !== newTemplate.tables[index].id
        );
        sqlView.tableId = newTemplate.tables[index].id;
        sqlViews.push(sqlView);
        newTemplate.sqlViews = sqlViews;

        setTemplate(newTemplate);
      }
    }
  };

  const onTableRemove = (tableId: number) => {
    if (template) {
      const newTemplate = { ...template };
      if (newTemplate && newTemplate.showTables) {
        newTemplate.tables = newTemplate.tables.filter((t) => t.id !== tableId);
        newTemplate.showTables = newTemplate.showTables.filter(
          (s) => s.table.id !== tableId
        );
        setTemplate(newTemplate);
      }
    }
  };

  if (loading) {
    return (
      <ListEditContent>
        <Loading />
      </ListEditContent>
    );
  }

  const goBack = () => {
    navigate(`/templateList`);
  };

  const onDocumentRemove = async (id: string) => {
    if (template) {
      const size = await documentService.deleteDocument(
        id,
        IDocumentUploadMode.shiftReportTemplates.toString()
      );
      const newDocuments = documents.filter(
        (d) => d.id.toLowerCase() !== id.toLowerCase()
      );
      setCurrentFileSize(currentFileSize - size);
      setDocuments(newDocuments);
    }
  };

  const onUpload = (document: IDocument, size: number) => {
    if (documents) {
      const newDocuments = [...documents];
      newDocuments.push(document);
      setDocuments(newDocuments);
      setCurrentFileSize(currentFileSize + size);
      if (template) {
        template.changedAt = new Date();
        template.changedByName = currentUsername;
      }
    }
  };

  const onOutputListNamesChange = (items: IOutputList[]) => {
    if (template) {
      template.outputLists = items;
    }
  };

  const onTableSqlViewsUpdate = (
    items: IShiftReportTemplateTableSqlViewVM[]
  ) => {
    if (template) {
      const newTemplate = { ...template };
      newTemplate.sqlViews = items;
      setTemplate(newTemplate);
    }
  };

  const isDisabled =
    lockedBy?.length > 0 &&
    typeof lockedBy !== "undefined" &&
    lockedBy.toString() !== currentUserId.toString() &&
    lockedBy !== "-1" &&
    template?.isValid === true;

  return (
    <>
      {template && (
        <TemplateEditInformation
          item={template}
          saveVersion={saveVersion}
          saveNewVersion={saveNewVersion}
          goBack={goBack}
          isDisabled={isDisabled}
          lockedByEightId={lockedByEightId}
        />
      )}
      <TemplateListContent>
        {loading ? (
          <Loading />
        ) : (
          template &&
          sqlViews &&
          constantGroups &&
          constants &&
          showTables &&
          outputlistObjects && (
            <>
              <TemplateEditContent
                item={template.tables}
                sqlViews={sqlViews}
                constantGroups={constantGroups}
                constants={constants}
                onUpdate={onUpdate}
                showTables={showTables}
                onShowTableRefresh={onShowTableRefresh}
                tableShowTables={template.showTables}
                onTableRemove={onTableRemove}
                onSqlTableRefresh={onSqlTableRefresh}
                tableSqlViews={template.sqlViews}
                outputlistObjects={outputlistObjects}
                onTableSqlViewsUpdate={onTableSqlViewsUpdate}
                isDisabled={isDisabled}
              />
              <DocumentList documents={documents} onRemove={onDocumentRemove} />
              <UploadButton
                mode={IDocumentUploadMode.shiftReportTemplates}
                onUploadSuccess={onUpload}
                id={template.id.toString()}
                disabled={isDisabled}
                currentFileSize={currentFileSize}
              />
              <OutputList
                items={template.outputLists}
                currentOutputListNames={currentOutputListNames}
                onItemsChange={onOutputListNamesChange}
                templateId={template.id}
                disabled={isDisabled}
              />
              <TemplateEditAddTable onAdd={addTable} disabled={isDisabled} />
            </>
          )
        )}
      </TemplateListContent>
    </>
  );
};
