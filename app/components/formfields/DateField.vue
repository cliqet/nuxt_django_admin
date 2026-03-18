<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { cn } from "~/lib/utils";
import type { ModelFieldType } from "~/shared/types/app";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);


const modelValue = defineModel<string | null>({
  // Use the props passed to the default factory
  default: (props: { field: ModelFieldType; errorMessage?: string }) =>
    props.field.initial || null,
});

/**
 * WRITABLE COMPUTED
 * GET: Converts String "2025-06-25" -> DateValue object for Calendar
 * SET: Converts DateValue object -> String "2025-06-25" for Parent/Django
 */
const internalDate = computed({
  get: () => {
    try {
      return modelValue.value ? parseDate(modelValue.value) : undefined;
    } catch {
      return undefined;
    }
  },
  set: (val) => {
    if (val) {
      modelValue.value = val.toString(); // Returns ISO string "YYYY-MM-DD"
      emit("clear-error");
    } else {
      modelValue.value = null;
    }
  },
});

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <Popover v-slot="{ close }">
      <PopoverTrigger as-child>
        <Button
          :id="field.name"
          variant="outline"
          :disabled="!field.editable"
          :class="
            cn(
              'w-70 justify-start text-left font-normal',
              !internalDate && 'text-muted-foreground',
              errorMessage && 'border-red-500 ring-1 ring-red-500' 
            )
          "
          @focus="emit('clear-error')" 
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{
            internalDate
              ? df.format(internalDate.toDate(getLocalTimeZone()))
              : "Pick a date"
          }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
          v-model="internalDate"
          layout="month-and-year"
          @update:model-value="close"
        />
      </PopoverContent>
    </Popover>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
