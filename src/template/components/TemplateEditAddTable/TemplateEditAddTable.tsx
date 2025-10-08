import React from "react";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import styles from "./TemplateEditAddTable.module.css";
import { ITableObjectType } from "../../../models/IShiftReportTemplateTable";

interface ITemplateEditAddTableProps {
  onAdd: (type: ITableObjectType) => void;
  disabled: boolean;
}

export const TemplateEditAddTable: React.FC<ITemplateEditAddTableProps> = ({
  onAdd,
  disabled,
}) => {
  return (
    <div className={styles.container}>
      <ActionButton
        title="Tabelle hinzufügen"
        onClick={() => onAdd(ITableObjectType.Table)}
        disabled={disabled}
      />
      <ActionButton
        title="SQL View auswählen"
        onClick={() => onAdd(ITableObjectType.DatabaseTable)}
        disabled={disabled}
      />
      <ActionButton
        title="Tabelle anzeigen"
        onClick={() => onAdd(ITableObjectType.ShowTable)}
        disabled={disabled}
      />
    </div>
  );
};
