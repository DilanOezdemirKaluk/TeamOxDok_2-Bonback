import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Login } from "./shared/components/Login/Login";
import { Menu } from "./shared/components/Menu/Menu";
import { HeadBanner } from "./shared/components/HeadBanner/HeadBanner";
import { useEffect, useState } from "react";
import { ShiftReportList } from "./shiftReport/pages/List/ShiftReportList";
import { TemplateList } from "./template/pages/List/TemplateList";
import { SectionList } from "./section/pages/List/SectionList";
import { DocumentCategoryList } from "./documentCategory/pages/List/DocumentCategoryList";
import { ConstantGroupList } from "./constantGroup/pages/List/ConstantGroupList";
import { UserList } from "./user/pages/List/UserList";
import { UserGroupList } from "./userGroup/pages/List/UserGroupList";
import { MailingList } from "./mailing/pages/List/MailingList";
import { DisturbanceNoticeList } from "./disturbanceNotice/pages/List/DisturbanceNoticeList";
import { MessageList } from "./message/pages/List/MessageList";
import deDE from "antd/locale/de_DE";
import { Button, ConfigProvider } from "antd";
import { ShiftReportEdit } from "./shiftReport/pages/Edit/ShiftReportEdit";
import { TemplateEdit } from "./template/pages/Edit/TemplateEdit";
import { LogList } from "./log/pages/List/LogList";
import { ShiftReportPrint } from "./shiftReportPrint/pages/List/ShiftReportPrint";
import { ShiftReportTemplatePrint } from "./shiftReportPrint/pages/List/ShiftReportTemplatePrint.tsx";
import { useDispatch, useSelector } from "react-redux";
import { IUserLoginQueryResult } from "./models/IUser";
import { logout } from "./shared/store/redux/action";
import { AuthorizationType } from "./models/IAuthorization";
import ProtectedRoute from "./shared/components/ProtectedRoute/ProtectedRoute";
import { Unauthorized } from "./unauthorized/pages/Unauthorized";
import { MenuOutlined } from "@ant-design/icons";
import { ConfigurationList } from "./configuration/pages/List/ConfigurationList";
import { LockedUserList } from "./lockedUserList/pages/List/LockedUserList";
import MessageProvider from "./shared/MessageProvider";
import { MenuItemCountProvider } from "./shared/contexts/MenuItemCountContext ";
import { ReportList } from "./reports/Pages/List/ReportList";

