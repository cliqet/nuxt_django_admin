import { defineStore } from "pinia";
import type { AppSettingsType } from "~/shared/types/app";

export const useAppStore = defineStore('app', () => {
  const isModalOpen = ref(false);
  const appSettings = ref<AppSettingsType[]>([]);

  function setIsModalOpen (openState: boolean) {
    isModalOpen.value = openState;
  }

  function setAppSettings (apps: AppSettingsType[]) {
    appSettings.value = apps;
  }

  return {
    isModalOpen,
    setIsModalOpen,
    appSettings,
    setAppSettings,
  }
})