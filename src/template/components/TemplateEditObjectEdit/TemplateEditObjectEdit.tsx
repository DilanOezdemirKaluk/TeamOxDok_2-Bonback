import { DrawerModule } from "../../../shared/components/DrawerModule/DrawerModule";
import {
  ICalculateObject,
  IObjectFormat,
  IObjectType,
  IShiftReportTemplateTableObjectVM,
  IShiftReportTemplateTableOutputlistObjectsVM,
  ITransferReportObject,
  getIObjectFormatNumericString,
  getIObjectFormatTypename,
  getIObjectTypeFromNumericString,
  getIObjectTypename,
} from "../../../models/IShiftReportTemplateTable";
import { FieldDescription } from "../../../shared/components/FieldDescription/FieldDescription";
import { ActionSelect } from "../../../shared/components/ActionSelect/ActionSelect";
import { InputField } from "../../../shared/components/InputField/InputField";
import { NumericInputField } from "../../../shared/components/NumericInputField/NumericInputField";
import { EditColorPicker } from "../../../shared/components/EditColorPicker/EditColorPicker";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { IConstantGroupVM } from "../../../models/IConstant";
import { useEffect, useState } from "react";
import { PreShiftSelector } from "../../../shared/components/PreShiftSelector/PreShiftSelector";
import { EditCheckbox } from "../../../shared/components/EditCheckbox/EditCheckbox";
import { DeleteOutlined } from "@ant-design/icons";
import { IconButton } from "../../../shared/components/IconButton/IconButton";
import { Property } from "csstype";

interface ITemplateEditObjectEditProps {
  open: boolean;
  onClose: () => void;
  item: IShiftReportTemplateTableObjectVM;
  onSave: (obj: IShiftReportTemplateTableObjectVM) => void;
  constantGroups: IConstantGroupVM[];
  outputlistObjects: IShiftReportTemplateTableOutputlistObjectsVM;
  currentOutputlistObjects: IShiftReportTemplateTableObjectVM[];
}

