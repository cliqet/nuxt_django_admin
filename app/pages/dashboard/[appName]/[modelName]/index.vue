<script setup lang="ts">
import AppTable, { type TableEventType } from "~/components/AppTable.vue";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import type { ModelAdminSettingsType } from "~/shared/types/app";

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
const appName = ref(routeSegments.value.at(-2));
const modelName = ref(routeSegments.value.at(-1));

const { getModelAdminSettings } = useAdminApiRequests();

const modelAdminSettingsResponse = await getModelAdminSettings(
  appName.value as string,
  modelName.value as string
);
const modelAdminSettings: ModelAdminSettingsType =
  modelAdminSettingsResponse.model_admin_settings;

const onAddModel = () => {
  navigateTo(`${route.path}/add`);
};

const onTableEvent = async (tableEvent: TableEventType) => {
  console.log(tableEvent);
  //   if (tableEvent.event === "page_change") {
  //     listResults.value = await getModelListViewRequest(
  //       appName.value!,
  //       modelName.value!,
  //       {
  //         limit: modelAdminSettings.list_per_page,
  //         offset: offset.value,
  //         custom_search: searchQuery.value ? searchQuery.value : undefined
  //       }
  //     );
  //   }

  //   if (tableEvent.event === "row_selected") {
  //     rowsSelected.value = tableEvent.metadata.items;
  //   }
};
</script>

<template>
  <div class="pb-40">
    <div class="flex items-center justify-between">
      <h3 class="text-lg">Select {{ modelName }} to change</h3>
      <Button class="cursor-pointer" @click="onAddModel">
        <span class="text-xs"> ADD {{ `${modelName}`.toUpperCase() }} </span>
      </Button>
    </div>

    <AppTable
      :settings="modelAdminSettings"
      :app-name="appName"
      :model-name="modelName"
      @table_event="onTableEvent"
    />
  </div>
</template>
