import { useState } from "react";
import { ISectionVM } from "../../../models/ISection";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import { SectionListEdit } from "../../Edit/SectionListEdit";

import sectionService from "../../../shared/api/services/sectionService";
import { SectionEditVM } from "../../../models/ISection";
import { useCurrentWorkgroupId } from "../../../shared/api/services/loader/currentUserLoader";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";

export const SectionList: React.FC = () => {
  const hasCreateAuth = useAuthorizationCheck(AuthorizationType.CreateSection);
  const hasEditAuth = useAuthorizationCheck(AuthorizationType.ChangeSection);
  const hasDeleteAuth = useAuthorizationCheck(AuthorizationType.DeleteSection);
  const currentWorkgroupId = useCurrentWorkgroupId();
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editSection, setSection] = useState<SectionEditVM | undefined>();
  const { sections, loadingSections, reloadSections } = useSectionLoader();

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: ISectionVM, b: ISectionVM) => a.name.localeCompare(b.name),
    },
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: ISectionVM, b: ISectionVM) =>
        a.description.localeCompare(b.description),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: ISectionVM) =>
        obj.name.toLowerCase() !== "gelöscht" && (
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

  const onEdit = (obj: SectionEditVM) => {
    setSection(obj);
    setOpen(true);
  };
  const onDelete = async (obj: SectionEditVM) => {
    if (obj.id) {
      await sectionService.deleteSection(obj.id);
      reloadSections();
    }
  };
  const onSave = async (obj: SectionEditVM) => {
    if (editSection !== undefined) {
      await sectionService.update(obj);
    } else {
      obj.workgroupId = currentWorkgroupId;
      await sectionService.create(obj);
    }
    setOpen(false);
    setSection(undefined);
    reloadSections();
  };

  const filteredSections = sections?.filter((section) =>
    section.name.toLowerCase().includes(search.toLowerCase())
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
          dataSource={filteredSections}
          columns={columns}
          loading={loadingSections}
        />
        <SectionListEdit
          open={open}
          onClose={() => {
            setOpen(false);
            setSection(undefined);
          }}
          selction={editSection}
          onSave={onSave}
        />
      </ListContent>
    </>
  );
};
