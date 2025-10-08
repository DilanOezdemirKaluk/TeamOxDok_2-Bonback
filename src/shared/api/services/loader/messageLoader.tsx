import messageService from "../messageService";
import { IMessageVM } from "../../../../models/IMessage";
import { useData } from "../../../masterDataHelpers";
import { useCurrentWorkgroupId } from "./currentUserLoader";

export const useMessageLoader = (sectionIds: number[], onlyActive: boolean) => {
  const workgroupId = useCurrentWorkgroupId();

  const loadMessageData = (): Promise<{
    unread: IMessageVM[];
    favorite: IMessageVM[];
    read: IMessageVM[];
  }> => {
    const messagesResult = messageService.getAll({
      workgroupId: workgroupId,
      sectionIds: sectionIds,
      onlyActive,
    });
    return messagesResult;
  };

  const {
    data: messages,
    loading: loadingMessages,
    triggerReload: reloadMessages,
  } = useData<{
    unread: IMessageVM[];
    favorite: IMessageVM[];
    read: IMessageVM[];
  }>("loadMessageData", () => loadMessageData());

  return { messages, loadingMessages, reloadMessages };
};
