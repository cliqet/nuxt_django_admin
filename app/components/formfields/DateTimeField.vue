<script setup lang="ts">
import type { ZonedDateTime } from "@internationalized/date";
import { DateFormatter, parseAbsoluteToLocal } from "@internationalized/date";
import { CalendarIcon, Clock } from "lucide-vue-next";
import { cn } from "~/lib/utils";
import type { ModelFieldType } from "~/shared/types/app";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

const modelValue = defineModel<string | null>({
  default: (props: { field: ModelFieldType }) => props.field.initial || null,
});

const updateISO = (date: ZonedDateTime | undefined, timeStr: string) => {
  // 1. If we don't have a date yet, we can't build a full ISO string
  if (!date) return;

  // 2. Parse the time string (HH:MM:SS)
  const parts = timeStr.split(":").map(Number);
  const [h, m, s] = parts.length === 3 ? parts : [0, 0, 0];

  // 3. Update the ZonedDateTime and save back to modelValue
  const updated = date.set({ 
    hour: h || 0, 
    minute: m || 0, 
    second: s || 0 
  });
  
  modelValue.value = updated.toAbsoluteString(); 
  emit("clear-error");
};

/**
 * Split the ISO string into Date and Time components for internal UI state
 */
const datePart = computed({
  get: () => {
    if (!modelValue.value) return undefined;
    try {
      // Parses "2025-06-05T10:58:00+00:00" into a ZonedDateTime object
      return parseAbsoluteToLocal(modelValue.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      return undefined;
    }
  },
  set: (val) => {
    if (val) {
      // Merge new date with existing time
      updateISO(val, timePart.value || "00:00:00");
    }
  },
});

const timePart = computed({
  get: () => {
    const val = modelValue.value;
    if (!val || !val.includes('T')) return "00:00:00";
    
    const parts = val.split('T');
    // Use optional chaining and a fallback to ensure it's always a string
    const time = parts[1]?.substring(0, 8);
    
    return time || "00:00:00";
  },
  set: (val: string) => {
    if (val.length === 8 && datePart.value) {
      updateISO(datePart.value, val);
    }
  },
});

const df = new DateFormatter("en-US", { dateStyle: "medium" });



// Reuse your TimeField logic for the input mask
const handleTimeInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = target.value.replace(/[^\d]/g, "");
  let formatted = "";
  
  // slice(start, end)
  if (val.length > 0) formatted += val.slice(0, 2);
  if (val.length > 2) formatted += ":" + val.slice(2, 4);
  if (val.length > 4) formatted += ":" + val.slice(4, 6);
  
  timePart.value = formatted;
};

const formattedDate = computed(() => {
  if (!datePart.value) return "Pick date";
  return df.format(datePart.value.toDate());
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name">{{ field.label }}</FieldLabel>
    <div class="flex flex-wrap gap-2">
      <!-- Date Picker Part -->
      <Popover v-slot="{ close }">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            :disabled="!field.editable"
            :class="cn('w-48 justify-start text-left font-normal', !datePart && 'text-muted-foreground', errorMessage && 'border-red-500')"
          >
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ formattedDate }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar v-model="datePart" @update:model-value="close" />
        </PopoverContent>
      </Popover>

      <!-- Time Input Part -->
      <div class="relative w-32">
        <span class="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
          <Clock class="size-4 text-muted-foreground" />
        </span>
        <Input
          v-model="timePart"
          type="text"
          placeholder="HH:MM:SS"
          class="pl-9"
          :disabled="!field.editable"
          :class="{ 'border-red-500': errorMessage }"
          @input="handleTimeInput"
        />
      </div>
    </div>
    <FieldDescription class="text-xs mt-1">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500 mt-1">{{ errorMessage }}</p>
</template>
