<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";
import DynamicFormField from "./formfields/DynamicFormField.vue";

defineProps<{
  title: string;
  fieldsetFields: (string | string[])[];
  modelFields: Record<string, ModelFieldType>;
  formErrors: Record<string, string>;
}>();

const emit = defineEmits(["clear-error"]);

const isCollapsed = ref(true);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<Record<string, any>>({ required: true });
</script>

<template>
  <div class="space-y-4">
    <div
      class="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <!-- Section Header (Click to Toggle) -->
      <button
        type="button"
        class="w-full flex items-center justify-between p-3 bg-primary hover:cursor-pointer transition-colors"
        @click="isCollapsed = !isCollapsed"
      >
        <span
          class="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300"
        >
          {{ title }}
        </span>
        <UIcon
          name="i-heroicons-chevron-up"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': !isCollapsed }"
        />
      </button>

      <!-- Section Body (Fields) -->
      <div v-show="isCollapsed" class="p-4 space-y-3 bg-white dark:bg-gray-950">
        <!-- 1. We keep the loop here, but move the row logic inside -->
        <template
          v-for="(fieldsetField, fieldsetFieldIndex) in fieldsetFields"
          :key="fieldsetFieldIndex"
        >
          <!-- 2. This is your "Row" container -->
          <div class="flex flex-col md:flex-row gap-4 w-full">
            <!-- CASE 1: Single field -->
            <div v-if="typeof fieldsetField === 'string'" class="w-full">
              <DynamicFormField
                v-model="modelValue[fieldsetField]"
                :field-properties="modelFields[fieldsetField]!"
                :error-message="formErrors[fieldsetField]"
                @clear-error="emit('clear-error', fieldsetField)"
              />
            </div>

            <!-- CASE 2: Multiple fields -->
            <template v-else>
              <div
                v-for="fieldName in fieldsetField"
                :key="fieldName"
                class="flex-1 min-w-0"
              >
                <DynamicFormField
                  v-model="modelValue[fieldName]"
                  :field-properties="modelFields[fieldName]!"
                  :error-message="formErrors[fieldName]"
                  @clear-error="emit('clear-error', fieldName)"
                />
              </div>
            </template>
          </div>

          <!-- 3. The Separator: Now it's after the row, but inside the loop -->
          <USeparator
            v-if="fieldsetFieldIndex < fieldsetFields.length - 1"
          />
        </template>
      </div>
    </div>
  </div>
</template>
