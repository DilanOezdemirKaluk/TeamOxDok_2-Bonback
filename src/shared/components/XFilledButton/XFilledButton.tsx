import { XFilled } from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";

interface XFilledButtonProps {
  onClick: () => void;
}

export const XFilledButton: React.FC<XFilledButtonProps> = ({ onClick }) => {
  return (
    <ActionButton onClick={onClick}>
      <XFilled style={{ fontSize: '11px' }} />
    </ActionButton>
  );
};
