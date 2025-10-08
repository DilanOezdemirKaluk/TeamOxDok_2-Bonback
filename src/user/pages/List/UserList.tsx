import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { IUserVm, UserEditVm } from "../../../models/IUser";
import userService from "../../../shared/api/services/userService";
import { useEffect, useState } from "react";
import { UserEdit } from "../Edit/UserEdit";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { useUserLoader } from "../../../shared/api/services/loader/userLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";
import { useUserGroupLoader } from "../../../shared/api/services/loader/userGroupLoader";
import { notifyError } from "../../../shared/notificationHelper";

export const UserList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(AuthorizationType.CreateUser);
  const hasEditAuth = useAuthorizationCheck(AuthorizationType.ChangeUser);
  const hasDeleteAuth = useAuthorizationCheck(AuthorizationType.DeleteUser);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserEditVm | undefined>();
  const { loadingUsers, users, reloadUsers } = useUserLoader();
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState<IUserVm[]>([]);
  const [filterdUserData, setFilterdUserData] = useState<IUserVm[]>([]);
  const { userGroups } = useUserGroupLoader();

  const columns = [
    {
      title: "Vorname",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a: IUserVm, b: IUserVm) =>
        a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Nachname",
      dataIndex: "surname",
      key: "surname",
      sorter: (a: IUserVm, b: IUserVm) => a.surname.localeCompare(b.surname),
    },
    {
      title: "Benutzername",
      dataIndex: "username",
      key: "username",
      sorter: (a: IUserVm, b: IUserVm) => a.username.localeCompare(b.username),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: UserEditVm) => (
        <AdministrationListButtons
          deleteTitle={"Möchten Sie den Benutzer: {0} wirklich löschen?".replace(
            "{0}",
            obj.displayName
          )}
          onEdit={() => onEdit(obj)}
          onDelete={() => onDelete(obj)}
          editAuth={hasEditAuth}
          deleteAuth={hasDeleteAuth}
        />
      ),
    },
  ];

  const onEdit = (obj: UserEditVm) => {
    setEditUser(obj);
    setOpen(true);
  };

  const onDelete = async (obj: UserEditVm) => {
    if (obj.id) {
      await userService.deleteUser(obj.id);
      reloadUsers();
    }
  };

  const onSave = async (obj: UserEditVm) => {
    if (editUser !== undefined) {
      await userService.update(obj);
      if (userData && filterdUserData) {
        const user = userData.find((u) => u.id === obj.id);
        if (user) {
          const updatedSearchResult = filterdUserData.map((mapUser) => {
            if (mapUser.id === user.id) {
              user.firstName = obj.firstName ?? "";
              user.surname = obj.surname ?? "";
              user.username = obj.username ?? "";
              user.workgroups = obj.workgroups;
              user.isActive = obj.isActive ?? true;
              user.groups = obj.groups;
              return user;
            } else {
              return mapUser;
            }
          });
          setFilterdUserData(updatedSearchResult);
        }
      }
    } else {
      var result = await userService.create(obj);
      if (!result.success) {
        notifyError(result.message);
        return;
      }
      reloadUsers();
    }
    setOpen(false);
    setEditUser(undefined);
  };

  useEffect(() => {
    if (users) {
      setFilterdUserData(users);
      setUserData(users);
    }
  }, [users]);

  useEffect(() => {
    if (search.length === 0) {
      setFilterdUserData(userData);
    } else {
      const searchLower = search.trim().toLowerCase();
      const result = userData.filter(
        (user) =>
          user.surname.toLowerCase().startsWith(searchLower) ||
          user.firstName.toLowerCase().startsWith(searchLower) ||
          `${user.firstName.toLowerCase()} ${user.surname.toLowerCase()}`.includes(
            searchLower
          ) ||
          user.username.toLowerCase().startsWith(searchLower)
      );
      setFilterdUserData(result);
    }
  }, [search, userData]);

  return (
    <>
      <ListContent>
        {hasCreateAuth && (
          <ActionButton
            onClick={() => setOpen(true)}
            title="Benutzer hinzufügen"
          />
        )}
        <SearchContent
          description="Suchen"
          searchPlaceholder="Name eingeben"
          value={search}
          onChange={setSearch}
        />
        <OverviewTable
          dataSource={filterdUserData}
          columns={columns}
          loading={loadingUsers}
        />
        <UserEdit
          open={open}
          onClose={() => {
            setOpen(false);
            setEditUser(undefined);
          }}
          user={editUser}
          onSave={onSave}
          userGroups={userGroups}
        />
      </ListContent>
    </>
  );
};