export const TemplateEditObjectEdit: React.FC<ITemplateEditObjectEditProps> = ({
  open,
  onClose,
  item,
  onSave,
  constantGroups,
  outputlistObjects,
  currentOutputlistObjects,
}) => {
  const [currentItem, setCurrentItem] = useState(item);
  const [transferObject, setTransferObject] = useState<ITransferReportObject>({
    column: "",
    onlyCurrent: true,
    documentCategoryId: "",
    shift: "",
  });
  const [calculateObject, setCalculateObject] = useState<ICalculateObject>({
    sum: false,
    valueA: "",
    valueB: "",
    operator: "+",
    values: [],
  });
  const [alignment, setAlignment] = useState<Property.TextAlign>(
    item.alignment
  );

  const getTypeOptions = (): { label: string; value: string }[] => {
    const options = (
      Object.keys(IObjectType) as Array<keyof typeof IObjectType>
    )
      .filter(
        (key) =>
          !isNaN(Number(IObjectType[key])) &&
          IObjectType[key] !== IObjectType.SqlView &&
          IObjectType[key] !== IObjectType.Undefined
      )
      .map((key) => ({
        label: getIObjectTypename(key),
        value: IObjectType[key].toString(),
      }));

    return options as { label: string; value: string }[];
  };

  const getConstantGroupOptions = (): { label: string; value: string }[] => {
    return constantGroups.map((c) => ({
      label: c.name,
      value: c.id.toString(),
    }));
  };

  const getFormatOptions = (): { label: string; value: string }[] => {
    const options = (
      Object.keys(IObjectFormat) as Array<keyof typeof IObjectFormat>
    )
      .filter(
        (key) =>
          !isNaN(Number(IObjectFormat[key])) &&
          IObjectFormat[key] !== IObjectFormat.Undefined
      )
      .map((key) => ({
        label: getIObjectFormatTypename(key),
        value: IObjectFormat[key].toString(),
      }));
    return options as { label: string; value: string }[];
  };

  const getOutputlistTemplates = () => {
    const result = outputlistObjects.templates.map((item) => ({
      key: item.id,
      label: item.name,
      value: item.documentCategory.id.toString(),
    }));

    return result;
  };

  const getOutputlistColumns = () => {
    const result = outputlistObjects.objects
      .filter(
        (obj) =>
          obj.table.template.documentCategory.id.toString() ===
          transferObject.documentCategoryId
      )
      .map((item) => ({
        key: item.id,
        label: item.outputlistName,
        value: item.id.toString(),
      }));

    return result;
  };

  const getAlignmentItems = () => {
    return [
      {
        key: "left",
        label: "Links",
        value: "left",
      },
      {
        key: "right",
        label: "Rechts",
        value: "right",
      },
      {
        key: "center",
        label: "Mitte",
        value: "center",
      },
    ];
  };

  useEffect(() => {
    if (item.type === IObjectType.TransferFromReport) {
      const parts = item.value.split("$");
      const documentCategoryId: string = parts[1];
      const shift: string = parts[2];
      const column: string = parts[3];
      let onlyInCurrent: boolean;
      if (parts.length > 4) {
        onlyInCurrent = parts[4] === "1";
      } else {
        onlyInCurrent = true;
      }
      setTransferObject({
        documentCategoryId: documentCategoryId,
        shift: shift,
        column: column,
        onlyCurrent: onlyInCurrent,
      });
    }
    if (item.type === IObjectType.Calculation) {
      const parts: string[] = item.value.replace(/\$/g, "").split("+");
      const operator: string = item.value.includes("+") ? "+" : "-";
      if (item.value.toUpperCase().startsWith("$SUM$")) {
        let values = item.value.replace("$SUM$", "");
        let valuesArray = values.split("$").filter((value) => value !== "");
        setCalculateObject({
          operator: "",
          sum: true,
          valueA: "",
          valueB: "",
          values: valuesArray,
        });
      } else {
        const parts: string[] = item.value.replace(/\$/g, "").split(operator);
        const valueA: string = parts[0];
        const valueB: string = parts[1];
        setCalculateObject({
          operator: operator,
          sum: false,
          valueA: valueA,
          valueB: valueB,
          values: [],
        });
      }
    }
  }, [item]);

  useEffect(() => {
    if (currentItem.type === IObjectType.TransferFromReport) {
      const resultString = `$${transferObject.documentCategoryId}$${
        transferObject.shift
      }$${transferObject.column}$${transferObject.onlyCurrent ? "1" : "0"}`;
      setCurrentItem((item) => ({
        ...item,
        value: resultString,
      }));
    }
  }, [transferObject]);

  useEffect(() => {
    if (currentItem.type === IObjectType.Calculation) {
      let resultString = `$${calculateObject.valueA}$${calculateObject.operator}$${calculateObject.valueB}$`;
      if (calculateObject.sum) {
        resultString =
          "$SUM$" + calculateObject.values.map((v) => `$${v}`).join("");
      }
      setCurrentItem((item) => ({
        ...item,
        value: resultString,
      }));
    }
  }, [calculateObject]);

  const getCalculateOperator = () => {
    return [
      {
        key: "+",
        label: "+",
        value: "+",
      },
      {
        key: "-",
        label: "-",
        value: "-",
      },
    ];
  };

  const getCurrentOutputlistObjectSelectItems = () => {
    const result = currentOutputlistObjects.map((item) => ({
      key: item.outputlistName,
      label: item.outputlistName,
      value: item.outputlistName,
    }));
    return result;
  };

  const getControls = (type: IObjectType) => {
    switch (type) {
      case IObjectType.LOV:
      case IObjectType.Selection:
        return (
          <FieldDescription title="Konstanten Gruppe">
            <ActionSelect
              onChange={(value) => {
                setCurrentItem((item) => ({ ...item, type, value }));
              }}
              defaultValue={currentItem.value}
              options={getConstantGroupOptions()}
            />
          </FieldDescription>
        );
      case IObjectType.Label:
        return (
          <>
            <FieldDescription title="Inhalt">
              <InputField
                value={currentItem.value}
                width={200}
                onChange={(value) =>
                  setCurrentItem((item) => ({ ...item, value }))
                }
              />
            </FieldDescription>
            <FieldDescription title="Schriftgröße">
              <NumericInputField
                value={currentItem.fontSize.toString()}
                width={40}
                maxLength={2}
                onChange={(v) =>
                  setCurrentItem((item) => ({
                    ...item,
                    fontSize: parseInt(v),
                  }))
                }
              />
            </FieldDescription>
            <FieldDescription title="Textfarbe">
              <EditColorPicker
                onChange={(c) =>
                  setCurrentItem((item) => ({ ...item, backgroundColor: c }))
                }
                color={currentItem.backgroundColor}
              />
            </FieldDescription>
          </>
        );
      case IObjectType.Input:
        return (
          <>
            <FieldDescription title="Eingabelänge">
              <NumericInputField
                value={currentItem.inputLength.toString()}
                maxLength={4}
                onChange={(v) =>
                  setCurrentItem((item) => ({
                    ...item,
                    inputLength: parseInt(v),
                  }))
                }
              />
            </FieldDescription>
            <FieldDescription title="Format">
              <ActionSelect
                onChange={(value) =>
                  setCurrentItem((item) => ({
                    ...item,
                    format: getIObjectFormatNumericString(value),
                  }))
                }
                defaultValue={currentItem.format.toString()}
                options={getFormatOptions()}
              />
            </FieldDescription>
          </>
        );
      case IObjectType.TransferFromReport:
        return (
          <>
            <FieldDescription title="Schichtrapport">
              <ActionSelect
                onChange={(value) =>
                  setTransferObject((item) => ({
                    ...item,
                    documentCategoryId: value,
                  }))
                }
                defaultValue={transferObject.documentCategoryId}
                options={getOutputlistTemplates()}
              />
            </FieldDescription>
            <FieldDescription title="Schicht">
              <PreShiftSelector
                onChange={(value) =>
                  setTransferObject((item) => ({
                    ...item,
                    shift: value,
                  }))
                }
                defaultValue={transferObject.shift}
              />
            </FieldDescription>
            <FieldDescription title="Spalte">
              <ActionSelect
                onChange={(value) =>
                  setTransferObject((item) => ({
                    ...item,
                    column: value,
                  }))
                }
                defaultValue={transferObject.column}
                options={getOutputlistColumns()}
              />
            </FieldDescription>
            {/* <FieldDescription title="Nur im aktuellen Report">
              <EditCheckbox
                onChecked={(value) =>
                  setTransferObject((item) => ({
                    ...item,
                    onlyCurrent: value,
                  }))
                }
                checked={transferObject.onlyCurrent}
              />
            </FieldDescription> */}
          </>
        );
      case IObjectType.Calculation:
        return (
          <>
            <FieldDescription title="Summieren">
              <EditCheckbox
                onChecked={(value) =>
                  setCalculateObject((item) => ({
                    ...item,
                    sum: value,
                  }))
                }
                checked={calculateObject.sum}
              />
            </FieldDescription>
            {calculateObject.sum ? (
              <>
                <FieldDescription title="">
                  {calculateObject.values.map((v, index) => (
                    <>
                      <ActionSelect
                        onChange={(value) =>
                          setCalculateObject((prevItem) => ({
                            ...prevItem,
                            values: [...prevItem.values, value],
                          }))
                        }
                        defaultValue={v}
                        options={getCurrentOutputlistObjectSelectItems()}
                      />
                      <IconButton
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setCalculateObject((prevItem) => ({
                            ...prevItem,
                            values: prevItem.values.filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                      />
                    </>
                  ))}
                  <ActionSelect
                    onChange={(value) =>
                      setCalculateObject((prevItem) => ({
                        ...prevItem,
                        values: [...prevItem.values, value],
                      }))
                    }
                    defaultValue={""}
                    options={getCurrentOutputlistObjectSelectItems()}
                  />
                </FieldDescription>
              </>
            ) : (
              <FieldDescription title="">
                <ActionSelect
                  onChange={(value) =>
                    setCalculateObject((item) => ({
                      ...item,
                      valueA: value,
                    }))
                  }
                  defaultValue={calculateObject.valueA}
                  options={getCurrentOutputlistObjectSelectItems()}
                  width={120}
                />
                <ActionSelect
                  onChange={(value) =>
                    setCalculateObject((item) => ({
                      ...item,
                      operator: value,
                    }))
                  }
                  defaultValue={calculateObject.operator}
                  options={getCalculateOperator()}
                  width={60}
                />
                <ActionSelect
                  onChange={(value) =>
                    setCalculateObject((item) => ({
                      ...item,
                      valueB: value,
                    }))
                  }
                  defaultValue={calculateObject.valueB}
                  options={getCurrentOutputlistObjectSelectItems()}
                  width={120}
                />
              </FieldDescription>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentItem.type) {
      case IObjectType.LOV:
      case IObjectType.Selection:
        const constantGroup = constantGroups.find(
          (c) => c.id.toString() === currentItem.value
        );
        if (constantGroup) {
          return `Konstanten Gruppe: ${constantGroup.name}`;
        }
        return "";
      case IObjectType.Label:
        return `Label: ${currentItem.value}`;
      case IObjectType.Input:
        return "Eingabefeld";
      case IObjectType.Blank:
        return "Leeres Feld";
      case IObjectType.Calculation:
        return "Berechnung";
      case IObjectType.TransferFromReport:
        return "Übertrag vom Schichtreport";
      default:
        return "";
    }
  };

  return (
    <>
      <DrawerModule
        title={getTitle()}
        open={open}
        onClose={onClose}
        width={500}
      >
        <ActionButton
          onClick={() => {
            onSave(currentItem);
            onClose();
          }}
          title="Übernehmen"
        />
        <FieldDescription title="Feldtyp">
          <ActionSelect
            onChange={(value: string) => {
              const type = getIObjectTypeFromNumericString(value);
              switch (type) {
                case IObjectType.Input:
                  setCurrentItem((item) => ({
                    ...item,
                    type: type,
                    value: "",
                    inputLength: 2000,
                  }));
                  break;
                default:
                  setCurrentItem((item) => ({
                    ...item,
                    type: type,
                    value: "",
                  }));
                  break;
              }
            }}
            defaultValue={currentItem.type.toString()}
            options={getTypeOptions()}
          />
        </FieldDescription>
        {getControls(currentItem.type)}
        <FieldDescription title="Zellenname">
          <InputField
            value={currentItem.outputlistName}
            width={200}
            onChange={(value) =>
              setCurrentItem((item) => ({ ...item, outputlistName: value }))
            }
          />
        </FieldDescription>
        <FieldDescription title="Ausrichtung">
          <ActionSelect
            onChange={(value) => {
              if (value === "center") {
                setAlignment("center");
                setCurrentItem((item) => ({ ...item, alignment: "center" }));
              }
              if (value === "left") {
                setAlignment("left");
                setCurrentItem((item) => ({ ...item, alignment: "left" }));
              }
              if (value === "right") {
                setAlignment("right");
                setCurrentItem((item) => ({ ...item, alignment: "right" }));
              }
            }}
            defaultValue={alignment}
            options={getAlignmentItems()}
          />
        </FieldDescription>
        <FieldDescription title="Umrandung">
          <EditCheckbox
            checked={currentItem.showBorder}
            onChecked={(c) =>
              setCurrentItem((item) => ({ ...item, showBorder: c }))
            }
          />
        </FieldDescription>
      </DrawerModule>
    </>
  );
};
