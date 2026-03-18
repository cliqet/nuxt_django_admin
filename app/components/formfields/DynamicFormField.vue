<script setup lang="ts">
import type { ModelFieldType } from "~/shared/types/app";
import IntegerField from "./IntegerField.vue";
import CharField from "./CharField.vue";
import DecimalField from "./DecimalField.vue";
import SelectField from "./SelectField.vue";
import EmailField from "./EmailField.vue";
import BooleanField from "./BooleanField.vue";
import TextField from "./TextField.vue";
import DateField from "./DateField.vue";
import TimeField from "./TimeField.vue";
import HTMLField from "./HTMLField.vue";
import ImageAndFileField from "./ImageAndFileField.vue";
import JSONField from "./JSONField.vue";
import ManyToManyField from "./ManyToManyField.vue";
import ForeignKeyField from "./ForeignKeyField.vue";
import DateTimeField from "./DateTimeField.vue";
import BigAutoField from "./BigAutoField.vue";

defineProps<{
  fieldProperties: ModelFieldType;
  errorMessage?: string;
}>();
const emit = defineEmits<{
  (e: 'clear-error', fieldName: string): void
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>();
</script>

<template>
  <CharField
    v-if="
      [
        'CharField',
        'SlugField',
      ].includes(fieldProperties.type) && !fieldProperties.choices
    "
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <SelectField
    v-if="fieldProperties.type === 'CharField' && fieldProperties.choices"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <EmailField
    v-if="fieldProperties.type === 'EmailField' && !fieldProperties.choices"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <IntegerField
    v-if="
      [
        'IntegerField',
        'PositiveIntegerField',
        'PositiveSmallIntegerField',
      ].includes(fieldProperties.type)
    "
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <DecimalField
    v-if="fieldProperties.type === 'DecimalField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <BooleanField
    v-if="fieldProperties.type === 'BooleanField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <TextField
    v-if="fieldProperties.type === 'TextField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <DateField
    v-if="fieldProperties.type === 'DateField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <TimeField
    v-if="fieldProperties.type === 'TimeField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <DateTimeField
    v-if="fieldProperties.type === 'DateTimeField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <HTMLField
    v-if="fieldProperties.type === 'HTMLField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <ImageAndFileField
    v-if="['FileField', 'ImageField'].includes(fieldProperties.type)"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    :initial-filename="fieldProperties.initial"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <JSONField
    v-if="fieldProperties.type === 'JSONField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <ManyToManyField
    v-if="fieldProperties.type === 'ManyToManyField'"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <ForeignKeyField
    v-if="['ForeignKey', 'OneToOneField'].includes(fieldProperties.type)"
    v-model="modelValue"
    :field="fieldProperties"
    :error-message="errorMessage"
    @clear-error="emit('clear-error', fieldProperties.name)"
  />

  <BigAutoField
    v-if="fieldProperties.type === 'BigAutoField'"
    v-model="modelValue"
    :field="fieldProperties"
  />
</template>
