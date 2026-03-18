import type { AppListType, ListviewDataType, ModelAdminSettingsType } from "~/shared/types/app";


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

  return {
    getAdminAppRequest,
    getModelListViewRequest,
    getModelAdminSettings,
  }
}