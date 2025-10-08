import { useSelector } from "react-redux";
import {
  AuthorizationChecker,
  AuthorizationType,
} from "../../models/IAuthorization";
import { useCurrentWorkgroupId } from "../api/services/loader/currentUserLoader";

function useAuthorizationCheck(authorizationType: AuthorizationType): boolean {
  const user = useSelector((state: any) => state.user);
  const currentWorkgroupId = useCurrentWorkgroupId();

  if (!user || !user.user) {
    return false;
  }

  const authorizationChecker = new AuthorizationChecker(user.user);
  return authorizationChecker.hasAuthorization(
    currentWorkgroupId,
    authorizationType
  );
}

export default useAuthorizationCheck;
