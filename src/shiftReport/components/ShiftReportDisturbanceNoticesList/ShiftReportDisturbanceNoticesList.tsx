import React, { useState } from "react";
import {
  DisturbanceNoticeEditVm,
  IDisturbanceNoticeVM,
} from "../../../models/IDisturbanceNotice";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { IMessageStates, stateLabels } from "../../../models/IMessage";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import styles from "./ShiftReportDisturbanceNoticesList.module.css";
import { DisturbanceNoticeListEdit } from "../../../disturbanceNotice/pages/Edit/DisturbanceNoticeListEdit";
import { ISectionVM } from "../../../models/ISection";

interface IShiftReportDisturbanceNoticesListProps {
  disturbanceNotices: IDisturbanceNoticeVM[] | undefined;
  open: boolean;
  onClose: () => void;
  sections: ISectionVM[] | undefined;
}

export const ShiftReportDisturbanceNoticesList: React.FC<
  IShiftReportDisturbanceNoticesListProps
> = ({ disturbanceNotices, open, onClose, sections }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [editDisturbanceNotices, setDisturbanceNotices] = useState<
    DisturbanceNoticeEditVm | undefined
  >();

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
        <AdministrationListButtons
          deleteTitle={"Möchten Sie die Mitteilung: {0} wirklich löschen?".replace(
            "{0}",
            obj.description
          )}
          onEdit={() => onEdit(obj)}
          editAuth={false}
          deleteAuth={false}
        />
      ),
    },
  ];

  const onEdit = (obj: DisturbanceNoticeEditVm) => {
    setDisturbanceNotices(obj);
    setOpenEdit(true);
  };

  const getDisturbanceNotices = (state: IMessageStates) => {
    if (disturbanceNotices) {
      return disturbanceNotices.filter((o) => o.state === state);
    }
  };

  return (
    <>
      <DrawerModule
        title="Störmitteilungen"
        open={open}
        onClose={() => onClose()}
        width={900}
      >
        <div className={styles.descriptionContainer}>Offen</div>
        <div>
          <OverviewTable
            dataSource={getDisturbanceNotices(IMessageStates.open)}
            columns={columns}
            pageSize={5}
          />
        </div>
        <div className={styles.descriptionContainer}>In Bearbeitung</div>
        <div>
          <OverviewTable
            dataSource={getDisturbanceNotices(IMessageStates.inEdit)}
            columns={columns}
            pageSize={5}
          />
        </div>
      </DrawerModule>
      {sections && (
        <DisturbanceNoticeListEdit
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setDisturbanceNotices(undefined);
            //   reloadDisturbanceNotices();
          }}
          disturbanceNotice={editDisturbanceNotices}
          onSave={() => true}
          sections={sections}
        />
      )}
    </>
  );
};
