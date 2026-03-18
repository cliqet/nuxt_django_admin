<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>(); // This is the Boolean from the Parent

// This computed property handles the "Translation"
const stringValue = computed({
  // GET: Convert Boolean to String for the UI
  get: () => String(modelValue.value ?? props.field.initial),
  
  // SET: Convert String back to Boolean for the Parent
  set: (val) => { 
    modelValue.value = (val === 'true'); 
  }
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <RadioGroup
      :id="field.name"
      v-model="stringValue"
      :disabled="!field.editable"
      class="flex"
      :class="{
        'border-red-500': errorMessage,
      }"
      @focus="emit('clear-error')"
    >
      <div class="flex items-center space-x-2">
        <RadioGroupItem :id="`${field.name}-true`" value="true" />
        <Label :for="`${field.name}-true`">Yes</Label>
      </div>
      <div class="flex items-center space-x-2">
        <RadioGroupItem :id="`${field.name}-false`" value="false" />
        <Label :for="`${field.name}-false`">No</Label>
      </div>
    </RadioGroup>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
