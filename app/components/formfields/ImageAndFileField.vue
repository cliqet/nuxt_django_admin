<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType;
  initialFilename: string;
  errorMessage?: string;
}>();

const emit = defineEmits(['clear-error'])

const modelValue = defineModel<File | null>();
const filename = ref(props.initialFilename);

watch(() => modelValue.value, (newFile: File | null | undefined) => {
  if (!newFile) {
    filename.value = "";
    return
  }

  emit("clear-error");
  filename.value = newFile.name;
})
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <p class="text-xs text-primary">{{ filename }}</p>
    <UFileUpload v-model="modelValue" class="w-96 min-h-48" :disabled="!field.editable" />
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
