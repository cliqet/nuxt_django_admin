import type { AppListType, ListviewDataType, ModelAdminSettingsType, ModelFieldType } from "~/shared/types/app";
import type { AddRecordResponse } from "~/shared/types/pages/addRecord";

export const useAdminApiRequests = () => {
  const { privateApi } = useApiClients();

  const getAdminAppRequest = () => privateApi<AppListType>(
    "/apps",
  );

  const getModelListViewRequest = (
    appLabel: string, modelName: string, params: { limit: number; offset: number; custom_search?: string }
  ) => privateApi<ListviewDataType>(
    `/model-listview/${appLabel}/${modelName}`,
    { params },
  );

  const getModelAdminSettings = (
    appLabel: string, modelName: string, pk: string | number = 0
  ) => privateApi<{ model_admin_settings: ModelAdminSettingsType }>(
    `/model-admin-settings/${appLabel}/${modelName}/${pk}`
  );

  const getModelFields = (
    appLabel: string, modelName: string
  ) => privateApi<{ fields: Record<string, ModelFieldType> }>(
    `/model-fields/${appLabel}/${modelName}`
  );

  const getModelFieldsEdit = (
    appLabel: string, modelName: string, pk: string | number
  ) => privateApi<{ fields: Record<string, ModelFieldType> }>(
    `/model-fields/${appLabel}/${modelName}/${pk}`
  );

  const addRecord = (
    appLabel: string, modelName: string, formData: FormData
  ) => privateApi<AddRecordResponse>(
    `/add-record/${appLabel}/${modelName}`,
    {
      method: "POST", 
      body: formData, 
    }
  );

  const changeRecord = (
    appLabel: string, modelName: string, formData: FormData, pk: string | number
  ) => privateApi<AddRecordResponse>(
    `/change-record/${appLabel}/${modelName}/${pk}`,
    {
      method: "POST", 
      body: formData, 
    }
  );

  return {
    getAdminAppRequest,
    getModelListViewRequest,
    getModelAdminSettings,
    getModelFields,
    getModelFieldsEdit,
    addRecord,
    changeRecord,
  }
}