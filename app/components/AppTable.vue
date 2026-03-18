<script setup lang="ts">
import { h, resolveComponent, computed } from "vue";
import { upperFirst } from "scule";
import type { TableColumn } from "@nuxt/ui";
import type { UTable } from "#components";
import type {
  ListviewDataType,
  ModelAdminSettingsType,
} from "~/shared/types/app";
import { DashboardRoute } from "~/shared/constants/routes";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";

// Nuxt UI & Vue Components
const UCheckbox = resolveComponent("UCheckbox");
const NuxtLink = resolveComponent("NuxtLink");
const UBadge = resolveComponent("UBadge");

const { getModelListViewRequest } = useAdminApiRequests();

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

// This model will be 1-based to satisfy the UPagination component
// const page = defineModel<number>("page", { default: 1 });

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableApiRef = useTemplateRef<any>("tableApiRef");

// Expose internal table state to parent if needed
defineExpose({
  tableApi: computed(() => tableApiRef.value?.tableApi),
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

const getNewData = async () => {
  listResults.value = await getModelListViewRequest(
    props.appName!,
    props.modelName!,
    {
      limit: props.settings.list_per_page,
      offset: offset.value,
      custom_search: searchQuery.value,
    }
  );
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
    <div class="border border-primary rounded-md my-2 p-2">
      <SearchInput
        v-model="searchQuery"
        :placeholder="`Find ${modelName} ...`"
        @search="onSearch"
      />
      <p class="text-xs my-1">
        Search by {{ settings.search_fields.join(", ") }}
      </p>
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
          of {{ listResults.count }}
        </div>

        <UPagination
          :items-per-page="settings.list_per_page"
          :total="listResults.count"
          size="xs"
          @update:page="async (newPage) => { await onPageUpdate(newPage) }"
        />
      </div>
    </div>
  </div>
</template>
