import { EditOutlined } from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";

interface EditButtonProps {
  onClick: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <ActionButton onClick={onClick}>
      <EditOutlined style={{ fontSize: '16px' }}/>
    </ActionButton>
  );
};
