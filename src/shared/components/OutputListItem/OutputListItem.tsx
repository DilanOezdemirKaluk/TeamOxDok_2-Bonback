import React, { useEffect, useState } from "react";
import { IOutputList } from "../../../models/IOutputList";
import { IShiftReportTemplateTableObjectVM } from "../../../models/IShiftReportTemplateTable";
import styles from "./OutputListItem.module.css";
import { InputField } from "../InputField/InputField";
import { TitleField } from "../TitleField/TitleField";
import { IconButton } from "../IconButton/IconButton";
import { DeleteOutlined } from "@ant-design/icons";
import { ActionSelect } from "../ActionSelect/ActionSelect";

interface IOutputListItemProps {
  item: IOutputList | undefined;
  currentOutputListNames: IShiftReportTemplateTableObjectVM[] | undefined;
  onDescriptionChange: (newDescription: string) => void;
  onObjectIdChange: (newObjectId: string) => void;
  onDelete: () => void;
}

export const OutputListItem: React.FC<IOutputListItemProps> = ({
  item,
  currentOutputListNames,
  onDescriptionChange,
  onObjectIdChange,
  onDelete,
}) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    const getOptions = () => {
      const updatedOptions: { label: string; value: string }[] = [];
      if (currentOutputListNames) {
        currentOutputListNames.forEach((item) => {
          updatedOptions.push({
            label: item.outputlistName,
            value: item.id.toString(),
          });
        });
      }
      return updatedOptions;
    };

    setOptions(getOptions());
  }, [currentOutputListNames]);

  const handleDescriptionChange = (value: string) => {
    onDescriptionChange(value);
  };

  const handleObjectIdChange = (value: string) => {
    onObjectIdChange(value);
  };

  return (
    <div className={styles.infoContainerContainer}>
      <div className={styles.infoContainer}>
        <div className={styles.infoField}>
          <TitleField text="Bezeichnung" isBold={true} fontSize={11} />
        </div>
        <InputField
          value={item?.description}
          onChange={handleDescriptionChange}
        />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.infoField}>
          <TitleField text="Spaltenauswahl " isBold={true} fontSize={11} />
        </div>
        <ActionSelect
          onChange={handleObjectIdChange}
          defaultValue={item?.objectId.toString() ?? ""}
          options={options}
        />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.deleteContainer}>
          <IconButton icon={<DeleteOutlined />} onClick={() => onDelete()} />
        </div>
      </div>
    </div>
  );
};
