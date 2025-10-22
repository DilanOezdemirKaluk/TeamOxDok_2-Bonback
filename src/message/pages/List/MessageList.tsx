import { useEffect, useState } from "react";
import {
  IMessageResponse,
  IMessageVM,
  MessageEditVm,
} from "../../../models/IMessage";
import { ISectionVM } from "../../../models/ISection";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Loading } from "../../../shared/components/Loading/Loading";
import { SectionMultiSelect } from "../../../shared/components/SectionMultiSelect/SectionMultiSelect";
import styles from "./MessageList.module.css";
import { OverviewTable } from "../../../shared/components/OverviewTable/OverviewTable";
import { AdministrationListButtons } from "../../../shared/components/AdministrationListButtons/AdministrationListButtons";
import { useMessageLoader } from "../../../shared/api/services/loader/messageLoader";
import { useMessageSectionLoader } from "../../../shared/api/services/loader/messageSectionLoader";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { MessageListEdit } from "../Edit/MessageListEdit";
import messageService from "../../../shared/api/services/messageService";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../../shared/Authorization/Authorization";
import { useSectionLoader } from "../../../shared/api/services/loader/sectionLoader";
import { MessagePopUp } from "../../components/MessagePopUp/MessagePopUp";
import { SearchContent } from "../../../shared/components/SearchContent/SearchContent";
import { formatDate } from "../../../shared/globals/global";
import { EditCheckbox } from "../../../shared/components/EditCheckbox/EditCheckbox";
import { FavoriteHook } from "../../../shared/components/FavoriteHook/FavoiteHook";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";
import { SearchButton } from "../../../shared/components/SearchButton/SearchButton";
import { useCurrentUserId } from "../../../shared/api/services/loader/currentUserLoader";
import { useMenuItemCounts } from "../../../shared/contexts/MenuItemCountContext ";

