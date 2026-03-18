<script setup lang="ts">
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import type { AppSettingsType } from "~/shared/types/app";
import { useAppStore } from "~/stores/app";


const appStore = useAppStore();
const { getAdminAppRequest } = useAdminApiRequests();

const appSettings = ref<AppSettingsType[]>([]);
const response = await getAdminAppRequest();
appSettings.value = response.appList;

onBeforeUnmount(() => {
  appStore.setIsModalOpen(false);
});

const onClickApp = async (link: string) => {
  await navigateTo(link);
  appStore.setIsModalOpen(false);
};
</script>

<template>
  <CommandDialog
    :open="appStore.isModalOpen"
    @update:open="(value: boolean) => appStore.setIsModalOpen(value)"
  >
    <CommandInput placeholder="Search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup
        v-for="adminApp in appSettings"
        :key="adminApp.name"
        :heading="adminApp.name"
      >
        <CommandItem
          v-for="model in adminApp.models"
          :key="model.name"
          :value="model.name"
          class="cursor-pointer"
          @click="() => onClickApp(model.adminUrl)"
        >
          {{ model.name }}
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
    </CommandList>
  </CommandDialog>
</template>
