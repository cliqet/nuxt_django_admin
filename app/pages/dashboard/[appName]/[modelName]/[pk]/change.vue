<script setup lang="ts">
import { toast } from "vue-sonner";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import { DashboardRoute } from "~/shared/constants/routes";
import { TOAST_SUCCESS_STYLE } from "~/shared/constants/ui";
import type { ModelAdminSettingsType, ModelFieldType, SaveType } from "~/shared/types/app";

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
const appName = ref(routeSegments.value.at(-4));
const modelName = ref(routeSegments.value.at(-3));
const pk = ref(routeSegments.value.at(-2));

const { 
  isFieldValueValid, 
  convertModelFieldValuesToFormData, 
  mapModelFieldValues 
} = useModelFormValidation();
const { 
  getModelAdminSettings, 
  getModelFieldsEdit, 
  changeRecord 
} = useAdminApiRequests();

const formRef = ref<HTMLFormElement | null>(null);
const formErrors = ref<Record<string, string>>({});

const modelAdminSettingsResponse = await getModelAdminSettings(appName.value!, modelName.value!, pk.value!);
const modelAdminSettings: ModelAdminSettingsType = modelAdminSettingsResponse.model_admin_settings;

const modelFieldsResponse = await getModelFieldsEdit(appName.value!, modelName.value!, pk.value!);
const modelFields = modelFieldsResponse.fields;

const fieldValues = mapModelFieldValues(modelFields);
const modelFieldValues = ref(fieldValues);

const scrollToTop = () => {
  if (formRef.value) {
    // smooth scrolling makes for a better user experience
    formRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleSave = async (saveType: SaveType) => {
  let hasFormError = false;

  Object.keys(modelFields).forEach(key => {
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
      appName.value!,
      modelName.value!,
      formData,
      pk.value!
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
      toast(`Record ${pk.value} Changed`, {
        description: response.message,
        style: TOAST_SUCCESS_STYLE,
      });

      await nextTick();

      if (saveType === "SAVE") {
        navigateTo(
          `${DashboardRoute.DashboardHome}/${appName.value}/${modelName.value}`, 
          { replace: true }
        );
      } else if (saveType === "SAVE_AND_ADD") {
        navigateTo(
          `${DashboardRoute.DashboardHome}/${appName.value}/${modelName.value}/add`, 
          { replace: true }
        );
      } 
      // stay on form if continue
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
  <form ref="formRef" novalidate="true" class="pb-10" @submit.prevent="">
    <div class="flex items-center">
      <h3 class="text-lg">Change {{ modelName }}</h3>
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
</template>
