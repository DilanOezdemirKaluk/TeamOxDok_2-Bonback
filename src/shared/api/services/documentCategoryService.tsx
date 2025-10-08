import {
  IDocumentCategoryRequest,
  IDocumentCategoryResponse,
  IDocumentCategoryVM,
  DocumentCategoryEditVM,
} from "../../../models/IDocumentCategory";
import { httpClient } from "../httpClient";
import _ from "lodash";

const getAll = async (
  query: IDocumentCategoryRequest
): Promise<IDocumentCategoryVM[]> => {
  const response = await httpClient.post<IDocumentCategoryResponse>(
    "api/documentCategory",
    query
  );
  return getItemsFromResponse(response.data);
};

function getItemsFromResponse(
  response: IDocumentCategoryResponse
): IDocumentCategoryVM[] {
  return _.map(response.documentCategory);
}

const update = async (item: DocumentCategoryEditVM): Promise<DocumentCategoryEditVM> => {
  const result = await httpClient.put<DocumentCategoryEditVM>(`/api/documentCategory`, item);
  return result.data;
};


const create = async (
  item: DocumentCategoryEditVM
): Promise<DocumentCategoryEditVM> => {
  const result = await httpClient.post<DocumentCategoryEditVM>(
    `/api/documentcategory/create`,
    item
  );
  return result.data;
};

const deleteDocumentCategory = async (id: number): Promise<void> => {
  await httpClient.delete<DocumentCategoryEditVM>(`/api/documentcategory/${id}`);
};

const documentCategoryService = {
  getAll,
  update,
  create,
  deleteDocumentCategory,
};

export default documentCategoryService;
