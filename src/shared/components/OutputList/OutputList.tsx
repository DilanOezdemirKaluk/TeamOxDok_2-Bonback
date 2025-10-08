import React, { useEffect } from "react";
import { IOutputList } from "../../../models/IOutputList";
import { IShiftReportTemplateTableObjectVM } from "../../../models/IShiftReportTemplateTable";
import { OutputListItem } from "../OutputListItem/OutputListItem";
import { LabelField } from "../FormComponents/FormComponents";
import styles from "./OutputList.module.css";
import { Button } from "antd";

interface IOutputListProps {
  items: IOutputList[];
  currentOutputListNames: IShiftReportTemplateTableObjectVM[] | undefined;
  onItemsChange: (items: IOutputList[]) => void;
  templateId: number;
  disabled?: boolean;
}

export const OutputList: React.FC<IOutputListProps> = ({
  items: outputListItems,
  currentOutputListNames,
  onItemsChange,
  templateId,
  disabled,
}) => {
  const [items, setItems] = React.useState<IOutputList[]>(outputListItems);

  const handleAddItem = () => {
    const newItem: IOutputList = {
      description: "",
      objectId: "",
      sortIndex: items.length,
      id: -1,
      shiftReportTemplateId: templateId,
    };
    setItems([...items, newItem]);
  };

  const handleDescriptionChange = (index: number, newDescription: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: newDescription,
    };
    setItems(updatedItems);
  };

  const handleObjectIdChange = (index: number, newObjectId: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], objectId: newObjectId };
    setItems(updatedItems);
  };

  useEffect(() => {
    onItemsChange(items);
  }, [items]);

  return (
    <div className={styles.container}>
      <LabelField title="Ausgabeliste" />
      {items.map((item, index) => (
        <OutputListItem
          key={index}
          item={item}
          currentOutputListNames={currentOutputListNames}
          onDescriptionChange={(newDescription) =>
            handleDescriptionChange(index, newDescription)
          }
          onObjectIdChange={(newObjectId) =>
            handleObjectIdChange(index, newObjectId)
          }
          onDelete={() => {
            const updatedItems = items.filter((_, i) => i !== index);
            setItems(updatedItems);
            onItemsChange(updatedItems);
          }}
        />
      ))}
      <Button disabled={disabled} onClick={handleAddItem}>
        Hinzufügen
      </Button>
    </div>
  );
};
