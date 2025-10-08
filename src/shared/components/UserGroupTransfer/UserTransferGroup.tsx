import React, { useEffect, useState } from "react";
import { Transfer } from "antd";
import { IUserGroupVm } from "../../../models/IUserGroup"
import styles from "./UserTransferGroup.module.css";

interface IUserTransferGroupProps {
  usergroups: IUserGroupVm[];
  selectedusergroups: IUserGroupVm[] | undefined;
  onChange: (ids: string[]) => void;
}

export const UserTransferGroup: React.FC<IUserTransferGroupProps> = ({
  usergroups,
  selectedusergroups,
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
    const formattedData = usergroups.map((usergroups) => ({
      key: usergroups.id.toString(),
      title: usergroups.name,
      description: usergroups.name,
    }));

    setDataSource(formattedData);

    if (selectedusergroups) {
      const selectedKeys = selectedusergroups.map((usergroups) => usergroups.id.toString());
      setTargetKeys(selectedKeys);
    } else {
      setTargetKeys([]);
    }
  }, [usergroups, selectedusergroups]);

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
