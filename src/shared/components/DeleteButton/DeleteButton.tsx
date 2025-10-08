import { DeleteOutlined } from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";

interface DeleteButtonProps {
  onClick: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick }) => {
  return (
    <ActionButton danger onClick={onClick}>
      <DeleteOutlined />
    </ActionButton>
  );
};
