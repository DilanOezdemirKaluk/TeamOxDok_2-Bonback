import { Checkbox, Row, Col } from "antd";
import {
  AuthorizationType,
  IAuthorizationVM,
  getAuthorizationTranslation,
} from "../../../models/IAuthorization";
import { useEffect, useState } from "react";

interface IAuthorizationSelectProps {
  selectedAuthorization: IAuthorizationVM[] | undefined;
  onChange: (data: IAuthorizationVM[]) => void;
}

export const AuthorizationSelect: React.FC<IAuthorizationSelectProps> = ({
  selectedAuthorization,
  onChange,
}) => {
  const [currentAuthorization, setCurrentAuthorization] = useState<
    IAuthorizationVM[]
  >([]);

  useEffect(() => {
    if (selectedAuthorization && selectedAuthorization.length > 0) {
      setCurrentAuthorization(selectedAuthorization);
    } else {
      const authorizationTypes = Object.entries(AuthorizationType)
        .filter(([key, val]) => !isNaN(Number(val)))
        .map(([key, val]) => ({
          key: key,
          value: val,
        }));
      const result: IAuthorizationVM[] = [];
      authorizationTypes.forEach((a) => {
        result.push({
          authorizationId: a.value.toString(),
          groupId: 0,
          id: 0,
          isGranted: false,
        });
      });
      setCurrentAuthorization(result);
    }
  }, [selectedAuthorization]);

  const handleOnChange = (authorizationId: string, checked: boolean) => {
    const existAuth = currentAuthorization.find(
      (auth) => auth.authorizationId.toString() === authorizationId.toString()
    );

    const filterdAuth = currentAuthorization.filter(
      (a) => a.authorizationId.toString() !== authorizationId.toString()
    );

    filterdAuth.push({
      authorizationId,
      isGranted: checked,
      id: existAuth?.id ?? 0,
      groupId: existAuth?.groupId ?? 0,
    });

    setCurrentAuthorization(filterdAuth);
    onChange(filterdAuth);
  };

  const selectedAuthorizationIds = () => {
    if (currentAuthorization.length > 0) {
      const result = currentAuthorization
        .filter((a) => a.isGranted)
        .map((a) => a.authorizationId.toString());
      return result;
    }
    return [];
  };

  const selectedIds = selectedAuthorizationIds();

  return (
    <div>
      {Object.entries(AuthorizationType)
        .filter(([key, val]) => !isNaN(Number(val)))
        .map(([key, val]) => ({
          key: val.toString(),
          value: val.toString(),
          translatedName: getAuthorizationTranslation(Number(val)),
        }))
        .sort((a, b) => a.translatedName.localeCompare(b.translatedName))
        .map(({ key, value, translatedName }) => (
          <Row key={key}>
            <Col>
              <Checkbox
                checked={selectedIds.includes(value)}
                onChange={(e) => handleOnChange(value, e.target.checked)}
              >
                {translatedName}
              </Checkbox>
            </Col>
          </Row>
        ))}
    </div>
  );
};
