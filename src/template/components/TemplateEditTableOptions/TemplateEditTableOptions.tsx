import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import { IShiftReportTemplateTableVM } from "../../../models/IShiftReportTemplateTable";
import styles from "./TemplateEditTableOptions.module.css";
import { useEffect, useState } from "react";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";

interface ITemplateEditTableOptionsProps {
  show: boolean;
  onClose: () => void;
  tableItem: IShiftReportTemplateTableVM;
  onTableAction: (row: number, option: ModeOptions, rowCount: number) => void;
}

export type ModeOptions = "copy" | "delete";

export const TemplateEditTableOptions: React.FC<
  ITemplateEditTableOptionsProps
> = ({ show, onClose, tableItem, onTableAction: onAction }) => {
  const [currentRow, setCurrentRow] = useState(-1);
  const [selectedMode, setSelectedMode] = useState<ModeOptions | null>(null);
  const [modeRowCount, setModeRowCount] = useState(1);

  const getRowOptions = () => {
    const result = [];
    for (let i = 1; i <= tableItem.rows; i++) {
      result.push({
        label: `${i}`,
        value: i.toString(),
      });
    }
    return result;
  };

  const modes: ModeOptions[] = ["copy", "delete"];
  const getModeOptions = () => {
    const result = modes.map((mode) => ({
      label: mode === "copy" ? "Kopieren" : "Löschen",
      value: mode.toLowerCase(),
    }));
    return result;
  };

  const getModeRowOptions = () => {
    const result = [];
    for (let i = 1; i <= 20; i++) {
      result.push({
        label: `${i}`,
        value: i.toString(),
      });
    }
    return result;
  };

  useEffect(() => {
    if (!show) {
      setCurrentRow(-1);
      setSelectedMode(null);
    }
  }, [show]);

  return (
    <DrawerModule
      title="Tabellenoptionen"
      open={show}
      onClose={() => onClose()}
      width={500}
    >
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Zeile</label>
        </div>
        <div>
          <ActionSelect
            onChange={(value) => setCurrentRow(parseInt(value))}
            defaultValue={currentRow.toString()}
            options={getRowOptions()}
            width={400}
          />
        </div>
      </div>
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Option</label>
        </div>
        <div>
          <ActionSelect
            onChange={(value) => setSelectedMode(value as ModeOptions)}
            defaultValue={selectedMode ? selectedMode.toLowerCase() : ""}
            options={getModeOptions()}
            width={400}
          />
        </div>
      </div>
      {selectedMode === "copy" && (
        <div className={styles.container}>
          <div>
            <label className={styles.label}>Anzahl</label>
          </div>
          <div>
            <ActionSelect
              onChange={(value) => setModeRowCount(parseInt(value))}
              defaultValue={modeRowCount.toString()}
              options={getModeRowOptions()}
              width={400}
            />
          </div>
        </div>
      )}
      <div className={styles.container}>
        {currentRow > 0 && selectedMode && (
          <div className={styles.container}>
            <ActionButton
              title="Anlegen"
              onClick={() => {
                onAction(currentRow, selectedMode, modeRowCount);
                onClose();
              }}
            />
          </div>
        )}
      </div>
    </DrawerModule>
  );
};
