<script setup lang="ts">
import { DashboardRoute } from "~/shared/constants/routes";
import type { ModelFieldType } from "~/shared/types/app";

const props = defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// modelValue should be a single value (string | number | null)
const modelValue = defineModel<string | number | null>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});

// Computed choices for USelectMenu
const options = computed(() => {
  return (
    props.field.foreignkey_choices?.map((choice) => ({
      label: choice.label,
      value: choice.value,
    })) || []
  );
});

// Find the current selected object for USelectMenu's display
const currentSelection = computed({
  get: () => options.value.find((opt) => opt.value === modelValue.value),
  set: (val) => {
    modelValue.value = val ? val.value : null;
    emit("clear-error");
  },
});
</script>

<template>
  <Field>
    <div class="flex items-center gap-3">
      <div>
        <FieldLabel :for="field.name">{{ field.label }}</FieldLabel>
      </div>

      <div>
        <NuxtLink
          :to="`${DashboardRoute.DashboardHome}/${field.foreignkey_app}/${field.foreignkey_model?.toLowerCase()}/add`"
          class="flex items-center"
          target="_blank"  
        >
          <Icon size="18" name="stash:plus-duotone" class="text-primary" />
        </NuxtLink>
      </div>
    </div>

    <USelectMenu
      v-model="currentSelection"
      :items="options"
      :searchable="true"
      :disabled="!field.editable"
      placeholder="Select an option..."
      class="w-full"
      :class="{
         'ring-1 ring-red-500': errorMessage
      }"
      @focus="emit('clear-error')" 
    />

    <FieldDescription class="text-xs mt-1">{{
      field.help_text
    }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500 mt-1">
    {{ errorMessage }}
  </p>
</template>
