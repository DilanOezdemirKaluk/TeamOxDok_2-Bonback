import { CaretRightOutlined } from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";

interface CaretRightButtonProps {
  onClick: () => void;
}

export const CaretRightButton: React.FC<CaretRightButtonProps> = ({ onClick }) => {
  return (
    <ActionButton onClick={onClick}>
      <CaretRightOutlined  style={{ fontSize: '17px' }}  />
    </ActionButton>
  );
};
