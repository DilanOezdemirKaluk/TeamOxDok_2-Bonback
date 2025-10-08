import React, { useState } from "react";
import { Formik, Form, Field, FieldProps, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card, Input, Divider, message, Typography } from "antd";
import { UserOutlined, LockOutlined, WindowsOutlined } from "@ant-design/icons";
import { Loading } from "../../Loading/Loading";
import { LoginButton } from "../LoginButton/LoginButton";
import styles from "./LoginCard.module.css";
import loginService from "../../../api/services/loginService";
import { IUserLoginQueryRequest } from "../../../../models/IUser";
import { useDispatch } from "react-redux";
import { loginFailure, loginSuccess } from "../../../store/redux/action";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Benutzername ist erforderlich"),
  password: Yup.string().required("Passwort ist erforderlich"),
});

export const LoginCard: React.FC = () => {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const onLogIn = async (
    values: { username: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setIsLogin(true);
    const request: IUserLoginQueryRequest = {
      Password: values.password,
      Username: values.username,
    };
    const result = await loginService.login(request);
    try {
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
      dispatch(loginFailure());
      message.error(
        "Bei der Anmeldung ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal."
      );
    } finally {
      setSubmitting(false);
      setIsLogin(false);
    }
  };

  const handlePasswordForget = () => {
    message.info("Diese Funktion ist noch nicht verfügbar.");
  };

  return (
    <Card
      title={<span className={styles.cardTitle}>Anmelden</span>}
      style={{ width: 500 }}
    >
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={onLogIn}
      >
        {({ isSubmitting, touched, errors }) => (
          <Form>
            <Title level={5}>Benutzername</Title>
            <Field name="username">
              {({ field }: FieldProps) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Benutzername"
                  className={
                    touched.username && errors.username ? styles.errorInput : ""
                  }
                />
              )}
            </Field>
            <ErrorMessage
              name="username"
              component="div"
              className={styles.errorMessage}
            />

            <Text
              className={styles.forgotPassword}
              onClick={() =>
                message.info("Diese Funktion ist noch nicht verfügbar.")
              }
            >
              Passwort vergessen?
            </Text>

            <Title level={5}>Passwort</Title>
            <Field name="password">
              {({ field }: FieldProps) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Passwort"
                  className={
                    touched.password && errors.password ? styles.errorInput : ""
                  }
                />
              )}
            </Field>
            <ErrorMessage
              name="password"
              component="div"
              className={styles.errorMessage}
            />

            {isLogin && (
              <div className={styles.loading}>
                <Loading />
              </div>
            )}

            <div className={styles.content}>
              <LoginButton
                text="Anmelden"
                autoFocus
                disabled={isSubmitting}
                htmlType="submit"
              />
            </div>
            <Divider />

            <div className={styles.content}>
              <LoginButton
                icon={<WindowsOutlined />}
                text="Windows Login"
                onClick={() =>
                  message.info("Diese Funktion ist noch nicht verfügbar.")
                }
              />
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};
