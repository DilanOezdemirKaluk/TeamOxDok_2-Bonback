import styles from "./HeadBanner.module.css";
import tkLogo from "../../../assets/images/tk_logo.png";
import logo from "../../../assets/images/TeamSteel.png";
import { IUserLoginQueryResult, IUserVm } from "../../../models/IUser";
import { ActionButton } from "../ActionButton/ActionButton";
import userService from "../../api/services/userService";
import {
  clearReportDocumentCategoryIds,
  loginSuccess,
  logout,
} from "../../store/redux/action";
import { useDispatch, useSelector } from "react-redux";
import { ActionModal } from "../ActionModal/ActionModal";
import { useState } from "react";

interface HeadBannerProps {
  user: IUserVm | null;
}

export const HeadBanner: React.FC<HeadBannerProps> = ({ user }) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const currentUser = useSelector(
    (state: any) => state.user
  ) as IUserLoginQueryResult;
  const dispatch = useDispatch();

  const logOut = () => {
    dispatch(logout());
  };

  const changeWorkgroup = async () => {
    if (user) {
      setIsDialogVisible(true);

      const wk = user.workgroups.find((w) => w.id !== user.defaultWorkgroupId);
      if (wk) {
        user.defaultWorkgroupId = wk.id;
        await userService.changeWorkgroup();
        const updatedUser = { ...currentUser };
        if (updatedUser.user) {
          updatedUser.user.defaultWorkgroupId = wk.id;
        }
        dispatch(clearReportDocumentCategoryIds());
        dispatch(loginSuccess(updatedUser));
      }

      const timeoutId = setTimeout(async () => {
        setIsDialogVisible(false);
        window.location.reload();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  };

  const currentWorkgroupName = () => {
    if (user === null) {
      return "";
    }
    const wk = user.workgroups.find(
      (w) => w.id === currentUser.user?.defaultWorkgroupId
    );
    if (wk === undefined) {
      return "";
    }
    return wk.name;
  };

  return (
    <>
      <ActionModal
        title={"Arbeitsgruppenwechsel"}
        open={isDialogVisible}
        onOk={() => setIsDialogVisible(false)}
        showCancel={false}
      />

      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <img
              src={tkLogo}
              alt="logo"
              height={30}
              className={styles.tklogo}
            />
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.logo}>
              <img
                src={logo}
                alt="logo"
                height={50}
                className={styles.tklogo}
              />
            </div>
          </div>

          <div className={styles.middle}>
            Herzlich Willkommen im OPEX-System. Wir wünschen eine angenehme Schicht!
          </div>

          <div className={styles.right}>
            {user && (
              <div>
                <div className={styles.displayName}>{user.displayName}</div>
                <div className={styles.buttonContainer}>
                  <div className={styles.buttonWorkgroup}>
                    <ActionButton
                      title={currentWorkgroupName()}
                      onClick={() => changeWorkgroup()}
                    />
                  </div>
                  <div className={styles.buttonRohstahl}>
                    <a
                      href="http://tb.exsolut.de/ETM/Modules/TeamBroadcaster/TeamBroadcasterWebClient/TeamBroadcasterWebClient.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ActionButton
                        title="Schicht-Kommunikation"
                        className={styles.buttonLink}
                      />
                    </a>
                  </div>
                  <div>
                    <ActionButton
                      title="Abmelden"
                      className={styles.logout}
                      onClick={() => logOut()}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
