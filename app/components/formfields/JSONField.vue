<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";
import { useDark } from "@vueuse/core";
import type { MenuItem } from "nuxt-jsoneditor";


defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const isDark = useDark();

const emit = defineEmits(['clear-error'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});

const handleRenderMenu = (items: MenuItem[]) => {
    return items.filter(item => {
        if ("text" in item && item.text && !["tree", "table"].includes(item.text)) {
            return item;
        }
    })
}
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <json-editor
        v-model:text="modelValue"
        height="400"
        :class="{
            'ring-1 ring-red-500': errorMessage
        }"
        :dark-theme="isDark"
        :read-only="!field.editable"
        @render-menu="handleRenderMenu"      
        @focus="emit('clear-error')"
    />
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>

<style scoped>
:deep(.jse-theme-default), 
:deep(.jse-main:not(.jse-theme-dark)) {
    --jse-theme-color: var(--primary) !important;
}
</style>
