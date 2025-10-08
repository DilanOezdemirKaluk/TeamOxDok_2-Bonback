import { useState } from "react";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { SectionSingleSelect } from "../../../shared/components/SectionSingleSelect/SectionSingleSelect";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";
import { DisturbanceNoticeStateSelect } from "../../../shared/components/DisturbanceNoticeStateSelect/DisturbanceNoticeStateSelect";
import { IDisturbanceNoticeVM } from "../../../models/IDisturbanceNotice";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import styles from "./DisturbanceNoticeList.module.css";
import { useDisturbanceNoticeLoader } from "../../../shared/api/services/loader/disturbanceNoticeLoader";
import { EditCheckbox } from "../../../shared/components/EditCheckbox/EditCheckbox";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { DisturbanceNoticeListEdit } from "../Edit/DisturbanceNoticeListEdit";
import { DisturbanceNoticeEditVm } from "../../../models/IDisturbanceNotice";
import disturbanceNoticeService from "../../../shared/api/services/disturbanceNoticeService";
import { useDisturbanceNoticeSectionLoader } from "../../../shared/api/services/loader/disturbanceNoticeSectionLoader";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import { stateLabels } from "../../../models/IMessage";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { DisturbanceNoticeModal } from "../components/disturbanceNoticeModal/DisturbanceNoticeModal";
import { useCurrentUserId } from "../../../shared/api/services/loader/currentUserLoader";
import { Loading } from "../../../shared/components/Loading/Loading";
import { SearchButton } from "../../../shared/components/SearchButton/SearchButton";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";
import { useMenuItemCounts } from "../../../shared/contexts/MenuItemCountContext ";

export const DisturbanceNoticeList: React.FC = () => {
  const hasCreateEditAuth = useAuthorizationCheck(
    AuthorizationType.EditDeleteDisturbanceNotice
  );
  const { fetchCounts } = useMenuItemCounts();
  const [open, setOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(-1);
  const [currentState, setCurrentState] = useState("-1");
  const [notRead, setNotRead] = useState(false);
  const currentUserId = useCurrentUserId();
  const [search, setSearch] = useState("");

  const { sections, loadingSections } = useDisturbanceNoticeSectionLoader();
  const { sections: allSections, loadingSections: loadingAllSections } =
    useSectionLoader();
  const {
    disturbanceNotices,
    loadingDisturbanceNotices,
    reloadDisturbanceNotices,
  } = useDisturbanceNoticeLoader(currentSectionId, currentState, notRead);

  const [editDisturbanceNotices, setDisturbanceNotices] = useState<
    DisturbanceNoticeEditVm | undefined
  >();

  const loading = () => {
    return loadingSections || loadingDisturbanceNotices || loadingAllSections;
  };

  const getDisturbanceNotices = (sectionId: number) => {
    const items = disturbanceNotices?.disturbanceNotices.filter(
      (d) => d.section.id === sectionId
    );
    return filterBySearch(items);
  };

  const filterBySearch = (items: IDisturbanceNoticeVM[] | undefined) => {
    if (!items) return [];
    return items.filter((item) =>
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  };

  const columns = [
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IDisturbanceNoticeVM, b: IDisturbanceNoticeVM) =>
        a.description.localeCompare(b.description),
    },

    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (_text: string, obj: IDisturbanceNoticeVM) => (
        <span>{stateLabels[obj.state]}</span>
      ),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IDisturbanceNoticeVM) => (
        <div className={styles.contentButton}>
          <div className={styles.searchButton}>
            <SearchButton
              onClick={() => {
                onSearch(obj);
              }}
            />
          </div>

          <AdministrationListButtons
            deleteTitle={"Möchten Sie die Mitteilung: {0} wirklich löschen?".replace(
              "{0}",
              obj.description
            )}
            onEdit={() => onEdit(obj)}
            onDelete={() => onDelete(obj)}
            editAuth={hasCreateEditAuth}
            deleteAuth={hasCreateEditAuth}
          />
        </div>
      ),
    },
  ];

  const changeGroup = (value: string) => {
    setCurrentSectionId(parseInt(value));
    reloadDisturbanceNotices();
  };

  const changeState = (value: string) => {
    setCurrentState(value);
    reloadDisturbanceNotices();
  };

  const changeNotRead = (value: boolean) => {
    setNotRead(value);
    reloadDisturbanceNotices();
  };

  const onEdit = async (obj: DisturbanceNoticeEditVm) => {
    await disturbanceNoticeService.markAsRead(obj.id ?? "", currentUserId);
    setDisturbanceNotices(obj);
    setOpen(true);
    fetchCounts();
  };

  const onDelete = async (obj: DisturbanceNoticeEditVm) => {
    if (obj.id) {
      await disturbanceNoticeService.deleteisturbanceNotice(obj.id);
      reloadDisturbanceNotices();
    }
  };

  const onSave = async (obj: DisturbanceNoticeEditVm) => {
    await disturbanceNoticeService.update(obj);
    setOpen(false);
    setDisturbanceNotices(undefined);
    reloadDisturbanceNotices();
  };

  const [pop, setpop] = useState(false);

  const onCancel = () => {
    setpop(false);
    reloadDisturbanceNotices();
  };

  const onSearch = async (obj: DisturbanceNoticeEditVm) => {
    await disturbanceNoticeService.markAsRead(obj.id ?? "", currentUserId);
    setDisturbanceNotices(obj);
    setpop(true);
    fetchCounts();
  };

  return (
    <>
      <ListContent>
        {hasCreateEditAuth && (
          <ActionButton onClick={() => setOpen(true)} title="Hinzufügen" />
        )}
        {sections && allSections && (
          <DisturbanceNoticeListEdit
            open={open}
            onClose={() => {
              setOpen(false);
              setDisturbanceNotices(undefined);
              reloadDisturbanceNotices();
            }}
            disturbanceNotice={editDisturbanceNotices}
            onSave={onSave}
            sections={allSections}
          />
        )}
        <FieldDescription title="Bereich">
          {sections && (
            <SectionSingleSelect
              defaultValue={currentSectionId.toString()}
              onChange={changeGroup}
              sections={sections}
            />
          )}
        </FieldDescription>
        <FieldDescription title="Status">
          <DisturbanceNoticeStateSelect
            defaultValue={currentState}
            onChange={changeState}
          />
        </FieldDescription>
        <FieldDescription title="Nicht gelesen">
          <EditCheckbox checked={notRead} onChecked={changeNotRead} />
        </FieldDescription>
        <SearchContent
          description="Suchen"
          searchPlaceholder="Beschreibung eingeben"
          value={search}
          onChange={setSearch}
        />
        {loading() && <Loading />}
        {disturbanceNotices?.sections.map((s) => (
          <>
            <div className={styles.descriptionContainer}>{s.name}</div>
            <OverviewTable
              dataSource={getDisturbanceNotices(s.id)}
              columns={columns}
              pageSize={5}
              loading={loading()}
            />
          </>
        ))}
      </ListContent>
      <DisturbanceNoticeModal
        open={pop}
        onCancel={onCancel}
        disturbanceNotice={editDisturbanceNotices}
      />
    </>
  );
};