function App() {
  const dispatch = useDispatch();
  const user: IUserLoginQueryResult = useSelector((state: any) => state.user);
  const [isPrintPage, setIsPrintPage] = useState(
    window.location.pathname.includes("/print/shiftReportPrint/") ||
      window.location.pathname.includes("/print/shiftReportTemplatePrint/")
  );
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    if (user && user.token && user.expiration) {
      checkTokenValidity(user.expiration, dispatch);
    }
  }, [dispatch, user]);

  const checkTokenValidity = (expire: Date, dispatch: any): void => {
    try {
      const currentDate = new Date();
      if (expire <= currentDate) {
        dispatch(logout());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isAuthenticated = () => {
    if (user === null || user.user === undefined || user.user === null) {
      return false;
    }
    return true;
  };

  const generateRoutes = () => {
    const commonRoutes = [
      <Route key="login" path="/login" element={<Login />} />,
      <Route
        key="unauthorized"
        path="/unauthorized"
        element={<Unauthorized />}
      />,
      <Route
        key="shiftReportList"
        path="/shiftReportList"
        element={<ShiftReportList testMode={false} />}
      />,
      <Route
        key="shiftReportListTest"
        path="/shiftReportListTest"
        element={<ShiftReportList testMode />}
      />,
      <Route
        key="templateList"
        path="/templateList"
        element={<TemplateList />}
      />,
      <Route key="sectionList" path="/sectionList" element={<SectionList />} />,
      <Route
        key="documentCategoryList"
        path="/documentCategoryList"
        element={<DocumentCategoryList />}
      />,
      <Route
        key="constantGroupList"
        path="/constantGroupList"
        element={<ConstantGroupList />}
      />,
      <Route
        key="reports"
        path="/reports"
        element={
          <ProtectedRoute authorization={AuthorizationType.CreateTemplate}>
            <ReportList />
          </ProtectedRoute>
        }
      />,
      <Route key="userList" path="/userList" element={<UserList />} />,
      <Route
        key="userGroupList"
        path="/userGroupList"
        element={<UserGroupList />}
      />,
      <Route key="mailingList" path="/mailingList" element={<MailingList />} />,
      <Route
        key="disturbanceNoticeList"
        path="/disturbanceNoticeList"
        element={<DisturbanceNoticeList />}
      />,
      <Route key="messageList" path="/messageList" element={<MessageList />} />,
      <Route
        key="shiftReportEdit"
        path="/shiftReportList/shiftReportEdit/:id"
        element={<ShiftReportEdit />}
      />,
      <Route key="messageList" path="/messageList" element={<MessageList />} />,
      <Route
        key="shiftReportEdit"
        path="/shiftReportListTest/shiftReportEdit/:id"
        element={<ShiftReportEdit />}
      />,
      <Route
        key="templateEdit"
        path="/templateList/templateEdit/:id"
        element={
          <ProtectedRoute authorization={AuthorizationType.ChangeTemplate}>
            <TemplateEdit />
          </ProtectedRoute>
        }
      />,
      <Route
        key="templateEditByParams"
        path="/templateList/templateEdit/:create/:documentCategoryID/:name"
        element={
          <ProtectedRoute authorization={AuthorizationType.ChangeTemplate}>
            <TemplateEdit />
          </ProtectedRoute>
        }
      />,
      <Route
        key="templateEdit"
        path="/templateList/templateEdit/:id"
        element={
          <ProtectedRoute authorization={AuthorizationType.ChangeTemplate}>
            <TemplateEdit />
          </ProtectedRoute>
        }
      />,
      <Route
        key="logList"
        path="/logList"
        element={
          <ProtectedRoute authorization={AuthorizationType.EditDeleteLog}>
            <LogList />
          </ProtectedRoute>
        }
      />,
      <Route
        key="configurationList"
        path="/configurationList"
        element={
          <ProtectedRoute authorization={AuthorizationType.EditConfiguration}>
            <ConfigurationList />
          </ProtectedRoute>
        }
      />,
      <Route
        key="lockedUserList"
        path="/lockedUserList"
        element={
          <ProtectedRoute authorization={AuthorizationType.EditConfiguration}>
            <LockedUserList />
          </ProtectedRoute>
        }
      />,
    ];

    if (isAuthenticated()) {
      return [
        ...commonRoutes,
        <Route
          path="*"
          key="authenticatedFallback"
          element={<Navigate to="/shiftReportList" />}
        />,
      ];
    } else {
      return [
        <Route key="login" path="/login" element={<Login />} />,
        <Route
          path="*"
          key="unauthenticatedFallback"
          element={<Navigate to="/login" />}
        />,
      ];
    }
  };

  useEffect(() => {
    const handlePrintPageChange = () => {
      setIsPrintPage(
        window.location.pathname.includes("/print/shiftReportPrint/") ||
          window.location.pathname.includes("/print/shiftReportTemplatePrint/")
      );
    };
    window.addEventListener("popstate", handlePrintPageChange);
    handlePrintPageChange();
    return () => {
      window.removeEventListener("popstate", handlePrintPageChange);
      document.body.style.backgroundColor = "#80d2ff";
      document.body.style.backgroundImage = "url('/background.jpg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    };
  }, []);

  useEffect(() => {
    if (isPrintPage) {
      // Für Druckseite weißer Hintergrund
      document.body.style.backgroundColor = "white";
      document.body.style.backgroundImage = "";
    } else {
      // Für alle anderen Seiten: Hintergrundbild
      document.body.style.backgroundColor = ""; // optional, falls du keine Farbe willst
      document.body.style.backgroundImage = "url('/background.jpg')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat"; // optional
    }
  }, [isPrintPage]);

  return (
    <>
      {isPrintPage ? (
        <MessageProvider>
          <ConfigProvider locale={deDE}>
            <MenuItemCountProvider>
              <Router>
                <Routes>
                  <Route
                    path="/print/shiftReportPrint/:id"
                    key="shiftReportPrint"
                    element={<ShiftReportPrint />}
                  />
                  ,
                  <Route
                    path="/print/shiftReportTemplatePrint/:id"
                    key="shiftReportTemplatePrint"
                    element={<ShiftReportTemplatePrint />}
                  />
                  ,
                </Routes>
              </Router>
            </MenuItemCountProvider>
          </ConfigProvider>
        </MessageProvider>
      ) : (
        <MessageProvider>
          <ConfigProvider locale={deDE}>
            {isAuthenticated() && <HeadBanner user={user.user} />}
            <MenuItemCountProvider>
              <Router>
                <div className="container">
                  {isAuthenticated() && (
                    <div
                      className={`menu ${!isMenuOpen ? "menu-collapsed" : ""}`}
                    >
                      <div className="menu-icon">
                        {!isMenuOpen && (
                          <Button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            icon={<MenuOutlined />}
                          />
                        )}
                      </div>
                      {isMenuOpen && (
                        <Menu onHide={() => setIsMenuOpen(false)} />
                      )}
                    </div>
                  )}
                  <div
                    className={isMenuOpen ? "content" : "content-full-width"}
                  >
                    <Routes>{generateRoutes()}</Routes>
                  </div>
                </div>
              </Router>
            </MenuItemCountProvider>
          </ConfigProvider>
        </MessageProvider>
      )}
    </>
  );
}

export default App;
