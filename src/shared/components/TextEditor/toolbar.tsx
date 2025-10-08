import { Button, Space } from "antd";
import { useEditor } from "./editorContext";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
import { ActionButton } from "../ActionButton/ActionButton";
import { useEffect, useState } from "react";
import styles from "./toolbar.module.css";

const Toolbar = () => {
  const { applyCommand } = useEditor();
  const [activeStyles, setActiveStyles] = useState<{ [key: string]: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });

  const updateActiveStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  useEffect(() => {
    updateActiveStyles();
    document.addEventListener("selectionchange", updateActiveStyles);
    return () =>
      document.removeEventListener("selectionchange", updateActiveStyles);
  }, []);

  return (
    <Space>
      <ActionButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          applyCommand("bold");
          updateActiveStyles();
        }}
        icon={<BoldOutlined />}
        className={activeStyles.bold ? styles.buttonbackground : ""}
      />
      <ActionButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          applyCommand("italic");
          updateActiveStyles();
        }}
        icon={<ItalicOutlined />}
        className={activeStyles.italic ? styles.buttonbackground : ""}
      />
      <ActionButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          applyCommand("underline");
          updateActiveStyles();
        }}
        icon={<UnderlineOutlined />}
        className={activeStyles.underline ? styles.buttonbackground : ""}
      />
    </Space>
  );
};

export default Toolbar;
