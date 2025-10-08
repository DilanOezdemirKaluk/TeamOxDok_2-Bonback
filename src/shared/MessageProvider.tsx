import React from 'react';
import { message } from 'antd';

const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export default MessageProvider;
