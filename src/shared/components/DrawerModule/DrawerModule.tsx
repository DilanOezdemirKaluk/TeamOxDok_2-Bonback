import { PropsWithChildren } from "react";
import styles from "./DrawerModule.module.css";
import { Drawer } from "antd";

interface DrawerModuleProps {
  title: string;
  onClose: () => void;
  open: boolean;
  width?: number;
}

export const DrawerModule: React.FC<PropsWithChildren<DrawerModuleProps>> = ({
  title,
  onClose,
  open,
  children,
  width,
}) => {
  return (
    <>
      <Drawer
        title={title}
        placement="right"
        onClose={onClose}
        open={open}
        className={styles.drawer}
        width={width}
        closeIcon={null}
        bodyStyle={{ padding: 15, paddingTop: 0 }}
      >
        {children}
      </Drawer>
    </>
  );
};
