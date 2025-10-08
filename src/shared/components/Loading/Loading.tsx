import { Spin } from "antd";
import styles from "./Loading.module.css";

export const Loading: React.FC = () => {
  return (
    <>
      <div className={styles.div}>
        <Spin />
      </div>
    </>
  );
};
