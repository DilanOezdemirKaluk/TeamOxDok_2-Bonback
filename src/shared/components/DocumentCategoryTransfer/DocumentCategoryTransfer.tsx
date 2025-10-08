import React, { useEffect, useState } from "react";
import { Transfer } from "antd";
import { DocumentCategoryEditVM } from "../../../models/IDocumentCategory";
import styles from "./DocumentCategoryTransfer.module.css";

interface IDocumentCategoryTransferProps {
  documentCategories: DocumentCategoryEditVM[];
  selectedDocumentCategories: DocumentCategoryEditVM[] | undefined;
  onChange: (ids: string[]) => void;
}

export const DocumentCategoryTransfer: React.FC<
  IDocumentCategoryTransferProps
> = ({ documentCategories, selectedDocumentCategories, onChange }) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<
    {
      key: string;
      title: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    const formattedData = documentCategories.map((cat, index) => ({
      key: (cat.id ?? "").toString(),
      title: cat.name ?? "",
      description: cat.description ?? "",
    }));

    if (selectedDocumentCategories) {
      const selectedKeys = selectedDocumentCategories.map((c) =>
        (c.id ?? "").toString()
      );
      setTargetKeys(selectedKeys);
    } else {
      setTargetKeys([]);
    }

    setDataSource(formattedData);
  }, [documentCategories, selectedDocumentCategories]);

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
