import React, { createContext, ReactNode } from "react";
import { IUserVm } from "../../models/IUser";

export interface IUserInfoContext {
  user?: IUserVm;
}

export const UserInfoContext = createContext<IUserInfoContext>({});

interface UserInfoProviderProps {
  value: IUserInfoContext;
  children: ReactNode;
}

export const UserInfoProvider: React.FC<UserInfoProviderProps> = ({
  value,
  children,
}) => {
  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
};
