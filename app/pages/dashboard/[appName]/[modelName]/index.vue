<script setup lang="ts">
import AppTable, { type TableEventType } from '~/components/AppTable.vue';
import { useAdminApiRequests } from '~/composables/admin/useAdminApiRequests';
import type { ListviewDataType, ModelAdminSettingsType } from '~/shared/types/app';

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
const appName = ref(routeSegments.value.at(-2));
const modelName = ref(routeSegments.value.at(-1));

const { getModelAdminSettings, getModelListViewRequest } = useAdminApiRequests();

const modelAdminSettingsResponse = await getModelAdminSettings(appName.value as string, modelName.value as string);
const modelAdminSettings: ModelAdminSettingsType = modelAdminSettingsResponse.model_admin_settings;

const currentPage = ref(1);
// Compute the offset for Django: (1-1) * 5 = 0; (2-1) * 5 = 5;
const offset = computed(() => (currentPage.value - 1) * modelAdminSettings.list_per_page);
const rowsSelected = ref<(string | number)[]>([]);

// Initialize with empty results or the first fetch
const listResults = ref<ListviewDataType>(await getModelListViewRequest(
  appName.value!, 
  modelName.value!,
  { limit: modelAdminSettings.list_per_page, offset: 0 }
));
const searchQuery = ref("");

const onSearch = async () => {
    currentPage.value = 1;  

    listResults.value = await getModelListViewRequest(
      appName.value!, 
      modelName.value!,
      { 
        limit: modelAdminSettings.list_per_page, 
        offset: offset.value, 
        custom_search: searchQuery.value 
      }
    );
}

const onAddModel = () => {
    navigateTo(`${route.path}/add`);
}


const onTableEvent = async (tableEvent: TableEventType) => {
  if (tableEvent.event === "page_change") {    
    listResults.value = await getModelListViewRequest(
      appName.value!, 
      modelName.value!,
      { 
        limit: modelAdminSettings.list_per_page, 
        offset: offset.value,
        custom_search: searchQuery.value ? searchQuery.value : undefined 
      }
    );
  }

  if (tableEvent.event === "row_selected") {
    rowsSelected.value = tableEvent.metadata.items;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h3 class="text-lg">Select {{ modelName }} to change</h3>
      <Button class="cursor-pointer" @click="onAddModel">
        <span class="text-xs">
            ADD {{ `${modelName}`.toUpperCase() }}
        </span>
      </Button>
    </div>

    <div class="border border-primary rounded-md my-2 p-2">
        <SearchInput 
            v-model="searchQuery" 
            :placeholder="`Find ${modelName} ...`"
            @search="onSearch"
        />
        <p class="text-xs my-1">Search by {{ modelAdminSettings.search_fields.join(", ") }}</p>
    </div>

    <div class="border border-primary rounded-md my-2 p-2">
      <AppTable
        v-model:page="currentPage"
        :data="listResults.results" 
        :settings="modelAdminSettings"
        :app-name="appName"
        :model-name="modelName"
        :total-data="listResults.count"
        @table_event="onTableEvent" 
      />
    </div>
  </div>
</template>
