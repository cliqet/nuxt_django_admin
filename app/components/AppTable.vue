<script setup lang="ts">
import { h, resolveComponent, computed } from "vue";
import { upperFirst } from "scule";
import type { TableColumn } from "@nuxt/ui";
import type { UTable } from "#components";
import type {
  ListviewDataType,
  ModelAdminSettingsType,
  SelectedOptionsType,
} from "~/shared/types/app";
import { DashboardRoute } from "~/shared/constants/routes";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { ChevronDown, ChevronUp } from "lucide-vue-next";

// Nuxt UI & Vue Components
const UCheckbox = resolveComponent("UCheckbox");
const NuxtLink = resolveComponent("NuxtLink");
const UBadge = resolveComponent("UBadge");

const router = useRouter();
const route = useRoute();

const { getModelListViewRequest, getModelFields } = useAdminApiRequests();
const { formatTitle } = useUtility();

export type PageChangeMetadata = {
  currentPage: number;
};

export type RowSelectedMetadata = {
  items: (string | number)[];
};

export type TableEventType =
  | { event: "page_change"; metadata: PageChangeMetadata }
  | { event: "row_selected"; metadata: RowSelectedMetadata };

const props = defineProps<{
  settings: ModelAdminSettingsType;
  appName: string | undefined;
  modelName: string | undefined;
}>();

const emit = defineEmits<{
  (e: "table_event", payload: TableEventType): void;
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableApiRef = useTemplateRef<any>("tableApiRef");

// Expose internal table state to parent if needed
defineExpose({
  tableApi: computed(() => tableApiRef.value?.tableApi),
});

const modelFieldsResponse = await getModelFields(
  props.appName!,
  props.modelName!
);
const modelFields = modelFieldsResponse.fields;

/**
 * Dynamic Column Construction
 * Generates table columns based on modelAdminSettings.list_display
 */
const columns = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dynamicCols: TableColumn<any>[] = [];

  // 1. Checkbox Selection Column
  dynamicCols.push({
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  });

  // 2. Data Columns from list_display
  props.settings.list_display.forEach((key) => {
    dynamicCols.push({
      accessorKey: key,
      // Format header: "is_active" -> "Is active"
      header: upperFirst(key.replace(/_/g, " ")),
      cell: ({ row }) => {
        const value = row.getValue(key);
        const isLink = props.settings.list_display_links?.includes(key);
        const field = modelFields[key];
        const isFkField = field && field.type === "ForeignKey";

        // If the field column is a foreign key
        if (isFkField && field.foreignkey_choices) {
          const fkChoice = field.foreignkey_choices.find(
            (choice: SelectedOptionsType) => {
              return value === choice.value;
            }
          );

          return String(fkChoice?.label ?? "-");
        }

        // Render as NuxtLink if key is in list_display_links
        if (isLink) {
          const pk = row.original.pk;
          return h(
            NuxtLink,
            {
              to: `${DashboardRoute.DashboardHome}/${props.appName}/${props.modelName}/${pk}/change`,
              class:
                "text-primary font-semibold hover:underline decoration-primary/50",
            },
            () => String(value ?? "-")
          );
        }

        // Render Boolean as Badge/Icon
        if (typeof value === "boolean") {
          return h(
            UBadge,
            {
              color: value ? "success" : "error",
              variant: "subtle",
              size: "sm",
            },
            () => (value ? "Yes" : "No")
          );
        }

        // Render HTML content safely if key is 'html'
        if (key === "html" && typeof value === "string") {
          return h("div", {
            innerHTML: value,
            class: "prose prose-xs max-w-xs truncate",
          });
        }

        // Handle Metadata/Objects
        if (typeof value === "object" && value !== null) {
          return h(
            "code",
            { class: "text-[10px] bg-muted px-1 rounded" },
            "{...}"
          );
        }

        return String(value ?? "");
      },
    });
  });

  return dynamicCols;
});

const currentPage = ref(1);
// Compute the offset for Django: (1-1) * 5 = 0; (2-1) * 5 = 5;
const offset = computed(
  () => (currentPage.value - 1) * props.settings.list_per_page
);
const rowsSelected = ref<(string | number)[]>([]);

// Initialize with empty results or the first fetch
const listResults = ref<ListviewDataType>(
  await getModelListViewRequest(props.appName!, props.modelName!, {
    limit: props.settings.list_per_page,
    offset: 0,
  })
);

const searchQuery = ref("");

const ALL_VALUE = "ALL";

