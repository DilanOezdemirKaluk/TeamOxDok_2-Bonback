import { List } from "antd";
import { IConstantVM } from "../../models/IConstant";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { AuthorizationType } from "../../models/IAuthorization";
import useAuthorizationCheck from "../../shared/Authorization/Authorization";
import styles from "./ConstantList.module.css";

interface ConstantListProps {
  constants: IConstantVM[];
  onSortEnd: (fromIndex: number, toIndex: number) => void;
  onEdit: (item: IConstantVM) => void;
  onDelete: (id: string) => void;
}

export const ConstantList: React.FC<ConstantListProps> = ({
  constants,
  onSortEnd,
  onEdit,
  onDelete,
}) => {
  const hasEditAuth = useAuthorizationCheck(AuthorizationType.ChangeConstant);
  const hasDeleteAuth = useAuthorizationCheck(AuthorizationType.DeleteConstant);

  return (
    <List
      dataSource={constants}
      renderItem={(item, index) => (
        <List.Item>
          <div className={styles.constantListItem}>
            <div>{item.name}</div>
            <div className={styles.constantListActions}>
              {index > 0 && (
                <ArrowUpOutlined
                  onClick={() => onSortEnd(index, index - 1)}
                  className={styles.constantListActionItem}
                />
              )}
              {index < constants.length - 1 && (
                <ArrowDownOutlined
                  onClick={() => onSortEnd(index, index + 1)}
                  className={styles.constantListActionItem}
                />
              )}
              {hasEditAuth && (
                <EditOutlined
                  onClick={() => onEdit(item)}
                  className={styles.constantListActionItem}
                />
              )}
              {hasDeleteAuth && (
                <DeleteOutlined
                  onClick={() => onDelete(item.id)}
                  className={styles.constantListActionItem}
                />
              )}
            </div>
          </div>
        </List.Item>
      )}
    />
  );
};
