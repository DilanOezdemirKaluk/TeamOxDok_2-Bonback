import { Card } from "antd";
import logo from "../../../../assets/images/eXsolut.png";
import styles from "./LoginSupport.module.css";

export const LoginSupport: React.FC = () => {
  return (
    <>
      <div>
        <Card style={{ width: 660 }} className={styles.logo}>
          <img src={logo} alt="eXsolut" width={260} />
        </Card>
      </div>
      <div className={styles.support}>
        <Card style={{ width: 660 }}>
          <div className={styles.supportText}>
            Bitte melden Sie sich bei Ihrem Vorgesetzten. Dieser kann Sie für
            die Schichtrapporte freischalten
          </div>
        </Card>
      </div>
    </>
  );
};
