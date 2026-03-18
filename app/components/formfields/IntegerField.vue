<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});

const filterKey = (e: KeyboardEvent) => {
  let symbols: string[] = [];
  if (
    [
      "PositiveIntegerField",
      "PositiveSmallIntegerField",
    ].includes(props.field.type)
  ) {
    symbols = [".", ",", "e", "E", "+", "-"];
  } else {
    symbols = [".", ",", "e", "E", "+"];
  }

  // Prevent '.', ',', 'e', '+', and '-' (if only positive integers are wanted)
  if (symbols.includes(e.key)) {
    e.preventDefault();
  }
};
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <Input
      :id="field.name"
      v-model="modelValue"
      :name="field.name"
      :required="field.required"
      :disabled="!field.editable"
      :min="field.min_value ?? undefined"
      :max="field.max_value ?? undefined"
      :class="{
        'border-red-500': errorMessage,
      }"
      type="number"
      autocomplete="off"
      @focus="emit('clear-error')"
      @keydown="filterKey"
    />
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
