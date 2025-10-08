import { EditButton } from "../../../shared/components/EditButton/EditButton";
import { DeleteConfirm } from "../../../shared/components/DeleteConfirm/DeleteConfirm";
import styles from "./AdministrationListButtons.module.css";

interface AdministrationListButtonsProps {
  onEdit: () => void;
  onDelete?: () => void;
  deleteTitle: string;
  editAuth: boolean;
  deleteAuth: boolean;
}

export const AdministrationListButtons: React.FC<
  AdministrationListButtonsProps
> = ({ onEdit, onDelete, deleteTitle, editAuth, deleteAuth }) => {
  return (
    <div className={styles.actionButtonsContainer}>
      {editAuth && <EditButton onClick={onEdit} />}
      {deleteAuth && onDelete && (
        <DeleteConfirm onConfirm={onDelete} title={deleteTitle} />
      )}
    </div>
  );
};