const filterOpenStates = ref(
  Array.from({ length: props.settings.list_filter.length }, () => true)
);

const getFilterValues = (fieldName: string) => {
  const tableValuesField = props.settings.table_filters.find((tableValues) => {
    return tableValues.field === fieldName;
  });

  if (tableValuesField) {
    return tableValuesField.values.map((item) => {
      if (item.label === "All") {
        return {
          value: ALL_VALUE,
          label: item.label
        }
      } else {
        return {
          value: `${item.value}`,
          label: item.label,
        };
      }
    });
  }

  return [];
};

let initialFilterValues: string[][];
if (route.query) {
  initialFilterValues = [];
  for (const [_, value] of Object.entries(route.query)) {
    initialFilterValues.push(JSON.parse(value as string));
  }
} else {
  initialFilterValues = props.settings.list_filter.map((_) => {
    return [ALL_VALUE];
  });
}

const currentFilterValues = ref<string[][]>(initialFilterValues);

const createURLFilterParams = () => {
  const filterParams: Record<string, string> = {};

  currentFilterValues.value.forEach((field, fieldIndex) => {
    if (field.length > 0) {
      filterParams[props.settings.list_filter[fieldIndex] as string] = JSON.stringify(currentFilterValues.value[fieldIndex]); 
    }
  });

  return filterParams;
}

const convertFilterValueToApiArrayData = (fieldName: string, filterValue: string[]) => {
  // No filters
  if (filterValue.length < 1) {
    return "";
  } else {
    // All is the only filter
    if (filterValue.length === 1 && filterValue[0] === ALL_VALUE) {
      return "";
    }

    // If there is a "True" or "False"
    if (filterValue.includes("true") || filterValue.includes("false")) {
      const booleanArr = filterValue.map(value => {
        if (value === "true") {
          return true;
        } else {
          return false;
        }
      });

      return JSON.stringify(booleanArr);
    }

    // If there is a null
    if (filterValue.includes("null")) {
      const withNullArr = filterValue.map(value => {
        if (value === "null") {
          return null;
        } else {
          return value;
        }
      });

      return JSON.stringify(withNullArr);
    }

    if (Number.isInteger(Number(filterValue[0]))) {
      const intArr = filterValue.map(value => {
        return +value;
      });

      return JSON.stringify(intArr);
    }

    return JSON.stringify(filterValue);
  }
}

/**
 * For color as string, type as int foreign key values and is_active as true, false
 * E.g. &color=["Blue"]&type=[2,5]&is_active=[true]
 */
const createApiFilterParamsString = () => {
  let filterParams = "";

  currentFilterValues.value.forEach((fieldValues: string[], fieldValuesIndex: number) => {
    const fieldName = props.settings.list_filter[fieldValuesIndex];
    const apiFieldValues = convertFilterValueToApiArrayData(fieldName!, fieldValues);

    if (fieldValues.length > 0 && apiFieldValues) {
      filterParams += `&${props.settings.list_filter[fieldValuesIndex]}=${apiFieldValues}`;
    }
  });

  return filterParams;
}

const createApiFilterParamsObj = () => {
  const obj: Record<string, string> = {};

  currentFilterValues.value.forEach((fieldValues: string[], fieldValuesIndex: number) => {
    const fieldName = props.settings.list_filter[fieldValuesIndex];
    const apiFieldValues = convertFilterValueToApiArrayData(fieldName!, fieldValues);

    if (fieldValues.length > 0 && apiFieldValues) {
      obj[fieldName!] = apiFieldValues;
    }
  });

  return obj ? obj : undefined;
}

const getNewData = async () => {
  const filterParams = createApiFilterParamsObj();
  
  listResults.value = await getModelListViewRequest(
    props.appName!,
    props.modelName!,
    {
      limit: props.settings.list_per_page,
      offset: offset.value,
      custom_search: searchQuery.value,
      ...filterParams
    }
  );
};

await getNewData();

const onCheckboxToggle = async (nextValue: string[], index: number) => {
  // if all filters are unchecked, make current filter set to show All
  if (nextValue.length === 0) {
    currentFilterValues.value[index] = [ALL_VALUE];
  } 

  if (nextValue.length > 1) {
    // if other filters except all then All was clicked
    if (nextValue.at(-1) === ALL_VALUE) {
      currentFilterValues.value[index] = [ALL_VALUE];
    }

    // if only All was the previous filter then another filter was added
    if (nextValue[0] === ALL_VALUE) {
      nextValue.splice(0, 1);
      currentFilterValues.value[index] = nextValue;
    }
  }

  router.push({
    query: {
      ...route.query,
      ...createURLFilterParams()
    }
  });

  console.log("api filter params", createApiFilterParamsString());

  await getNewData();
};

