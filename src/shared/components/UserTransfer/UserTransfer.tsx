import React, { useEffect, useState } from "react";
import { Transfer } from "antd";
import { IUserVm } from "../../../models/IUser";
import styles from "./UserTransfer.module.css";

interface IUserTransferProps {
  users: IUserVm[];
  selectedUsers: IUserVm[] | undefined;
  onChange: (ids: string[]) => void;
}

export const UserTransfer: React.FC<IUserTransferProps> = ({
  users,
  selectedUsers,
  onChange,
}) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<
    {
      key: string;
      title: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    const formattedData = users.map((user) => ({
      key: user.id.toString(),
      title: user.displayName,
      description: user.displayName,
    }));

    setDataSource(formattedData);

    if (selectedUsers) {
      const selectedKeys = selectedUsers.map((user) => user.id.toString());
      setTargetKeys(selectedKeys);
    } else {
      setTargetKeys([]);
    }
  }, [users, selectedUsers]);

  const handleChange = (
    nextTargetKeys: string[],
    direction: string,
    moveKeys: string[]
  ) => {
    setTargetKeys(nextTargetKeys);
    onChange(nextTargetKeys);
  };

  return (
    <Transfer
      dataSource={dataSource}
      titles={["Quelle", "Ziel"]}
      targetKeys={targetKeys}
      onChange={handleChange}
      render={(item) => item.title}
      className={styles.transfer}
    />
  );
};
