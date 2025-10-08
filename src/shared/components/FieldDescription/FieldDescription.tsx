import { PropsWithChildren } from "react";
import { TitleField } from "../TitleField/TitleField";
import styles from "./FieldDescription.module.css";

interface IFieldDescriptionProps {
  title: string;
}

export const FieldDescription: React.FC<
  PropsWithChildren<IFieldDescriptionProps>
> = ({ title, children }) => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <TitleField fontSize={11} text={title} />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
};
