import { httpClient } from "../httpClient";

const deleteDocument = async (id: string, mode: string): Promise<number> => {
  try {
    const result = await httpClient.delete<number>(
      `api/document/${id}?mode=${mode}`
    );
    return result.data;
  } catch (error) {
    throw error;
  }
};

const documentService = {
  deleteDocument,
};

export default documentService;
