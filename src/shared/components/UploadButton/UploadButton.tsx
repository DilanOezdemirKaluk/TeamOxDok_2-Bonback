import React, { useState } from "react";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import { UploadProps } from "antd/lib/upload";
import { apiConfig } from "../../../shared/api/config";
import { IDocument, IDocumentUploadMode } from "../../../models/IDocument";
import styles from "./UploadButton.module.css";
import { useCurrentUserId } from "../../api/services/loader/currentUserLoader";
import { ErrorModal } from "../ErrorModal/ErrorModal";

interface UploadButtonProps {
  mode: IDocumentUploadMode;
  id: string;
  onUploadSuccess: (document: IDocument, size: number) => void;
  disabled?: boolean;
  currentFileSize?: number;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  mode,
  id,
  onUploadSuccess,
  disabled,
  currentFileSize = 0,
}) => {
  const currentUserId = useCurrentUserId();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [error, setError] = useState(false);
  const [currentTempFileSize, setCurrentTempFileSize] =
    useState(currentFileSize);

  const maxFileSize = 2 * 1024 * 1024;

  const handleUploadChange = (
    info: UploadChangeParam<UploadFile<IDocument>>
  ) => {
    let fileList = [...info.fileList];

    setFileList(fileList);

    if (info.file.status === "done") {
      setFileList([]);
      onUploadSuccess(info.file.response as IDocument, info.file.size ?? 0);
    } else if (info.file.status === "error") {
      console.error(`${info.file.name} file upload failed.`);
    }
  };

  const beforeUpload = (file: UploadFile) => {
    setError(false);
    if (file.size) {
      if (
        file.size > maxFileSize ||
        currentTempFileSize >= maxFileSize ||
        file.size + currentTempFileSize > maxFileSize
      ) {
        setError(true);
        return Upload.LIST_IGNORE;
      } else {
        setCurrentTempFileSize(file.size + currentTempFileSize);
      }
    }
    return true;
  };

  const uploadProps: UploadProps = {
    onChange: handleUploadChange,
    beforeUpload,
    fileList,
    action: `${
      apiConfig.baseURL
    }/api/document/upload?mode=${mode.toString()}&id=${id}&currentUserId=${currentUserId}`,
  };

  return (
    <div className={styles.container}>
      <ErrorModal
        text="Max. Dokumentgröße wurde überschritten (2 MB)"
        open={error}
        onClose={() => setError(false)}
      />
      <Upload {...uploadProps}>
        <Button disabled={disabled} icon={<UploadOutlined />}>
          Hochladen
        </Button>
      </Upload>
    </div>
  );
};
