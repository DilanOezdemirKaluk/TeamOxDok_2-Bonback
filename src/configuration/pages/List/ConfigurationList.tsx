import { useState, useEffect } from "react";
import { IConfigurationTypes } from "../../../models/IConfiguration";
import { useConfigurationLoader } from "../../../shared/api/services/loader/configurationLoader";
import { ActionButton } from "../../../shared/components/ActionButton/ActionButton";
import { InputField } from "../../../shared/components/InputField/InputField";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Loading } from "../../../shared/components/Loading/Loading";
import { generateUniqueId } from "../../../shared/globals/global";
import configurationService from "../../../shared/api/services/configurationService";

export interface IConfigurationVM {
  id: number;
  name: string;
  value: string;
}

export const ConfigurationList: React.FC = () => {
  const [config, setConfig] = useState<IConfigurationVM[]>([]);

  const {
    loadingConfigurations,
    configurations: dbConfigurations,
    reloadConfiguration,
  } = useConfigurationLoader();

  const loading = () => loadingConfigurations;

  useEffect(() => {
    if (dbConfigurations) {
      const initialConfig = dbConfigurations.map((dbConfig) => ({
        id: dbConfig.id,
        name: dbConfig.name,
        value: dbConfig.value,
      }));
      setConfig(initialConfig);
    }
  }, [dbConfigurations]);

  const configurations = Object.entries(IConfigurationTypes)
    .filter(([key, val]) => !isNaN(Number(val)))
    .map(([key, val]) => ({
      key,
      value: val,
    }));

  const handleInputChange = (name: string, value: string) => {
    setConfig((prevConfigurations) => {
      const configExists = prevConfigurations.some(
        (config) => config.name === name
      );
      if (configExists) {
        return prevConfigurations.map((config) =>
          config.name === name ? { ...config, value } : config
        );
      } else {
        const newConfig: IConfigurationVM = {
          id: generateUniqueId(),
          name,
          value,
        };
        return [...prevConfigurations, newConfig];
      }
    });
  };

  const onSave = async () => {
    await configurationService.update(config);
  };

  return (
    <>
      {loading() ? (
        <Loading />
      ) : (
        <ListContent>
          <div>
            <ActionButton title="Speichern" onClick={onSave} />
          </div>
          {configurations.map((configType) => {
            const configItem = config.find((c) => c.name === configType.key);
            const inputValue = configItem ? configItem.value : "";

            return (
              <div key={configType.key}>
                <div>{configType.key}</div>
                <div>
                  <InputField
                    value={inputValue}
                    onChange={(newValue) =>
                      handleInputChange(configType.key, newValue)
                    }
                  />
                </div>
              </div>
            );
          })}
        </ListContent>
      )}
    </>
  );
};
