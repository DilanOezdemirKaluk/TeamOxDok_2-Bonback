import { message } from "antd";

message.config({
  top: 100,
});

export const notifySaveSuccess = (trKey?: string) => {
  message.success(trKey);
};

export const notifyError = (trKey: string) => {
  message.error(trKey);
};

export const notifySaveFailed = () => {
  message.error("Failed");
};
