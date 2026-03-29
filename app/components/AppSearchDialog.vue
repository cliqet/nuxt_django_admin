<script setup lang="ts">
import { useAppStore } from "~/stores/app";

const appStore = useAppStore();

onBeforeUnmount(() => {
  appStore.setIsModalOpen(false);
});

const onClickApp = async (link: string) => {
  await navigateTo(link);
  appStore.setIsModalOpen(false);
};

const allowedApps = computed(() => {
  return appStore.appSettings
    .filter(app => app.hasModulePerms) // 1. Keep only allowed groups
    .map(app => ({
      ...app,
      // 2. Filter the models inside each group
      models: app.models.filter(model => model.perms.view) 
    }))
});
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
        v-for="adminApp in allowedApps"
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
