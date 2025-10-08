import React, { useEffect, useState } from "react";
import { Transfer } from "antd";
import { ISectionVM } from "../../../models/ISection";
import styles from "./SectionTransfer.module.css";

interface ISectionTransferProps {
  sections: ISectionVM[];
  selectedSections: ISectionVM[] | undefined;
  onChange: (ids: string[]) => void;
}

export const SectionTransfer: React.FC<ISectionTransferProps> = ({
  sections,
  selectedSections,
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
    const formattedData = sections.map((obj) => ({
      key: obj.id.toString(),
      title: obj.name ?? "",
      description: obj.description ?? "",
    }));

    setDataSource(formattedData);

    if (selectedSections) {
      const selectedKeys = selectedSections.map((obj) => obj.id.toString());
      setTargetKeys(selectedKeys);
    } else {
      setTargetKeys([]);
    }
  }, [sections, selectedSections]); // Abhängigkeiten angegeben

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
      render={(item) => item.title ?? ""}
      className={styles.transfer}
    />
  );
};
