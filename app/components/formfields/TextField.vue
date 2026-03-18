<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";
import Textarea from "../ui/textarea/Textarea.vue";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(['clear-error'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <Textarea
      :id="field.name"
      v-model="modelValue"
      :name="field.name"
      :required="field.required"
      :disabled="!field.editable"
      :maxlength="field.max_length ?? undefined"
      :class="{
         'border-red-500': errorMessage
      }"
      type="text"
      autocomplete="off"
      @focus="emit('clear-error')" 
    />
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
