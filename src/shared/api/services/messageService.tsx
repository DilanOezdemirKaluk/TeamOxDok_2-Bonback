import {
  IMessageRequest,
  IMessageResponse,
  IMessageVM,
  MessageEditVm,
} from "../../../models/IMessage";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (
  query: IMessageRequest
): Promise<{
  unread: IMessageVM[];
  favorite: IMessageVM[];
  read: IMessageVM[];
}> => {
  const response = await httpClient.post<IMessageResponse>(
    "api/message/getAll",
    query
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(response: IMessageResponse): {
  unread: IMessageVM[];
  favorite: IMessageVM[];
  read: IMessageVM[];
} {
  return {
    unread: response.unread || [],
    favorite: response.favorite || [],
    read: response.read || [],
  };
}

const update = async (item: MessageEditVm): Promise<MessageEditVm> => {
  const result = await httpClient.put<MessageEditVm>(`/api/message`, item);
  return result.data;
};

const deleteMessage = async (id: string): Promise<void> => {
  await httpClient.delete<MessageEditVm>(`/api/message/${id}`);
};

const setInactiveMessage = async (id: string): Promise<void> => {
  await httpClient.delete<MessageEditVm>(`/api/message/setInactive/${id}`);
};

const updateRead = async (item: MessageEditVm): Promise<MessageEditVm> => {
  const result = await httpClient.post<MessageEditVm>(
    `/api/message/markAsRead`,
    item
  );
  return result.data;
};

const updateFavorite = async (item: MessageEditVm): Promise<MessageEditVm> => {
  const result = await httpClient.post<MessageEditVm>(
    `/api/message/markAsFavorite`,
    item
  );
  return result.data;
};

const removeFavorite = async (id: string): Promise<void> => {
  await httpClient.delete<MessageEditVm>(`/api/message/removeFavorite/${id}`);
};

const messageService = {
  getAll,
  update,
  deleteMessage,
  setInactiveMessage,
  updateRead,
  updateFavorite,
  removeFavorite,
};

export default messageService;
