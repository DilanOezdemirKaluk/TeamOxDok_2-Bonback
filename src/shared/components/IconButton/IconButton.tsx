import { Button } from "antd";

interface IIconButtonProps {
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}

export const IconButton: React.FC<IIconButtonProps> = ({
  icon,
  onClick,
  disabled,
}) => {
  return (
    <>
      <Button icon={icon} onClick={onClick} disabled={disabled} />
    </>
  );
};
