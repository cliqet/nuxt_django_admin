<script setup lang="ts">
import { toast } from "vue-sonner";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import { TOAST_SUCCESS_STYLE } from "~/shared/constants/ui";
import type {
  ModelAdminSettingsType,
  ModelFieldType,
} from "~/shared/types/app";

const props = defineProps<{
  appName: string;
  modelName: string;
  pk: string | number;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'openState', isOpen: boolean): void;
  (e: "success"): void;
}>();

const {
  isFieldValueValid,
  convertModelFieldValuesToFormData,
  mapModelFieldValues,
} = useModelFormValidation();

const { getModelAdminSettings, getModelFieldsEdit, changeRecord } = useAdminApiRequests();

const formRef = ref<HTMLFormElement | null>(null);
const formErrors = ref<Record<string, string>>({});

// Fetch settings and the EXISTING record data
const modelAdminSettingsResponse = await getModelAdminSettings(
  props.appName,
  props.modelName,
  props.pk.toString()
);
const modelAdminSettings: ModelAdminSettingsType =
  modelAdminSettingsResponse.model_admin_settings;

const modelFieldsResponse = await getModelFieldsEdit(
  props.appName,
  props.modelName,
  props.pk.toString()
);
const modelFields = modelFieldsResponse.fields;

// This helper maps the existing record values directly into the refs
const fieldValues = mapModelFieldValues(modelFields);
const modelFieldValues = ref(fieldValues);

const scrollToTop = () => {
  if (formRef.value) {
    formRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleSave = async () => {
  let hasFormError = false;

  Object.keys(modelFields).forEach((key) => {
    const field = modelFields[key] as ModelFieldType;
    const validity = isFieldValueValid(field, modelFieldValues.value[key]);
    if (!validity.isValid) {
      hasFormError = true;
      formErrors.value[field.name] = validity.message;
    }
  });

  if (!hasFormError) {
    const formData = convertModelFieldValuesToFormData(
      modelFieldValues.value,
      modelFields
    );

    const response = await changeRecord(
      props.appName,
      props.modelName,
      formData,
      props.pk.toString()
    );

    const validationErrors = response.validation_error;
    if (validationErrors) {
      hasFormError = true;
      Object.keys(validationErrors).forEach((key) => {
        if (validationErrors[key]) {
          formErrors.value[key] = validationErrors[key];
        }
      });
      return;
    }

    if (response.message) {
      toast("Record Updated", {
        description: response.message,
        style: TOAST_SUCCESS_STYLE,
      });

      await nextTick();

      emit('openState', false); // Close drawer
      emit('success');          // Refresh table
    }
  } else {
    scrollToTop();
  }
};

const clearFieldError = (fieldName: string) => {
  formErrors.value[fieldName] = "";
};
</script>

<template>
  <div v-if="isOpen" class="overflow-y-auto px-3 pt-3 pb-20">
    <form ref="formRef" novalidate="true" class="pb-10" @submit.prevent="">
      <div class="flex items-center">
        <h3 class="text-lg font-bold">Edit {{ modelName }}: {{ pk }}</h3>
      </div>

      <div
        v-for="fieldset in modelAdminSettings.fieldsets"
        :key="fieldset.title"
        class="my-1 py-2"
      >
        <AppFormFieldset
          v-model="modelFieldValues"
          :title="fieldset.title"
          :fieldset-fields="fieldset.fields"
          :model-fields="modelFields"
          :form-errors="formErrors"
          @clear-error="clearFieldError"
        />
      </div>

      <div class="flex gap-2">
        <Button @click="handleSave">Save Changes</Button>
        <Button variant="outline" @click="emit('openState', false)">Cancel</Button>
      </div>
    </form>
  </div>
</template>
