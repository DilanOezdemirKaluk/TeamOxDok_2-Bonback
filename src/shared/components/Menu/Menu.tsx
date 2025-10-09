import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import eXsolut from "../../../assets/images/eXsolut.png";
import HANDBUCH from "../../../assets/images/HANDBUCH.png";
import styles from "./Menu.module.css";
import { Button, Card } from "antd";
import {
  ApartmentOutlined,
  AuditOutlined,
  BorderlessTableOutlined,
  BranchesOutlined,
  FileSearchOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MailOutlined,
  MessageOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  UsergroupDeleteOutlined,
} from "@ant-design/icons";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../Authorization/Authorization";
import { useCurrentWorkgroupId } from "../../api/services/loader/currentUserLoader";
import { useMenuItemCounts } from "../../contexts/MenuItemCountContext ";

interface IMenuProps {
  onHide: () => void;
}

export const Menu: React.FC<IMenuProps> = ({ onHide }) => {
  const hasLogAuth = useAuthorizationCheck(AuthorizationType.EditDeleteLog);
  const hasConfigAuth = useAuthorizationCheck(
    AuthorizationType.EditConfiguration
  );
  const hasCreateTemplateAuth = useAuthorizationCheck(
    AuthorizationType.CreateTemplate
  );

  const { counts: menuItemCounts, fetchCounts } = useMenuItemCounts();

  const location = useLocation();

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => {
      fetchCounts();
    }, 300000);

    return () => clearInterval(interval);
  }, []);
  const navData = [
    {
      sectionName: "SCHICHTRAPPORTE",
      links: [
        {
          to: "/shiftReportList",
          text: "Schichtrapporte",
          icon: <FileSearchOutlined style={{ color: "#b8860b" }} />,
        },
        ...(hasCreateTemplateAuth
          ? [
              {
                to: "/shiftReportListTest",
                text: "Schichtrapporte Test",
                icon: <AuditOutlined style={{ color: "#1e90ff" }} />,
              },
            ]
          : []),
        {
          to: "/templateList",
          text: "Vorlagen",
          icon: <FilterOutlined style={{ color: "#ff8c00" }} />,
        },
      ],
    },
    {
      sectionName: "MITTEILUNGEN",
      links: [
        {
          to: "/disturbanceNoticeList",
          text: (
            <>
              Störmitteilungen
              <span
                className={styles.messagesCount}
                title={`Anzahl ungelesener Störmitteilungen: ${menuItemCounts.disturbanceNoticeCount}`} // Tooltip beim Hover
              >
                {menuItemCounts.disturbanceNoticeCount}
              </span>
            </>
          ),
          icon: <InfoCircleOutlined style={{ color: "#ff0000" }} />,
        },
        {
          to: "/messageList",
          text: (
            <>
              Mitteilungen
              <span
                className={styles.messagesCount}
                title={`Anzahl ungelesener Mitteilungen: ${menuItemCounts.messageCount}`} // Tooltip beim Hover
              >
                {menuItemCounts.messageCount}
              </span>
            </>
          ),
          icon: <MessageOutlined style={{ color: "#1e90ff" }} />,
        },
      ],
    },
    {
      sectionName: "STAMMDATEN",
      links: [
        {
          to: "/sectionList",
          text: "Bereiche",
          icon: <BranchesOutlined style={{ color: "#b8860b" }} />,
        },
        {
          to: "/documentCategoryList",
          text: "Dokumentenarten",
          icon: <ApartmentOutlined style={{ color: "#1e90ff" }} />,
        },
        {
          to: "/constantGroupList",
          text: "Konstanten Gruppen",
          icon: <BorderlessTableOutlined style={{ color: "#b8860b" }} />,
        },
        ...(hasConfigAuth
          ? [
              {
                to: "/reports",
                text: "Berichte",
                icon: <AuditOutlined style={{ color: "#006400" }} />,
              },
            ]
          : []),
        {
          to: "/userList",
          text: "Benutzer",
          icon: <UserOutlined style={{ color: "#ff8c00" }} />,
        },
        {
          to: "/userGroupList",
          text: "Benutzergruppen",
          icon: <UsergroupAddOutlined style={{ color: "#006400" }} />,
        },
        {
          to: "/mailingList",
          text: "Verteilerlisten",
          icon: <MailOutlined style={{ color: "#1e90ff" }} />,
        },
        ...(hasLogAuth
          ? [
              {
                to: "/logList",
                text: "Log",
                icon: <LogoutOutlined style={{ color: "#000080" }} />,
              },
            ]
          : []),
        ...(hasConfigAuth
          ? [
              {
                to: "/configurationList",
                text: "Konfiguration",
                icon: <SettingOutlined style={{ color: "#000080" }} />,
              },
            ]
          : []),
        ...(hasConfigAuth
          ? [
              {
                to: "/lockedUserList",
                text: "Gesperrte Rapporte",
                icon: <UsergroupDeleteOutlined style={{ color: "#000080" }} />,
              },
            ]
          : []),
      ],
    },
  ];

  const isActiveIcon = (linkTo: string) => {
    let currentPath = location.pathname.toLocaleLowerCase();

    if (linkTo === currentPath) {
      return styles.iconActive;
    }

    return styles.icon;
  };

  return (
    <>
      <div className={styles.menu}>
        <Card className={styles.card} bodyStyle={{ padding: "0.5rem" }}>
          {navData.map((section, sectionIndex) => (
            <nav className={styles.nav} key={sectionIndex}>
              <ul>
                <span className={styles.sectionName}>
                  {section.sectionName}
                </span>
                {section.links.map((link, linkIndex) => (
                  <li
                    key={linkIndex}
                    className={
                      location.pathname.toLowerCase() ===
                        link.to.toLowerCase() ||
                      location.pathname
                        .toLowerCase()
                        .startsWith(link.to.toLowerCase() + "/")
                        ? styles.active
                        : ""
                    }
                  >
                    {link.icon &&
                      React.cloneElement(link.icon, {
                        className: isActiveIcon(link.to.toLocaleLowerCase()),
                      })}
                    <Link to={link.to}>{link.text}</Link>
                  </li>
                ))}
                {sectionIndex < navData.length - 1 && (
                  <hr key={`line_${sectionIndex}`} className={styles.line} />
                )}
              </ul>
            </nav>
          ))}
          <div className={styles.hideButton}>
            <Button onClick={() => onHide()}>Menü ausblenden</Button>
          </div>

          <div className={styles.logo}>
            <img
              src={eXsolut}
              alt="eXsolut Logo"
              height={50}
              className={styles.eXsolut}
              style={{ marginRight: "50px" }}
            />
            <a
              href="/HandbuchDokument.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={HANDBUCH} alt="Handbuch öffnen" height={50} />
            </a>
          </div>
        </Card>
      </div>
    </>
  );
};
