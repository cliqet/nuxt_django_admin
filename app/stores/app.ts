import { defineStore } from "pinia";

export const useAppStore = defineStore('app', () => {
  const isModalOpen = ref(false);

  function setIsModalOpen (openState: boolean) {
    isModalOpen.value = openState;
  }

  return {
    isModalOpen,
    setIsModalOpen
  }
})