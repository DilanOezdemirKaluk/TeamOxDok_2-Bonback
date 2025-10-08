import { useState } from "react";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { IMailingListVm } from "../../../models/IMailingList";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { useMailingListLoader } from "../../../shared/api/services/loader/mailingListLoader";
import { MailingListEdit } from "../Edit/MailingListEdit";
import { MailingListEditVm } from "../../../models/IMailingList";
import mailingListService from "../../../shared/api/services/mailingListService";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { useDocumentCategoryLoader } from "../../../shared/api/services/loader/documentCategoryLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";

export const MailingList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(
    AuthorizationType.CreateMailinglist
  );
  const hasEditAuth = useAuthorizationCheck(
    AuthorizationType.ChangeMailinglist
  );
  const hasDeleteAuth = useAuthorizationCheck(
    AuthorizationType.DeleteMailinglist
  );

  const currentWorkgroupId = useCurrentWorkgroupId();
  const [open, setOpen] = useState(false);
  const [editMailingList, setEditMailingList] = useState<
    MailingListEditVm | undefined
  >();
  const [search, setSearch] = useState("");

  const { loadingMailingLists, mailingLists, reloadMailingLists } =
    useMailingListLoader();
  const { documentCategories, loadingDocumentCategories } =
    useDocumentCategoryLoader(-1);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IMailingListVm, b: IMailingListVm) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IMailingListVm, b: IMailingListVm) =>
        a.description.localeCompare(b.description),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IMailingListVm) => (
        <AdministrationListButtons
          deleteTitle={"Möchten Sie die Verteilerliste: {0} wirklich löschen?".replace(
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
  const onEdit = (obj: MailingListEditVm) => {
    setEditMailingList(obj);
    setOpen(true);
  };

  const onDelete = async (obj: MailingListEditVm) => {
    if (obj.id) {
      await mailingListService.deleteMailingList(obj.id);
      reloadMailingLists();
    }
  };

  const onSave = async (obj: MailingListEditVm) => {
    if (obj !== undefined) {
      obj.workgroupId = currentWorkgroupId;
      await mailingListService.update(obj);
    }
    setOpen(false);
    setEditMailingList(undefined);
    reloadMailingLists();
  };

  const filteredMailingLists = mailingLists?.filter(
    (list) =>
      list.name.toLowerCase().includes(search.toLowerCase()) ||
      list.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ListContent>
        {hasCreateAuth && (
          <ActionButton onClick={() => setOpen(true)} title="Hinzufügen" />
        )}
        <SearchContent
          description="Suchen"
          searchPlaceholder="Name eingeben"
          value={search}
          onChange={setSearch}
        />
        <OverviewTable
          dataSource={filteredMailingLists}
          columns={columns}
          loading={loadingDocumentCategories || loadingMailingLists}
        />
        {documentCategories && (
          <MailingListEdit
            open={open}
            onClose={() => {
              setOpen(false);
              setEditMailingList(undefined);
            }}
            mailingList={editMailingList}
            onSave={onSave}
            documentCategories={documentCategories}
          />
        )}
      </ListContent>
    </>
  );
};
