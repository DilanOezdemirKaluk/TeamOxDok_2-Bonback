import {
  IDisturbanceNoticeRequest,
  IDisturbanceNoticeResponse,
  IDisturbanceNoticeVM,
} from "../../../models/IDisturbanceNotice";
import { ISectionVM } from "../../../models/ISection";
import { httpClient } from "../httpClient";
import { DisturbanceNoticeEditVm } from "../../../models/IDisturbanceNotice";
const getAll = async (
  query: IDisturbanceNoticeRequest
): Promise<{
  disturbanceNotices: IDisturbanceNoticeVM[];
  sections: ISectionVM[];
}> => {
  const response = await httpClient.post<IDisturbanceNoticeResponse>(
    "api/disturbanceNotice/getAll",
    query
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(response: IDisturbanceNoticeResponse): {
  disturbanceNotices: IDisturbanceNoticeVM[];
  sections: ISectionVM[];
} {
  return {
    disturbanceNotices: response.disturbanceNotices || [],
    sections: response.sections || [],
  };
}

const update = async (
  item: DisturbanceNoticeEditVm
): Promise<DisturbanceNoticeEditVm> => {
  const result = await httpClient.put<DisturbanceNoticeEditVm>(
    `/api/disturbanceNotice`,
    item
  );
  return result.data;
};

const deleteisturbanceNotice = async (id: string): Promise<void> => {
  await httpClient.delete<DisturbanceNoticeEditVm>(
    `/api/disturbanceNotice/${id}`
  );
};

const markAsRead = async (
  disturbanceNoticeid: string,
  userId: string
): Promise<void> => {
  const result = await httpClient.post<void>(
    `/api/disturbanceNotice/markAsRead`,
    {
      disturbanceNoticeid,
      userId,
    }
  );
  return result.data;
};

const disturbanceNoticeService = {
  getAll,
  update,
  deleteisturbanceNotice,
  markAsRead,
};

export default disturbanceNoticeService;
