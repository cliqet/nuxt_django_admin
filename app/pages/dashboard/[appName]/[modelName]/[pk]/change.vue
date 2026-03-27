<script setup lang="ts">
import { toast } from "vue-sonner";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import { DashboardRoute } from "~/shared/constants/routes";
import { TOAST_SUCCESS_STYLE } from "~/shared/constants/ui";
import type {
  ModelAdminSettingsType,
  ModelFieldType,
  SaveType,
} from "~/shared/types/app";

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
const appName = ref(routeSegments.value.at(-4));
const modelName = ref(routeSegments.value.at(-3));
const pk = ref(routeSegments.value.at(-2));

const {
  isFieldValueValid,
  convertModelFieldValuesToFormData,
  mapModelFieldValues,
} = useModelFormValidation();
const { getModelAdminSettings, getModelFieldsEdit, changeRecord } =
  useAdminApiRequests();

const formRef = ref<HTMLFormElement | null>(null);
const formErrors = ref<Record<string, string>>({});

const modelAdminSettingsResponse = await getModelAdminSettings(
  appName.value!,
  modelName.value!,
  pk.value!
);
const modelAdminSettings: ModelAdminSettingsType =
  modelAdminSettingsResponse.model_admin_settings;

const modelFieldsResponse = await getModelFieldsEdit(
  appName.value!,
  modelName.value!,
  pk.value!
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

const initialAddOpenFormState = modelAdminSettings.custom_inlines.map(_ => {
  return false
})
const addFormOpenState = ref(initialAddOpenFormState);
</script>

<template>
  <form ref="formRef" novalidate="true" class="pb-20" @submit.prevent="">
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

    <div
      v-for="(inline, inlineIndex) in modelAdminSettings.custom_inlines"
      :key="inline.model_name_label"
      class="my-2"
    >
      <div class="bg-primary rounded-t-lg p-2">
        <h3 class="text-white font-bold">
          <NuxtLink
            :to="`${DashboardRoute.DashboardHome}/${inline.app_label}/${inline.model_name}`"
            target="_blank"
          >
            {{ inline.model_name_label }}
          </NuxtLink>
        </h3>
      </div>

      <AppInlineTable
        :settings="inline"
        :app-name="inline.app_label"
        :model-name="inline.model_name"
        :is-add-form-open="addFormOpenState[inlineIndex]!"
        @table_event="() => {}"
        @open-state="(isOpen: boolean) => addFormOpenState[inlineIndex] = isOpen"
      />
    </div>

    <SaveFormButtons
      @save="handleSave('SAVE')"
      @save-add="handleSave('SAVE_AND_ADD')"
      @save-edit="handleSave('SAVE_AND_CONTINUE')"
    />
  </form>
</template>
