import { useState } from "react";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import {
  IConstantGroupVM,
  ConstantGroupEditVM,
} from "../../../models/IConstant";
import { useConstantGroupLoader } from "../../../shared/api/services/loader/constantGroupLoader";
import { ConstantGroupListEdit } from "../../Edit/ConstantGroupListEdit";
import constantService from "../../../shared/api/services/constantService";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";

export const ConstantGroupList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(
    AuthorizationType.CreateConstantGroup
  );
  const hasEditAuth = useAuthorizationCheck(
    AuthorizationType.ChangeConstantGroup
  );
  const hasDeleteAuth = useAuthorizationCheck(
    AuthorizationType.DeleteConstantGroup
  );

  const currentWorkgroupId = useCurrentWorkgroupId();
  const [open, setOpen] = useState(false);
  const [editConstantGroup, setEditConstantGroup] = useState<
    ConstantGroupEditVM | undefined
  >();
  const [search, setSearch] = useState("");

  const { loadingConstantGroups, constantGroups, reloadConstantGroups } =
    useConstantGroupLoader();

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IConstantGroupVM, b: IConstantGroupVM) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IConstantGroupVM, b: IConstantGroupVM) =>
        a.description.localeCompare(b.description),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IConstantGroupVM) => (
        <AdministrationListButtons
          deleteTitle={"Möchten Sie den Bereich: {0} wirklich löschen?".replace(
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

  const onEdit = (obj: ConstantGroupEditVM) => {
    setEditConstantGroup(obj);
    setOpen(true);
  };

  const onDelete = async (obj: ConstantGroupEditVM) => {
    if (obj.id) {
      await constantService.deleteConstantGroup(obj.id);
      reloadConstantGroups();
    }
  };

  const onSave = async (obj: ConstantGroupEditVM) => {
    if (editConstantGroup !== undefined) {
      await constantService.updateConstantGroup(obj);
    } else {
      obj.workgroupId = currentWorkgroupId;
      await constantService.createConstantGroup(obj);
    }
    setOpen(false);
    setEditConstantGroup(undefined);
    reloadConstantGroups();
  };

  const filteredConstantGroups = constantGroups?.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
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
          dataSource={filteredConstantGroups}
          columns={columns}
          loading={loadingConstantGroups}
        />
        <ConstantGroupListEdit
          open={open}
          onClose={() => {
            setOpen(false);
            setEditConstantGroup(undefined);
            reloadConstantGroups();
          }}
          constantGroup={editConstantGroup}
          onSave={onSave}
        />
      </ListContent>
    </>
  );
};
