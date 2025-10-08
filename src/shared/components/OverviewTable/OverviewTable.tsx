import { Table } from "antd";
import styles from "./OverviewTable.module.css";

interface OverviewTableProps {
  pageSize?: number;
  dataSource: any;
  columns: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  loading?: boolean;
}

export const OverviewTable: React.FC<OverviewTableProps> = ({
  pageSize = 20,
  dataSource,
  columns,
  onChange,
  loading,
}) => {
  return (
    <Table
      pagination={{ defaultPageSize: pageSize }}
      dataSource={dataSource}
      columns={columns}
      rowKey={"id"}
      className={styles.table}
      onChange={onChange}
      loading={loading}
    />
  );
};
