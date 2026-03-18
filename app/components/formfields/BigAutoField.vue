<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <p class="text-sm text-gray-600 dark:text-gray-400">{{ field.initial }}</p>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
</template>
