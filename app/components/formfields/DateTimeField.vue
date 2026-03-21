<script setup lang="ts">
import type { ZonedDateTime, CalendarDate } from "@internationalized/date";
import { DateFormatter, parseAbsoluteToLocal, getLocalTimeZone, fromDate } from "@internationalized/date";
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
  if (!date) return;

  const parts = timeStr.split(":");
  // Fallback to "0" ensures parseInt always gets a string
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  const s = parseInt(parts[2] || "0", 10);

  const updated = date.set({
    hour: h,
    minute: m,
    second: s,
    millisecond: 0
  });

  // FIX: Use toAbsoluteString() to avoid the [Asia/Bangkok] brackets
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
      return parseAbsoluteToLocal(modelValue.value);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },
  set: (val) => {
    if (val) {
      // 1. Cast the value from shadcn Calendar
      const calendarDate = val as unknown as CalendarDate;
      
      // 2. Convert: CalendarDate -> JS Date -> ZonedDateTime
      // .toDate(tz) is the built-in way to get a JS Date from a CalendarDate
      const jsDate = calendarDate.toDate(getLocalTimeZone());
      const zonedDateTime = fromDate(jsDate, getLocalTimeZone());

      // 3. Merge with your current time
      updateISO(zonedDateTime, timePart.value || "00:00:00");
    }
  },
});

const timePart = computed({
  get: () => {
    const val = modelValue.value;
    if (!val || !val.includes("T")) return "00:00:00";

    const parts = val.split("T");
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
  // ZonedDateTime already knows its timezone, so toDate() takes no arguments
  return df.format(datePart.value.toDate());
});
</script>

<template>
  <Field>
    <FieldLabel :for="field.name">{{ field.label }}</FieldLabel>
    <div class="flex flex-wrap gap-2" @click="emit('clear-error')">
      <!-- Date Picker Part -->
      <Popover v-slot="{ close }">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            :disabled="!field.editable"
            :class="
              cn(
                'w-48 justify-start text-left font-normal',
                !datePart && 'text-muted-foreground',
                errorMessage && 'border-red-500 ring-1 ring-red-500'
              )
            "
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
        <span
          class="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none"
        >
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
    <FieldDescription class="text-xs mt-1">{{
      field.help_text
    }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500 mt-1">
    {{ errorMessage }}
  </p>
</template>
