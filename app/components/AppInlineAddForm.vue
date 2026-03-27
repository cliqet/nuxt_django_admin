<script setup lang="ts">
import { toast } from "vue-sonner";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import { TOAST_SUCCESS_STYLE } from "~/shared/constants/ui";
import type {
  ModelAdminSettingsType,
  ModelFieldType,
  SaveType,
} from "~/shared/types/app";

const props = defineProps<{
  appName: string;
  modelName: string;
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
const { getModelAdminSettings, getModelFields, addRecord } =
  useAdminApiRequests();

const formRef = ref<HTMLFormElement | null>(null);
const formErrors = ref<Record<string, string>>({});

const modelAdminSettingsResponse = await getModelAdminSettings(
  props.appName,
  props.modelName
);
const modelAdminSettings: ModelAdminSettingsType =
  modelAdminSettingsResponse.model_admin_settings;

const modelFieldsResponse = await getModelFields(
  props.appName,
  props.modelName
);
const modelFields = modelFieldsResponse.fields;

const fieldValues = mapModelFieldValues(modelFields);
const modelFieldValues = ref(fieldValues);

const scrollToTop = () => {
  if (formRef.value) {
    // smooth scrolling makes for a better user experience
    formRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleSave = async (saveType: SaveType) => {
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

    const response = await addRecord(props.appName, props.modelName, formData);

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

    if (response.pk) {
      toast("New Record Added", {
        description: response.message,
        style: TOAST_SUCCESS_STYLE,
      });

      await nextTick();

      if (saveType === "SAVE") {
        emit('openState', false);
      } else if (saveType === "SAVE_AND_ADD") {
        // 1. Manually reset the form values back to initial
        modelFieldValues.value = mapModelFieldValues(modelFields);

        // 2. Clear any lingering validation errors
        formErrors.value = {};

        // 3. Scroll the user back to the top of the new form
        scrollToTop();
      }
      // stay on form if continue
      emit('success');
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
        <h3 class="text-lg">Add {{ modelName }}</h3>
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

      <SaveFormButtons
        @save="handleSave('SAVE')"
        @save-add="handleSave('SAVE_AND_ADD')"
        @save-edit="handleSave('SAVE_AND_CONTINUE')"
      />
    </form>
  </div>
</template>
