import React from "react";
import styles from "./ShiftReportInformation.module.css";
import { TitleField } from "../../../shared/components/TitleField/TitleField";
import {
  getShiftString,
  formatDate,
  getShiftDate,
} from "../../../shared/globals/global";
import { IShiftReportEditVM } from "../../../models/IShiftReport";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { IDisturbanceNoticeVM } from "../../../models/IDisturbanceNotice";
import { IMessageStates, IMessageVM } from "../../../models/IMessage";
import { Button } from "antd";
import { formatDateWithTime } from "../../../shared/globals/global";

interface IShiftReportInformationProps {
  item: IShiftReportEditVM;
  onSave: () => void;
  disturbanceNotices: IDisturbanceNoticeVM[] | undefined;
  messages: IMessageVM[] | undefined;
  showDisturbanceNotices: () => void;
  showMessages: () => void;
  authorized: boolean;
  closeDialog: () => void;
  previousShiftId: number;
  nextShiftId: number;
  redirectToShift: (id: number) => void;
  lockedBy: string;
  currentUserId: string;
  lockedByEightId: string;
  isDisabled: boolean;
}

export const ShiftReportInformation: React.FC<IShiftReportInformationProps> = ({
  item,
  onSave,
  disturbanceNotices,
  messages,
  showDisturbanceNotices,
  showMessages,
  authorized,
  closeDialog,
  previousShiftId,
  nextShiftId,
  redirectToShift,
  lockedBy,
  currentUserId,
  lockedByEightId,
  isDisabled,
}) => {
  const openNewWindow = () => {
    const windowFeatures =
      "width=1090,height=600,toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes";
    const newWindow = window.open(
      "/print/shiftReportPrint/" + item.id,
      "_blank",
      windowFeatures
    );
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.scrollTo(0, 1);
      };
    }
  };

  const getDisturbanceNoticesCount = (state: IMessageStates) => {
    if (disturbanceNotices) {
      var result = disturbanceNotices.filter((d) => d.state === state);
      if (result) {
        return result.length;
      }
    }
    return 0;
  };

  const getMessagesCount = (state: IMessageStates) => {
    if (messages) {
      var result = messages.filter((d) => d.state === state);
      if (result) {
        return result.length;
      }
    }
    return 0;
  };

  return (
    <>
      <div className={styles.containertop}>
        {authorized && !isDisabled && (
          <ActionButton title="Speichern" onClick={onSave} />
        )}
        <ActionButton title="Drucken" onClick={() => openNewWindow()} />
        {previousShiftId > 0 && (
          <ActionButton
            title="Vorherige Schicht"
            onClick={() => redirectToShift(previousShiftId)}
          />
        )}
        {nextShiftId > 0 && (
          <ActionButton
            title="Nächste Schicht"
            onClick={() => redirectToShift(nextShiftId)}
          />
        )}
        <ActionButton title="Zurück" onClick={() => closeDialog()} />
        {lockedBy.toString() !== currentUserId.toString() &&
          lockedBy !== "-1" && (
            <div
              className={styles.locked}
            >{`Schichtrapport ist von ${lockedByEightId} gesperrt`}</div>
          )}
      </div>
      <div className={styles.container}>
        <div className={styles.infoContainerContainer}>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Name" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={item.shiftReportTemplate.name}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div
            className={styles.infoContainer}
            style={{
              backgroundColor: item.shiftReportTemplate.documentCategory.color,
            }}
          >
            <div className={styles.infoField}>
              <TitleField text="Dokumentenart" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={item.shiftReportTemplate.documentCategory.name}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Schicht" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={`${getShiftString(item.shiftId)} - ${formatDate(
                getShiftDate(item.shiftId, item.createdAt)
              )}`}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div
            className={`${styles.infoContainer} ${styles.redBorderStörmitteilungen}`}
          >
            <div className={styles.infoField}>
              <TitleField text="Störmitteilungen" isBold={true} fontSize={11} />
            </div>
            <Button onClick={() => showDisturbanceNotices()}>
              {`${getDisturbanceNoticesCount(
                IMessageStates.open
              )} / ${getDisturbanceNoticesCount(IMessageStates.inEdit)}`}
            </Button>
          </div>
        </div>
        <div className={styles.infoContainerContainer}>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Bereich" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={item.shiftReportTemplate.workgroup.name}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Geändert am" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={`${item.changedByName} ${formatDateWithTime(
                item.changedAt
              )}`}
              isBold={false}
              fontSize={11}
            />
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Erstellt am" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={`${item.createdByName} ${formatDateWithTime(
                item.createdAt
              )}`}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div
            className={`${styles.infoContainer} ${styles.redBorderStörmitteilungen}`}
          >
            <div className={styles.infoField}>
              <TitleField text="Mitteilungen" isBold={true} fontSize={11} />
            </div>
            <Button onClick={() => showMessages()}>
              {`${getMessagesCount(IMessageStates.open)} / ${getMessagesCount(
                IMessageStates.inEdit
              )}`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
