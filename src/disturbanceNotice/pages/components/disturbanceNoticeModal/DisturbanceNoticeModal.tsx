import { Button, Modal } from "antd";
import React, { PropsWithChildren } from "react";
import { DisturbanceNoticeEditVm } from "../../../../models/IDisturbanceNotice";
import styles from "../disturbanceNoticeModal/DisturbanceNoticeModal.module.css";
import { stateLabels } from "../../../../models/IMessage";
import { formatDateWithTime } from "../../../../shared/globals/global";
import { DocumentList } from "../../../../shared/components/DocumentList/DocumentList";

interface IDisturbanceNoticeModalProps {
  open: boolean;
  onCancel?: () => void;
  disturbanceNotice?: DisturbanceNoticeEditVm;
  showCancel?: boolean;
}

export const DisturbanceNoticeModal: React.FC<
  PropsWithChildren<IDisturbanceNoticeModalProps>
> = ({ open, onCancel, children, disturbanceNotice }) => {
  return (
    <>
      <Modal
        title={disturbanceNotice?.description}
        open={open}
        onCancel={onCancel}
        footer={[
          <div>
            <div className={styles.popup}>
              <div className={styles.headGridContainer}>
                <div>
                  <div className={styles.markedHeader}>Autor</div>
                  <div className={styles.item}>
                    {disturbanceNotice?.createdByName}
                  </div>
                </div>
                <div>
                  <div className={styles.header}>Ort</div>
                  <div className={styles.item}>
                    {disturbanceNotice?.location}
                  </div>
                </div>
                <div>
                  <div className={styles.header}>Status</div>
                  <div className={styles.item}>
                    {disturbanceNotice?.state !== undefined
                      ? stateLabels[disturbanceNotice.state]
                      : ""}
                  </div>
                </div>
                <div>
                  <div className={styles.header}>Aktiv</div>
                  <div className={styles.item}>
                    {disturbanceNotice?.isActive ? "Ja" : "Nein"}
                  </div>
                </div>
              </div>
              <div className={styles.singleContainer}>
                <div className={styles.markedHeader}>Bereich</div>
                <div>{disturbanceNotice?.section?.name}</div>
              </div>
              <div className={styles.infoContainer}>
                <div>
                  <div className={styles.header}>Erstelldatum</div>
                  <div className={styles.item}>
                    {formatDateWithTime(
                      disturbanceNotice?.createdAt ?? new Date()
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.header}>Wem wurde es gemeldet</div>
                  <div className={styles.item}>
                    {disturbanceNotice?.reportTo}
                  </div>
                </div>
              </div>
              <div className={styles.singleContainer}>
                <div className={styles.markedHeader}>Titel</div>
                <div>{disturbanceNotice?.description?.toString()}</div>
              </div>
              <div className={styles.singleContainer}>
                <div className={styles.markedHeader}>Text</div>
                <div>{disturbanceNotice?.note?.toString()} </div>
              </div>
              <div className={styles.singleContainer}>
                <div className={styles.header}>Auswirkungen</div>
                <div>{disturbanceNotice?.effect?.toString()} </div>
              </div>
              <div className={styles.singleContainer}>
                {disturbanceNotice &&
                  disturbanceNotice.documents &&
                  disturbanceNotice.documents.length > 0 && (
                    <DocumentList
                      documents={disturbanceNotice.documents}
                      onRemove={() => true}
                      showDelete={false}
                    />
                  )}
              </div>
            </div>
            <Button
              key="ok"
              type="primary"
              onClick={onCancel}
              className={styles.closeButton}
            >
              Schließen
            </Button>
          </div>,
        ]}
      >
        {children}
      </Modal>
    </>
  );
};
