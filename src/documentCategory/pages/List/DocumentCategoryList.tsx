import { useState } from "react";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { ISectionVM } from "../../../models/ISection";
import {
  DocumentCategoryEditVM,
  IDocumentCategoryVM,
} from "../../../models/IDocumentCategory";
import { useDocumentCategoryLoader } from "../../../shared/api/services/loader/documentCategoryLoader";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import { DocumentCategoryListEdit } from "../../Edit/DocumentCategoryListEdit";
import documentCategoryService from "../../../shared/api/services/documentCategoryService";
import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import styles from "./DocumentCategoryList.module.css";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";

export const DocumentCategoryList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(
    AuthorizationType.CreateDocumentCategory
  );
  const hasEditAuth = useAuthorizationCheck(
    AuthorizationType.ChangeDocumentCategory
  );
  const hasDeleteAuth = useAuthorizationCheck(
    AuthorizationType.DeleteDocumentCategory
  );
  const currentWorkgroupId = useCurrentWorkgroupId();
  const [open, setOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(-1);
  const [search, setSearch] = useState("");

  const { loadingSections, sections } = useSectionLoader();
  const {
    documentCategories,
    loadingDocumentCategories,
    reloadDocumentCategories,
  } = useDocumentCategoryLoader(currentSectionId);

  useSectionLoader();

  const [editDocumentCategory, setEditDocumentCategory] = useState<
    DocumentCategoryEditVM | undefined
  >();

  const loading = () => {
    return loadingDocumentCategories || loadingSections;
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IDocumentCategoryVM, b: IDocumentCategoryVM) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IDocumentCategoryVM, b: IDocumentCategoryVM) =>
        a.description.localeCompare(b.description),
    },
    {
      title: "Bereich",
      dataIndex: "section",
      key: "section",
      render: (group: ISectionVM) => (
        <span>{group ? group.name : "Kein Bereich"}</span>
      ),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IDocumentCategoryVM) =>
        obj.name.toLowerCase() !== "gelöscht" && (
          <AdministrationListButtons
            deleteTitle={"Möchten Sie die Dokumentenkategorie: {0} wirklich löschen?".replace(
              "{0}",
              obj.name
            )}
            onEdit={() => onEdit(obj)}
            onDelete={() => onDelete(obj)}
            editAuth={hasEditAuth}
            deleteAuth={hasDeleteAuth}
          />
        ),
    },
  ];

  const getOptions = () => {
    const result = [
      {
        value: "-1",
        label: "Alle",
      },
    ];

    if (sections !== undefined) {
      sections.forEach((category) => {
        result.push({
          label: category.name,
          value: category.id.toString(),
        });
      });
    }

    return result;
  };

  const changeGroup = (value: string) => {
    setCurrentSectionId(parseInt(value));
    reloadDocumentCategories();
  };

  const onEdit = (obj: DocumentCategoryEditVM) => {
    setEditDocumentCategory(obj);
    setOpen(true);
  };

  const onDelete = async (obj: DocumentCategoryEditVM) => {
    if (obj.id) {
      await documentCategoryService.deleteDocumentCategory(obj.id);
      reloadDocumentCategories();
    }
  };

  const onSave = async (obj: DocumentCategoryEditVM) => {
    obj.workgroupId = currentWorkgroupId;
    if (editDocumentCategory !== undefined) {
      await documentCategoryService.update(obj);
    } else {
      obj.id = currentWorkgroupId;
      await documentCategoryService.create(obj);
    }
    setOpen(false);
    setEditDocumentCategory(undefined);
    reloadDocumentCategories();
  };

  const filteredDocumentCategories = documentCategories?.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ListContent>
        {hasCreateAuth && (
          <div className={styles.container}>
            <ActionButton onClick={() => setOpen(true)} title="Hinzufügen" />
          </div>
        )}
        <FieldDescription title="Bereich">
          <ActionSelect
            onChange={changeGroup}
            defaultValue={currentSectionId.toString()}
            options={getOptions()}
          />
        </FieldDescription>
        <SearchContent
          description="Suchen"
          searchPlaceholder="Name eingeben"
          value={search}
          onChange={setSearch}
        />
        <OverviewTable
          dataSource={filteredDocumentCategories}
          columns={columns}
          loading={loading()}
        />
        {sections && (
          <DocumentCategoryListEdit
            open={open}
            onClose={() => {
              setOpen(false);
              setEditDocumentCategory(undefined);
              reloadDocumentCategories();
            }}
            documentCategory={editDocumentCategory}
            onSave={onSave}
            categorys={sections}
          />
        )}
      </ListContent>
    </>
  );
};
