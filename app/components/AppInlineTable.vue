<script setup lang="ts">
import { h, resolveComponent, computed } from "vue";
import { upperFirst } from "scule";
import type { TableColumn } from "@nuxt/ui";
import type { UTable } from "#components";
import type {
  InlineModelAdminSettingsType,
  ListviewDataType,
  SelectedOptionsType,
} from "~/shared/types/app";
import { DashboardRoute } from "~/shared/constants/routes";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { toast } from "vue-sonner";
import { TOAST_ERROR_STYLE, TOAST_SUCCESS_STYLE } from "~/shared/constants/ui";

// Nuxt UI & Vue Components
const UCheckbox = resolveComponent("UCheckbox");
const NuxtLink = resolveComponent("NuxtLink");
const UBadge = resolveComponent("UBadge");

const { getModelListViewRequest, getModelFields, runListviewAction } =
  useAdminApiRequests();

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
  settings: InlineModelAdminSettingsType;
  appName: string;
  modelName: string;
  isAddFormOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "openState", isOpen: boolean): void;
}>();

const isDrawerOpen = computed({
  get: () => props.isAddFormOpen,
  set: (val) => emit("openState", val)
});

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
              target: "_blank",
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

const getNewData = async () => {
  listResults.value = await getModelListViewRequest(
    props.appName!,
    props.modelName!,
    {
      limit: props.settings.list_per_page,
      offset: offset.value,
    }
  );
};

await getNewData();

const onPageUpdate = async (newPage: number) => {
  currentPage.value = newPage;
  await getNewData();
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
  },
  { deep: true }
);

const onDelete = async () => {
  if (rowsSelected.value.length === 0) {
    toast("Table Action Error", {
      description: "You must select at least 1 record",
      style: TOAST_ERROR_STYLE,
    });
  } else {
    const response = await runListviewAction(
      props.appName!,
      props.modelName!,
      "delete",
      rowsSelected.value
    );

    toast("Table Action", {
      description: response.message,
      style: TOAST_SUCCESS_STYLE,
    });

    rowsSelected.value = [];
    await getNewData();
  }
};
</script>

<template>
  <div v-if="listResults" class="w-full">
    <div class="flex gap-3 border border-primary rounded-md my-2 p-2">
      <UDrawer
        v-model:open="isDrawerOpen"
      >
        <UButton
          label="Add"
          color="primary"
          variant="solid"
          trailing-icon="i-lucide-chevron-up"
          class="text-white"
          @click="emit('openState', true)"
        />
        <template #content>
          <AppInlineAddForm
          v-if="isDrawerOpen" 
          :app-name="appName"
          :model-name="modelName"
          :is-open="isDrawerOpen"
          @open-state="(val) => isDrawerOpen = val"
          @success="async () => {
            currentPage = 1;
            await getNewData();
          }"
        />
        </template>
      </UDrawer>

      <!-- <Button
        class="cursor-pointer"
        @click="
          navigateTo(
            `${DashboardRoute.DashboardHome}/${appName}/${modelName}/add`,
            {
              open: { target: '_blank' },
            }
          )
        "
        >Add</Button
      > -->
      <Button
        class="cursor-pointer bg-red-500"
        :disabled="rowsSelected.length === 0"
        @click="onDelete"
        >Delete</Button
      >
    </div>

    <div class="mb-10">
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
              tableApiRef?.tableApi?.getFilteredSelectedRowModel().rows
                .length || 0
            }}
            of {{ listResults.results.length }}
          </div>

          <div class="text-xs text-muted">
            Total records: {{ listResults.count }}
          </div>

          <UPagination
            v-model:page="currentPage"
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
  </div>
</template>
