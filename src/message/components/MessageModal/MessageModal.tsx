import { Button, Modal } from "antd";
import React, { PropsWithChildren } from "react";
import styles from "./MessageModal.module.css";
import { MessageEditVm } from "../../../models/IMessage";
import { formatDateWithTime } from "../../../shared/globals/global";
import { stateLabels } from "../../../models/IMessage";
import { DocumentList } from "../../../shared/components/DocumentList/DocumentList";

interface IMessageModalProps {
  title: string;
  open: boolean;
  onYes: () => void;
  obj?: MessageEditVm;
}

export const MassageModal: React.FC<PropsWithChildren<IMessageModalProps>> = ({
  title,
  open,
  onYes,
  obj,
}) => {
  return (
    <Modal
      title={<span dangerouslySetInnerHTML={{ __html: title }} />}
      open={open}
      onCancel={onYes}
      footer={[
        <Button
          key="Schließen"
          type="primary"
          onClick={onYes}
          className={styles.closeButton}
        >
          Schließen
        </Button>,
      ]}
      className={styles.smallModal}
    >
      <div className={styles.allCenter}>
        <div className={styles.divider}></div>
        <div className={styles.headGridContainer}>
          <div>
            <div className={styles.markedHeader}>Autor</div>
            <div className={styles.item}>{obj?.createdByName?.toString()}</div>
          </div>

          <div>
            <div className={styles.header}>Ort</div>
            <div className={styles.item}>{obj?.location?.toString()}</div>
          </div>

          <div>
            <div className={styles.header}>Status</div>
            <div className={styles.item}>
              {obj?.state !== undefined ? stateLabels[obj.state] : ""}
            </div>
          </div>

          <div>
            <div className={styles.header}>Aktiv</div>
            <div className={styles.item}>{obj?.isActive ? "Ja" : "Nein"}</div>
          </div>
        </div>

        <div className={styles.markedHeader}>Bereich</div>
        <div>
          {obj?.sections?.map((section, index) => (
            <div key={index}>{section.name}</div>
          ))}
        </div>

        <div className={styles.infoContainer}>
          <div>
            <div className={styles.header}>Erstelldatum</div>
            <div className={styles.item}>
              {formatDateWithTime(obj?.createdAt ?? new Date())}
            </div>
          </div>
          <div>
            <div className={styles.header}>Wem wurde es gemeldet</div>
            <div className={styles.item}>{obj?.reportTo?.toString()}</div>
          </div>
        </div>

        <div className={styles.singleContainer}>
          <div className={styles.markedHeader}>Titel</div>
          <div 
              className={styles.displayText} 
              dangerouslySetInnerHTML={{ __html: obj?.description ?? "" }}
          />
        </div>
        <div className={styles.singleContainer}>
          <div className={styles.markedHeader}>Text</div>
          <div 
              className={styles.displayText}
              dangerouslySetInnerHTML={{ __html: obj?.note ?? "" }}
          />
        </div>
        <div className={styles.singleContainer}>
          <div className={styles.markedHeader}>Auswirkungen</div>
          <div 
              className={styles.displayText}
              dangerouslySetInnerHTML={{ __html: obj?.effect ?? "" }}
          />
        </div>

        <div className={styles.singleContainer}>
          {obj?.documents && obj.documents.length > 0 && (
            <DocumentList
              documents={obj.documents}
              onRemove={() => true}
              showDelete={false}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
