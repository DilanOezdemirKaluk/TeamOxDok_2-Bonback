import { useState } from "react";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { IUserGroupVm, UserGroupEditVm } from "../../../models/IUserGroup";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { useUserGroupLoader } from "../../../shared/api/services/loader/userGroupLoader";
import { UserGroupEdit } from "../Edit/UserGroupEdit";
import userGroupService from "../../../shared/api/services/userGroupService";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { useUserLoader } from "../../../shared/api/services/loader/userLoader";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";

export const UserGroupList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(
    AuthorizationType.CreateConstantGroup
  );
  const hasEditAuth = useAuthorizationCheck(AuthorizationType.ChangeUserGroup);
  const hasDeleteAuth = useAuthorizationCheck(
    AuthorizationType.DeleteUserGroup
  );
  const currentWorkgroupId = useCurrentWorkgroupId();
  const [open, setOpen] = useState(false);
  const { loadingUserGroups, userGroups, reloadUserGroups } =
    useUserGroupLoader();
  const [editUserGroup, setEditUserGroup] = useState<
    UserGroupEditVm | undefined
  >();
  const [search, setSearch] = useState("");

  const { loadingUsers, users, reloadUsers } = useUserLoader();
  const { sections, loadingSections, reloadSections } = useSectionLoader();

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IUserGroupVm, b: IUserGroupVm) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IUserGroupVm, b: IUserGroupVm) =>
        a.description.localeCompare(b.description),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IUserGroupVm) => (
        <AdministrationListButtons
          deleteTitle={"Möchten Sie die Benutzergruppe: {0} wirklich löschen?".replace(
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

  const onEdit = (obj: UserGroupEditVm) => {
    setEditUserGroup(obj);
    setOpen(true);
  };

  const onDelete = async (obj: UserGroupEditVm) => {
    if (obj.id) {
      await userGroupService.deleteUserGroup(obj.id);
      reloadUserGroups();
    }
  };

  const onSave = async (obj: UserGroupEditVm) => {
    if (obj !== undefined) {
      obj.workgroupId = currentWorkgroupId;
      await userGroupService.update(obj);
    }
    setOpen(false);
    setEditUserGroup(undefined);
    reloadUserGroups();
    reloadUsers();
  };

  const filteredUserGroups = userGroups?.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description.toLowerCase().includes(search.toLowerCase())
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
          dataSource={filteredUserGroups}
          columns={columns}
          loading={loadingUserGroups || loadingSections}
        />
        {users && sections && (
          <UserGroupEdit
            open={open}
            onClose={() => {
              setOpen(false);
              setEditUserGroup(undefined);
            }}
            onSave={onSave}
            userGroup={editUserGroup}
            users={users}
            sections={sections}
            onReloadUsers={reloadUsers}
          />
        )}
      </ListContent>
    </>
  );
};
