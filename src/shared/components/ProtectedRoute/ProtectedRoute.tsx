import React from "react";
import { Navigate } from "react-router-dom";
import { AuthorizationType } from "../../../models/IAuthorization";
import useAuthorizationCheck from "../../Authorization/Authorization";

interface ProtectedRouteProps {
  children: React.ReactNode;
  authorization: AuthorizationType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  authorization,
}) => {
  const hasAuth = useAuthorizationCheck(authorization);
  return hasAuth ? <>{children}</> : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
