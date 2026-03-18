<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <Select
      :id="field.name"
      v-model="modelValue"
      :name="field.name"
      :required="field.required"
      :disabled="!field.editable"
      :class="{
        'border-red-500': errorMessage,
      }"
      @focus="emit('clear-error')"
    >
      <SelectTrigger class="w-45">
        <SelectValue :placeholder="`Select a ${field.label}`" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="choice in field.choices"
            :key="choice.value"
            :value="choice.value"
          >
            {{ choice.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
