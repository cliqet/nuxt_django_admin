<script setup lang="ts">
import { Clock } from "lucide-vue-next";
import type { ModelFieldType } from "~/shared/types/app";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

const modelValue = defineModel<string>({
  default: (props: { field: ModelFieldType; errorMessage?: string }) =>
    props.field.initial || "",
});

const filterKey = (e: KeyboardEvent) => {
  const controlKeys = [
    "Backspace",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "Enter",
  ];
  if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

  // 1. Only allow numbers
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  const target = e.target as HTMLInputElement;
  const start = target.selectionStart ?? 0;

  // 2. Prevent typing past the 8-character limit (HH:MM:SS)
  if (
    target.value.length >= 8 &&
    target.selectionStart === target.selectionEnd
  ) {
    e.preventDefault();
    return;
  }

  // 3. Auto-insert colons
  // If user types at index 2 or 5, we skip to the next position
  if (start === 2 || start === 5) {
    target.value = target.value + ":";
    // We don't preventDefault here, so the number they just typed follows the colon
  }
};

// Optional: Format check on input to ensure colons stay in place
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = target.value.replace(/[^\d]/g, ""); // Strip non-digits

  if (val.length > 0) {
    let formatted = "";
    if (val.length > 0) formatted += val.substr(0, 2);
    if (val.length > 2) formatted += ":" + val.substr(2, 2);
    if (val.length > 4) formatted += ":" + val.substr(4, 2);
    modelValue.value = formatted;
  }
};
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <div class="relative">
      <!-- Clock Icon inside the input -->
      <span
        class="absolute inset-y-0 inset-s-0 flex items-center justify-center px-3 pointer-events-none"
      >
        <Clock class="size-4 text-muted-foreground" />
      </span>

      <Input
        :id="field.name"
        v-model="modelValue"
        type="text"
        placeholder="HH:MM:SS"
        class="pl-10"
        :class="{ 'border-red-500': errorMessage }"
        :disabled="!field.editable"
        @keydown="filterKey"
        @input="handleInput"
        @focus="emit('clear-error')"
      />
    </div>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