const onSearch = async () => {
  currentPage.value = 1;
  await getNewData();
};

const onPageUpdate = async (newPage: number) => {
  currentPage.value = newPage;
  await getNewData();

  emit("table_event", {
    event: "page_change",
    metadata: { currentPage: newPage },
  });
};

// 1. Watch for Row Selection (Ordered)
watch(
  () => tableApiRef.value?.tableApi?.getState().rowSelection,
  (selection) => {
    if (!selection) return;

    // Get Pks in the current visual order
    const selectedPks = tableApiRef.value.tableApi
      .getSelectedRowModel()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .rows.map((row: any) => row.id);

    rowsSelected.value = selectedPks;

    emit("table_event", {
      event: "row_selected",
      metadata: { items: selectedPks },
    });
  },
  { deep: true }
);
</script>

<template>
  <div v-if="listResults" class="w-full">
    <div class="border border-primary rounded-md my-2 p-2 flex justify-between">
      <div>
        <SearchInput
          v-model="searchQuery"
          :placeholder="`Find ${modelName} ...`"
          @search="onSearch"
        />
        <p class="text-xs my-1">
          Search by {{ settings.search_fields.join(", ") }}
        </p>
      </div>
      <div>
        <USlideover>
          <UButton
            label="Filter"
            color="primary"
            variant="subtle"
            class="cursor-pointer"
          />

          <template #content>
            <h3 class="text-primary text-xl font-bold text-center my-1">
              Filters
            </h3>
            <SidebarMenuItem>
              <Collapsible
                v-for="(filterField, index) in settings.list_filter"
                :key="filterField"
                default-open
                class="group/collapsible"
              >
                <SidebarGroup class="py-0">
                  <SidebarGroupLabel as-child>
                    <CollapsibleTrigger
                      class="bg-primary my-2 py-1 flex h-fit"
                      @click="
                        filterOpenStates[index] = !filterOpenStates[index]
                      "
                    >
                      <div class="grow">
                        <span class="font-bold text-white text-sm">
                          {{ formatTitle(filterField) }}
                        </span>
                      </div>
                      <div class="ml-auto">
                        <ChevronUp
                          v-if="filterOpenStates[index]"
                          :class="{ 'rotate-180': !filterOpenStates[index] }"
                          class="transition-transform cursor-pointer text-white"
                          :size="18"
                        />
                        <ChevronDown
                          v-if="!filterOpenStates[index]"
                          :class="{ 'rotate-180': filterOpenStates[index] }"
                          class="transition-transform cursor-pointer text-white"
                          :size="18"
                        />
                      </div>
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>

                  <CollapsibleContent>
                    <SidebarGroupContent v-if="filterOpenStates[index]">
                      <SidebarMenu>
                        <UCheckboxGroup
                          v-model="currentFilterValues[index]"
                          :items="getFilterValues(filterField)"
                          @update:model-value="(newValue) => onCheckboxToggle(newValue, index)"
                        />
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </SidebarMenuItem>
          </template>
        </USlideover>
      </div>
    </div>

    <div class="border border-primary rounded-md my-2 p-2">
      <UTable
        ref="tableApiRef"
        :data="listResults.results"
        :columns="columns"
        :get-row-id="(row) => row.pk"
        sticky
        class="min-h-75"
      >
        <!-- Fallback for empty states -->
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-10 gap-3">
            <span class="text-sm text-muted"
              >No {{ settings.model_name }} found.</span
            >
          </div>
        </template>
      </UTable>

      <div
        class="px-4 py-3 border-t border-primary/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/5"
      >
        <div class="text-xs text-muted">
          <!-- Summary logic -->
          Selected:
          {{
            tableApiRef?.tableApi?.getFilteredSelectedRowModel().rows.length ||
            0
          }}
          of {{ listResults.results.length }}
        </div>

        <div class="text-xs text-muted">
          Total records: {{ listResults.count }}
        </div>

        <UPagination
          :items-per-page="settings.list_per_page"
          :total="listResults.count"
          size="xs"
          @update:page="
            async (newPage) => {
              await onPageUpdate(newPage);
            }
          "
        />
      </div>
    </div>
  </div>
</template>
