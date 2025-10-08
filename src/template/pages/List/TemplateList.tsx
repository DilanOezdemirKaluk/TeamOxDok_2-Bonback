import { DocumentCategorySelect } from "../../../shared/components/DocumentCategorySelect/DocumentCategorySelect";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Loading } from "../../../shared/components/Loading/Loading";
import { useDocumentCategoryLoader } from "../../../shared/api/services/loader/documentCategoryLoader";
import { useEffect, useState } from "react";
import { EditCheckbox } from "../../../shared/components/EditCheckbox/EditCheckbox";
import { useShiftReportTemplateLoader } from "../../../shared/api/services/loader/shiftReportTemplate";
import { TemplateTable } from "../../components/TemplateTable/TemplateTable";
import { useNavigate } from "react-router-dom";
import { IShiftReportTemplateVM } from "../../../models/IShiftReportTemplate";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { TemplateAdd } from "../../components/TemplateAdd/TemplateAdd";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import shiftReportTemplateService from "../../../shared/api/services/shiftReportTemplateService";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";

export const TemplateList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(AuthorizationType.CreateTemplate);
  const hasEditAuth = useAuthorizationCheck(AuthorizationType.ChangeTemplate);
  const navigate = useNavigate();
  const [onlyValid, setOnlyValid] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [documentCategoryId, setDocumentCategoryId] = useState("-1");
  const { documentCategories, loadingDocumentCategories } =
    useDocumentCategoryLoader(-1);
  const [search, setSearch] = useState("");
  const [templateData, setTemplateData] = useState<IShiftReportTemplateVM[]>(
    []
  );
  const [filteredTemplateData, setFilteredTemplateData] = useState<
    IShiftReportTemplateVM[]
  >([]);

  const {
    data,
    loading: loadingTemplate,
    triggerReload,
  } = useShiftReportTemplateLoader(documentCategoryId, onlyValid);

  const loading = () => {
    return loadingDocumentCategories || loadingTemplate;
  };

  const onEdit = (obj: IShiftReportTemplateVM) => {
    navigate(`/templateList/templateEdit/${obj.id}`);
  };

  const setValid = async (valid: boolean, obj: IShiftReportTemplateVM) => {
    await shiftReportTemplateService.updateValid(obj.id, valid);
    triggerReload();
  };

  useEffect(() => {
    if (data) {
      setTemplateData(data);
      setFilteredTemplateData(data);
    }
  }, [data]);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredTemplateData(templateData);
    } else {
      const searchLower = search.toLowerCase();
      const filteredData = templateData.filter((template) =>
        [
          template.name,
          template.version ? template.version.toString() : "",
          template.documentCategory
            ? template.documentCategory.name.toLowerCase()
            : "",
        ].some(
          (field) =>
            typeof field === "string" &&
            field.toLowerCase().includes(searchLower)
        )
      );
      setFilteredTemplateData(filteredData);
    }
  }, [search, templateData]);

  return (
    <>
      {loading() ? (
        <Loading />
      ) : (
        <ListContent>
          <FieldDescription title="Dokumentenart">
            {documentCategories && (
              <DocumentCategorySelect
                documentCategories={documentCategories}
                defaultValue={documentCategoryId}
                onChange={(id) => {
                  setDocumentCategoryId(id);
                  triggerReload();
                }}
              />
            )}
          </FieldDescription>
          <FieldDescription title="Nur gültige Vorlagen anzeigen">
            <EditCheckbox
              checked={onlyValid}
              onChecked={(c) => {
                setOnlyValid(c);
                triggerReload();
              }}
            />
          </FieldDescription>
          <SearchContent
            description="Suchen"
            searchPlaceholder="Suchen..."
            value={search}
            onChange={setSearch}
          />
          {hasCreateAuth && (
            <ActionButton onClick={() => setShowAdd(true)} title="Hinzufügen" />
          )}
          {filteredTemplateData && (
            <TemplateTable
              data={filteredTemplateData}
              onEdit={onEdit}
              authorized={hasEditAuth}
              setValid={setValid}
            />
          )}
          <TemplateAdd
            open={showAdd}
            onCancel={() => setShowAdd(false)}
            title="Vorlage hinzufügen"
          />
        </ListContent>
      )}
    </>
  );
};
