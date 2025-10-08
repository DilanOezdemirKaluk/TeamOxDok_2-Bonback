import { SearchOutlined } from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";

interface SearchButtonProps {
  onClick: () => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <ActionButton onClick={onClick}>
      <SearchOutlined />
    </ActionButton>
  );
};
