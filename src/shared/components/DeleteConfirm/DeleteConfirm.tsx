import { Popconfirm } from "antd";
import { DeleteButton } from "../DeleteButton/DeleteButton";

interface DeleteConfirmProps {
  onConfirm: () => void;
  title: string;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  title,
  onConfirm,
}) => {
  return (
    <Popconfirm
      title={title}
      onConfirm={onConfirm}
      okText="Ja"
      cancelText="Nein"
    >
      <DeleteButton onClick={() => true} />
    </Popconfirm>
  );
};
