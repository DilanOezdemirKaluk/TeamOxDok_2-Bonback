import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { LoginCard } from "./LoginCard/LoginCard";
import { LoginSupport } from "./LoginSupport/LoginSupport";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import loginService from "../../api/services/loginService";
import { message } from "antd";
import { loginSuccess, loginFailure, logout } from "../../store/redux/action";

export const Login: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const queryParams = new URLSearchParams(location.search);
      const stahlwerk = queryParams.get("stahlwerk");
      const eightID = queryParams.get("eightID");
      const hash = queryParams.get("hash");

      if (stahlwerk && eightID && hash) {
        const request = {
          stahlwerk: stahlwerk,
          eightID: eightID,
          hash: hash,
        };

        try {
          dispatch(logout());
          const result = await loginService.autoLogin(request);
          if (result.user !== null) {
            dispatch(loginSuccess(result));
            navigate(`/shiftReportList`);
          } else {
            dispatch(loginFailure());
            message.error(
              "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut."
            );
          }
        } catch (error) {
          console.error("Fehler beim Auto-Login:", error);
        }
      }
    })();
  }, [location.search]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.box}>
          <LoginCard />
        </div>
        <div className={styles.box}>
          <LoginSupport />
        </div>
      </div>
    </>
  );
};