export const MessageList: React.FC = () => {
  const currentUserId = useCurrentUserId();
  const { fetchCounts } = useMenuItemCounts();

  const hasEditCreateAuth = useAuthorizationCheck(
    AuthorizationType.EditDeleteMessage
  );
  const [sectionIds, setSectionIds] = useState<number[]>([]);
  const { sections, loadingSections } = useMessageSectionLoader();
  const { sections: allSections } = useSectionLoader();
  const [open, setOpen] = useState(false);
  const [editMessage, setEditMessage] = useState<MessageEditVm | undefined>();

  const [popUp, setpopUp] = useState(false);
  const [popUpText, setpopUpText] = useState("");
  const [search, setSearch] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<IMessageResponse>();
  const [onlyValid, setOnlyValid] = useState(true);

  // Kategorisierte Mitteilungen
  const [unreadMessages, setUnreadMessages] = useState<IMessageVM[]>([]);
  const [parameterListMessages, setParameterListMessages] = useState<IMessageVM[]>([]);
  const [parameterChangeMessages, setParameterChangeMessages] = useState<IMessageVM[]>([]);

  const { messages, reloadMessages } = useMessageLoader(sectionIds, onlyValid);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const loading = () => {
    return loadingSections;
  };

  // Funktion zur Kategorisierung der Mitteilungen
  const categorizeMessages = (allMessages: IMessageVM[]) => {
    const paramListKeywords = ['liste', 'wert nicht', 'nicht vorhanden', 'nicht in liste', 'listenprüfung'];
    const paramChangeKeywords = ['maschinenvorgabe', 'parameter', 'änderung', 'vorgabe', 'geändert', 'angepasst'];

    const paramList: IMessageVM[] = [];
    const paramChange: IMessageVM[] = [];

    allMessages.forEach((msg) => {
      const textToCheck = `${msg.description} ${msg.note || ''} ${msg.location || ''}`.toLowerCase();
      
      const hasListKeyword = paramListKeywords.some(keyword => textToCheck.includes(keyword));
      const hasChangeKeyword = paramChangeKeywords.some(keyword => textToCheck.includes(keyword));

      if (hasListKeyword) {
        paramList.push(msg);
      } else if (hasChangeKeyword) {
        paramChange.push(msg);
      }
      // Falls weder noch, kommt die Mitteilung in keine spezielle Kategorie
    });

    return { paramList, paramChange };
  };

  useEffect(() => {
    if (messages) {
      setFilteredMessages(messages);
      
      // Ungelesene Mitteilungen
      setUnreadMessages(messages.unread || []);

      // Alle Mitteilungen zusammenführen für Kategorisierung
      const allMessages = [
        ...(messages.unread || []),
        ...(messages.favorite || []),
        ...(messages.read || [])
      ];

      const { paramList, paramChange } = categorizeMessages(allMessages);
      setParameterListMessages(paramList);
      setParameterChangeMessages(paramChange);
    }
  }, [messages]);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredMessages(messages);
      
      if (messages) {
        setUnreadMessages(messages.unread || []);
        const allMessages = [
          ...(messages.unread || []),
          ...(messages.favorite || []),
          ...(messages.read || [])
        ];
        const { paramList, paramChange } = categorizeMessages(allMessages);
        setParameterListMessages(paramList);
        setParameterChangeMessages(paramChange);
      }
    } else {
      const searchLower = search.trim().toLowerCase();

      const filteredResult: IMessageResponse = {
        unread:
          messages?.unread?.filter((message) =>
            message.description.toLowerCase().includes(searchLower)
          ) || [],
        favorite:
          messages?.favorite?.filter((message) =>
            message.description.toLowerCase().includes(searchLower)
          ) || [],
        read:
          messages?.read?.filter((message) =>
            message.description.toLowerCase().includes(searchLower)
          ) || [],
      };
      setFilteredMessages(filteredResult);

      // Gefilterte Ungelesene
      setUnreadMessages(filteredResult.unread || []);

      // Gefilterte Kategorisierung
      const allFiltered = [
        ...(filteredResult.unread || []),
        ...(filteredResult.favorite || []),
        ...(filteredResult.read || [])
      ];
      const { paramList, paramChange } = categorizeMessages(allFiltered);
      setParameterListMessages(paramList);
      setParameterChangeMessages(paramChange);
    }
  }, [search, messages]);

  const columns = [
    {
      title: "Beschreibung",
      dataIndex: "description",
      key: "description",
      sorter: (a: IMessageVM, b: IMessageVM) =>
        stripHtml(a.description).localeCompare(stripHtml(b.description)),
      render: (text: string) => (
        <span dangerouslySetInnerHTML={{ __html: text }} />
      ),
    },
    {
      title: "Bereich",
      dataIndex: "sections",
      key: "sections",
      render: (groups: ISectionVM[]) => (
        <span>
          {groups && groups.length > 0
            ? groups.map((group) => group.name).join(", ")
            : "Kein Bereich"}
        </span>
      ),
    },
    {
      title: "Aktiv",
      dataIndex: "isActive",
      key: "isActive",
      render: (data: boolean) => <span>{data ? "Ja" : "Nein"}</span>,
    },
    {
      title: "Datum",
      dataIndex: "date",
      key: "date",
      render: (text: string, date: IMessageVM) => formatDate(date.createdAt),
      sorter: (a: IMessageVM, b: IMessageVM) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Aktionen",
      dataIndex: "actions",
      key: "actions",
      width: 150,
      render: (_text: string, obj: IMessageVM) => (
        <div>
          <div className={styles.contentButton}>
            <div className={styles.searchButton}>
              <SearchButton
                onClick={() => {
                  setpopUp(true);
                  setEditMessage(obj);
                  setpopUpText(obj.description);
                }}
              />
            </div>
            <FavoriteHook
              message={obj}
              onFavoriteChange={reloadMessages}
              style={{ marginTop: "10px" }}
            />
            <AdministrationListButtons
              deleteTitle={
                currentUserId === obj?.createdBy
                  ? "Möchten Sie die Mitteilung: {0} wirklich löschen?".replace(
                      "{0}",
                      obj.description
                    )
                  : "Möchten Sie die Mitteilung: {0} als inaktiv setzen?".replace(
                      "{0}",
                      obj.description
                    )
              }
              onEdit={() => onEdit(obj)}
              onDelete={() => onDelete(obj)}
              editAuth={hasEditCreateAuth}
              deleteAuth={hasEditCreateAuth}
            />
          </div>
        </div>
      ),
    },
  ];

  const onEdit = (obj: MessageEditVm) => {
    setEditMessage(obj);
    setOpen(true);
  };

  const onDelete = async (obj: MessageEditVm) => {
    if (obj.id) {
      if (currentUserId === obj.createdBy) {
        await messageService.deleteMessage(obj.id);
      } else {
        await messageService.setInactiveMessage(obj.id);
      }
      reloadMessages();
    }
  };

  const onSectionChange = (sectionIds: number[]) => {
    setSectionIds(sectionIds);
    reloadMessages();
  };

  const onSave = async (obj: MessageEditVm) => {
    await messageService.update(obj);
    setOpen(false);
    setEditMessage(undefined);
    reloadMessages();
  };

  const isCorrect = () => {
    setpopUp(false);
    setEditMessage(undefined);
  };

  useEffect(() => {
    const updateReadStatus = async () => {
      if ((popUp || open) && editMessage) {
        await messageService.updateRead(editMessage);
        fetchCounts();
      }
    };
    updateReadStatus();
  }, [editMessage, popUp, open]);

  return (
    <>
      <ListContent>
        {hasEditCreateAuth && (
          <ActionButton onClick={() => setOpen(true)} title="Hinzufügen" />
        )}
        <SearchContent
          description="Suchen"
          searchPlaceholder="Beschreibung eingeben"
          value={search}
          onChange={setSearch}
        />
        <FieldDescription title="Nur gültige Mitteilungen anzeigen">
          <EditCheckbox
            checked={onlyValid}
            onChecked={(c) => {
              setOnlyValid(c);
              reloadMessages();
            }}
          />
        </FieldDescription>
        {loading() && <Loading />}
        {allSections && sections && (
          <>
            <MessageListEdit
              open={open}
              onClose={() => {
                setOpen(false);
                setEditMessage(undefined);
                reloadMessages();
              }}
              message={editMessage}
              onSave={onSave}
              sections={allSections}
            />
            <div className={styles.descriptionContainer}>Bereiche</div>
            <div className={styles.checkboxTableContainer}>
              <div className={styles.checkboxRow}>
                {loading() ? (
                  <Loading />
                ) : (
                  <SectionMultiSelect
                    sections={sections}
                    onChange={onSectionChange}
                  />
                )}
              </div>
            </div>
            
            <div className={styles.descriptionContainer}>Ungelesene Mitteilungen</div>
            <OverviewTable
              dataSource={unreadMessages}
              columns={columns}
              pageSize={5}
              loading={loading()}
            />
            
            <div className={styles.descriptionContainer}>Mitteilungen zu Parameteränderungslisten</div>
            <OverviewTable
              dataSource={parameterListMessages}
              columns={columns}
              pageSize={5}
              loading={loading()}
            />
            
            <div className={styles.descriptionContainer}>Mitteilungen zu Parameteränderungen</div>
            <OverviewTable
              dataSource={parameterChangeMessages}
              columns={columns}
              pageSize={5}
              loading={loading()}
            />
            
            <div>
              <MessagePopUp
                obj={editMessage}
                open={popUp}
                title={popUpText}
                onYes={isCorrect}
              />
            </div>
          </>
        )}
      </ListContent>
    </>
  );
};
