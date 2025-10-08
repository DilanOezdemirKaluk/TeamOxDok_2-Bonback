import { IDocument } from "../../../models/IDocument";
import { Image } from "antd";
import { apiConfig } from "../../../shared/api/config";
import styles from "./DocumentList.module.css";
import { DeleteButton } from "../DeleteButton/DeleteButton";
import { LabelField } from "../FormComponents/FormComponents";

interface IDocumentListProps {
  documents: IDocument[];
  onRemove: (id: string) => void;
  showDelete?: boolean;
}

export const DocumentList: React.FC<IDocumentListProps> = ({
  documents,
  onRemove,
  showDelete = true,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className={styles.documentContainer}>
        <LabelField title="Dokumente" />
      </div>
    );
  }

  return (
    <div>
      <LabelField title="Dokumente" />
      {documents.map((document) => (
        <div className={styles.container} key={document.id}>
          {document.mimeType.includes("image") ? (
            <Image
              width={showDelete && !document.fromTemplate ? 980 : 1070}
              src={`${apiConfig.baseURL}/api/document/${document.id}`}
              alt={`Dokument ${document.id}`}
            />
          ) : (
            <a
              href={`${apiConfig.baseURL}/api/document/${document.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {document.fileName}
            </a>
          )}
          {showDelete && !document.fromTemplate && (
            <DeleteButton onClick={() => onRemove(document.id)} />
          )}
        </div>
      ))}
    </div>
  );
};
