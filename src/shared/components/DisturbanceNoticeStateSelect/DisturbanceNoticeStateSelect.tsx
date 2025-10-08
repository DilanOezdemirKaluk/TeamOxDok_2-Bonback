import { DisturbanceNoticeStateType } from "../../../models/IDisturbanceNotice";
import { ActionSelect } from "../ActionSelect/ActionSelect";

interface DisturbanceNoticeStateSelectProps {
  onChange: (id: string) => void;
  defaultValue: string;
}

export const DisturbanceNoticeStateSelect: React.FC<
  DisturbanceNoticeStateSelectProps
> = ({ onChange, defaultValue }) => {
  const getOptions = () => {
    const result = [
      {
        value: "-1",
        label: "Alle",
      },
    ];
    for (const key in DisturbanceNoticeStateType) {
      if (typeof DisturbanceNoticeStateType[key] === "number") {
        let label = "";
        switch (DisturbanceNoticeStateType[key].toString()) {
          case "1":
            label = "Offen";
            break;
          case "2":
            label = "In Bearbeitung";
            break;
          case "3":
            label = "Abgeschlossen";
            break;
          default:
            label = key;
        }

        result.push({
          label: label,
          value: DisturbanceNoticeStateType[key].toString(),
        });
      }
    }
    return result;
  };

  return (
    <ActionSelect
      onChange={onChange}
      defaultValue={defaultValue}
      options={getOptions()}
    />
  );
};
