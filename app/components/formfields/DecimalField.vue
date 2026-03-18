<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

const rawModel = defineModel<number | string | null>();
/**
 * WRITABLE COMPUTED
 * Converts Number -> String for the Input
 * Converts String -> Number for the Parent
 */
const modelValue = computed({
  get: () => {
    // If null/undefined, return empty string so input isn't "null"
    if (rawModel.value === null || rawModel.value === undefined) return "";
    return String(rawModel.value);
  },
  set: (val: string) => {
    // If user clears the field, set to null
    if (val === "" || val === "-") {
      rawModel.value = null;
      return;
    }
    // Convert back to float for the parent
    const parsed = parseFloat(val);
    rawModel.value = isNaN(parsed) ? null : parsed;
  }
});

/**
 * Extracts left and right lengths from Django regex
 * Example: "^\d{1,8}(\.\d{0,2})?$" -> { leftLength: 8, rightLength: 2 }
 */
const getFieldLengthsFromRegex = (
  pattern: string
): { leftLength: number; rightLength: number } => {
  const matches = pattern.match(/\{(\d+),?(\d+)?\}/g);

  if (!matches) return { leftLength: 0, rightLength: 0 };

  const getMaxVal = (str: string) => {
    const digits = str.match(/\d+/g);
    return digits ? parseInt(digits.pop() ?? "0") : 0;
  };

  // Explicitly handle index access with fallbacks
  const leftLength = getMaxVal(matches[0] ?? "");
  const rightLength = matches.length > 1 ? getMaxVal(matches[1] ?? "") : 0;

  return { leftLength, rightLength };
};

const filterKey = (e: KeyboardEvent) => {
  // 1. Always allow control keys (Backspace, Tab, etc.)
  const controlKeys = [
    "Backspace",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "Enter",
  ];
  if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

  const target = e.target as HTMLInputElement;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;

  const nextValue = 
    target.value.slice(0, start) + 
    e.key + 
    target.value.slice(end);

  const isValidNumber = /^-?\d*\.?\d*$/.test(nextValue);
  if (!isValidNumber) {
    e.preventDefault();
    return;
  }

  // Enforce Leading Zero Rule:
  // If the string starts with "0", the second character MUST be a "."
  // This prevents "01", "05", etc., but allows "0", "0.", and "0.99"
  if (
    nextValue.startsWith("0") &&
    nextValue.length > 1 &&
    nextValue[1] !== "."
  ) {
    e.preventDefault();
    return;
  }

  // Follow regex pattern for left and right digit length
  if (nextValue.includes(".") && props.field.regex_pattern) {
    const [integralPart, decimalPart] = nextValue.split(".");
    const { leftLength, rightLength } = getFieldLengthsFromRegex(props.field.regex_pattern);

    if (integralPart && integralPart?.length > leftLength) {
        e.preventDefault();
        return;
    }

    if (decimalPart && decimalPart.length > rightLength) {
        e.preventDefault();
        return;
    }
  } else {
    if (props.field.max_digits && nextValue.length > props.field.max_digits) {
        e.preventDefault();
        return;
    }
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
      :maxlength="field.max_length ?? undefined"
      :class="{
        'border-red-500': errorMessage,
      }"
      type="text"
      autocomplete="off"
      @focus="emit('clear-error')"
      @keydown="filterKey"
    />
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
