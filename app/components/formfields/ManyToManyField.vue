<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType; // Assumes field.choices contains { label: string, value: any }
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// modelValue is an array of selected values (e.g., [1, 3, 5])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any[]>({
  default: (props: { field: ModelFieldType }) => props.field.initial || [],
});

// Search states
const leftSearch = ref("");
const rightSearch = ref("");

const activeLeft = ref<(string | number)[]>([]);
const activeRight = ref<(string | number)[]>([]);

// Toggle selection within the left pane
const toggleLeft = (id: string | number) => {
  if (activeLeft.value.includes(id)) {
    activeLeft.value = activeLeft.value.filter((i) => i !== id);
  } else {
    // Replace the array instead of using .push()
    activeLeft.value = [...activeLeft.value, id];
  }
};

// Toggle selection within the right pane
const toggleRight = (id: string | number) => {
  if (activeRight.value.includes(id)) {
    activeRight.value = activeRight.value.filter((i) => i !== id);
  } else {
    // Replace the array instead of using .push()
    activeRight.value = [...activeRight.value, id];
  }
};

// Move only the highlighted items to the right
const moveSelectedRight = () => {
  modelValue.value = [...modelValue.value, ...activeLeft.value];
  activeLeft.value = []; // Clear selection after move
  emit("clear-error");
};

// Move only the highlighted items to the left
const moveSelectedLeft = () => {
  modelValue.value = modelValue.value.filter(
    (id) => !activeRight.value.includes(id)
  );
  activeRight.value = []; // Clear selection after move
};

// Computed lists
const availableOptions = computed(() => {
  const choices = props.field.manytomany_choices || [];
  return choices.filter(
    (opt) =>
      !modelValue.value.includes(opt.id) &&
      opt.label.toLowerCase().includes(leftSearch.value.toLowerCase())
  );
});

const chosenOptions = computed(() => {
  const choices = props.field.manytomany_choices || [];
  return choices.filter(
    (opt) =>
      modelValue.value.includes(opt.id) &&
      opt.label.toLowerCase().includes(rightSearch.value.toLowerCase())
  );
});

// Actions
const add = (id: string | number) => {
  if (!modelValue.value.includes(id) && props.field.editable) {
    modelValue.value = [...modelValue.value, id];
    activeLeft.value = activeLeft.value.filter((i) => i !== id); // Add this
    emit("clear-error");
  }
};

const remove = (id: string | number) => {
  if (props.field.editable) {
    modelValue.value = modelValue.value.filter((v) => v !== id);
    activeRight.value = activeRight.value.filter((i) => i !== id); 
  }
};

const addAll = () => {
  modelValue.value = props.field.manytomany_choices?.map((c) => c.id) || [];
  activeLeft.value = []; // Add this
  emit("clear-error");
};

const removeAll = () => {
  modelValue.value = [];
  activeRight.value = []; // Add this
};
</script>

<template>
  <Field>
    <FieldLabel :for="field.name">{{ field.label }}</FieldLabel>

    <div 
      class="grid grid-cols-12 gap-2 items-center min-h-62.5"
      @click="emit('clear-error')" 
    >
      <!-- Available Column -->
      <div class="col-span-5 flex flex-col h-full">
        <span class="text-xs font-bold mb-1 uppercase text-gray-500"
          >Available {{ field.label }}</span
        >
        <UInput
          v-model="leftSearch"
          icon="i-heroicons-magnifying-glass"
          placeholder="Filter..."
          size="sm"
          class="mb-1"
        />
        <div
          class="border rounded-md grow overflow-y-auto bg-white dark:bg-gray-900 h-48"
        >
          <div
            v-for="opt in availableOptions"
            :key="opt.id"
            class="px-2 py-1 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950"
            :class="[
              'px-2 py-1.5 text-sm cursor-pointer transition-colors',
              activeLeft.includes(opt.id)
                ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            @click="toggleLeft(opt.id)"
            @dblclick="add(opt.id)"
          >
            {{ opt.label }}
          </div>
        </div>
        <UButton
          variant="ghost"
          size="xs"
          block
          class="mt-1 cursor-pointer"
          :disabled="!field.editable"
          @click="addAll"
          >Choose all</UButton
        >
      </div>

      <!-- Controls -->
      <div class="col-span-2 flex flex-col gap-2 items-center justify-center">
        <UButton
          icon="i-heroicons-chevron-right"
          variant="soft"
          class="cursor-pointer"
          :disabled="!availableOptions.length || !field.editable"
          @click="moveSelectedRight"
        />
        <UButton
          icon="i-heroicons-chevron-left"
          variant="soft"
          class="cursor-pointer"
          :disabled="!chosenOptions.length || !field.editable"
          @click="moveSelectedLeft"
        />
      </div>

      <!-- Chosen Column -->
      <div 
        class="col-span-5 flex flex-col h-full"
      >
        <span class="text-xs font-bold mb-1 uppercase text-gray-500"
          >Chosen {{ field.label }}</span
        >
        <UInput
          v-model="rightSearch"
          icon="i-heroicons-magnifying-glass"
          placeholder="Filter..."
          size="sm"
          class="mb-1"
        />
        <div
          class="border rounded-md grow overflow-y-auto bg-white dark:bg-gray-900 h-48 border-primary-500/50"
          :class="{
            'border-red-500': errorMessage
          }"
        >
          <div
            v-for="opt in chosenOptions"
            :key="opt.id"
            class="px-2 py-1 text-sm cursor-pointer hover:bg-red-50 dark:hover:bg-red-950"
            :class="[
              'px-2 py-1.5 text-sm cursor-pointer transition-colors',
              activeRight.includes(opt.id)
                ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            @click="toggleRight(opt.id)"
            @dblclick="remove(opt.id)"
          >
            {{ opt.label }}
          </div>
        </div>
        <UButton
          variant="ghost"
          size="xs"
          block
          class="mt-1 cursor-pointer"
          :disabled="!field.editable"
          @click="removeAll"
          >Remove all</UButton
        >
      </div>
    </div>

    <FieldDescription class="text-xs mt-2">{{
      field.help_text
    }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500 mt-1">
    {{ errorMessage }}
  </p>
</template>
