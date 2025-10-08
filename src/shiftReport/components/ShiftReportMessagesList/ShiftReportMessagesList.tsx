import React, { useState } from "react";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import {
  IMessageStates,
  IMessageVM,
  stateLabels,
} from "../../../models/IMessage";
import styles from "./ShiftReportMessagesList.module.css";
import { ISectionVM } from "../../../models/ISection";

interface IShiftReportMessagesListProps {
  messages: IMessageVM[] | undefined;
  open: boolean;
  onClose: () => void;
  sections: ISectionVM[] | undefined;
}

export const ShiftReportMessagesList: React.FC<
  IShiftReportMessagesListProps
> = ({ messages: disturbanceNotices, open, onClose, sections }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<IMessageVM | undefined>();

  const columns = [
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IMessageVM, b: IMessageVM) =>
        a.description.localeCompare(b.description),
    },

    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (_text: string, obj: IMessageVM) => (
        <span>{stateLabels[obj.state]}</span>
      ),
    },
  ];

  const getMessages = (state: IMessageStates) => {
    if (disturbanceNotices) {
      return disturbanceNotices.filter((o) => o.state === state);
    }
  };

  return (
    <>
      <DrawerModule
        title="Mitteilungen"
        open={open}
        onClose={() => onClose()}
        width={900}
      >
        <div className={styles.descriptionContainer}>Offen</div>
        <div>
          <OverviewTable
            dataSource={getMessages(IMessageStates.open)}
            columns={columns}
            pageSize={5}
          />
        </div>
        <div className={styles.descriptionContainer}>In Bearbeitung</div>
        <div>
          <OverviewTable
            dataSource={getMessages(IMessageStates.inEdit)}
            columns={columns}
            pageSize={5}
          />
        </div>
      </DrawerModule>
    </>
  );
};
