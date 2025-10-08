import { Tabs } from "antd";
import { useLogLoader } from "../../../shared/api/services/loader/logLoader";
import { ListContent } from "../../../shared/components/ListContent/ListContent";
import { Loading } from "../../../shared/components/Loading/Loading";
import { LogExceptionList } from "../../components/LogExceptionList/LogExceptionList";
import TabPane from "antd/es/tabs/TabPane";
import { useState } from "react";
import { useMailLogLoader } from "../../../shared/api/services/loader/mailLogLoader";
import { LogEmailList } from "../../components/LogEmailList/LogEmailList";
import logService from "../../../shared/api/services/logService";
import mailLogService from "../../../shared/api/services/mailLogService";

export const LogList: React.FC = () => {
  const { loadingLogs, logs, reloadLogs } = useLogLoader();
  const { loadingMailLogs, mailLogs, reloadMailLogs } = useMailLogLoader();
  const [activeTab, setActiveTab] = useState("1");

  const loading = () => {
    return loadingLogs || loadingMailLogs;
  };

  const onDeleteExceptionLogs = async () => {
    await logService.deleteLogs();
    reloadLogs();
  };

  const onDeleteMailLogs = async () => {
    await mailLogService.deleteLogs();
    reloadMailLogs();
  };

  return (
    <>
      {loading() ? (
        <Loading />
      ) : (
        <ListContent>
          <Tabs activeKey={activeTab} onChange={setActiveTab} tabPosition="top">
            <TabPane tab="Emails" key="1">
              {mailLogs && (
                <LogEmailList logs={mailLogs} onDelete={onDeleteMailLogs} />
              )}
            </TabPane>
            <TabPane tab="Exceptions" key="2">
              {logs && (
                <LogExceptionList
                  logs={logs}
                  onDelete={onDeleteExceptionLogs}
                />
              )}
            </TabPane>
          </Tabs>
        </ListContent>
      )}
    </>
  );
};
