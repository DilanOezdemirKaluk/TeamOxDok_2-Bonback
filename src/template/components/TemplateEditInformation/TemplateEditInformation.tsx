import React from "react";
import { IShiftReportTemplateVM } from "../../../models/IShiftReportTemplate";
import styles from "./TemplateEditInformation.module.css";
import { InputField } from "../../../shared/components/InputField/InputField";
import { TitleField } from "../../../shared/components/TitleField/TitleField";
import { formatDateWithTime } from "../../../shared/globals/global";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";

interface ITemplateEditInformationProps {
  item: IShiftReportTemplateVM;
  saveVersion: () => void;
  saveNewVersion: () => void;
  goBack: () => void;
  isDisabled: boolean;
  lockedByEightId: string;
}

export const TemplateEditInformation: React.FC<
  ITemplateEditInformationProps
> = ({
  item,
  saveVersion,
  saveNewVersion,
  goBack,
  isDisabled,
  lockedByEightId,
}) => {
  const openNewWindow = () => {
    const windowFeatures =
      "width=1090,height=600,toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes";
    const newWindow = window.open(
      `/print/shiftReportTemplatePrint/${item.id}`,
      "_blank",
      windowFeatures
    );
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.scrollTo(0, 1);
      };
    }
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        {isDisabled === false &&
          (item.id === 0 ? (
            <ActionButton title="Speichern" onClick={() => saveNewVersion()} />
          ) : (
            <>
              <ActionButton
                title="Diese Version speichern"
                onClick={() => saveVersion()}
              />
              <ActionButton
                title="Als neue Version speichern"
                onClick={() => saveNewVersion()}
              />
            </>
          ))}
        <ActionButton title="Druckvorschau" onClick={() => openNewWindow()} />
        <ActionButton title="Zurück" onClick={() => goBack()} />
        {isDisabled && (
          <div
            className={styles.locked}
          >{`Schichtrapport ist von ${lockedByEightId} gesperrt`}</div>
        )}
      </div>
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.infoField}>
            <TitleField text="Name" isBold={true} fontSize={11} />
          </div>
          <InputField
            value={item.name}
            disabled={isDisabled}
            onChange={(text) => (item.name = text)}
          />
        </div>
        <div className={styles.infoContainerContainer}>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Dokumentenart" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={item.documentCategory.name}
              isBold={false}
              fontSize={11}
            />
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.infoField}>
              <TitleField text="Bereich" isBold={true} fontSize={11} />
            </div>
            <TitleField
              text={item.documentCategory.section.name}
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
        </div>
      </div>
    </>
  );
};
