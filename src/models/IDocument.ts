export interface IDocument {
  id: string;
  fileName: string;
  mimeType: string;
  createdBy: string;
  createdAt: Date;
  fromTemplate: boolean;
}

export enum IDocumentUploadMode {
  disturbanceNotices = 0,
  messages = 1,
  shiftReports = 2,
  shiftReportTemplates = 3,
}
