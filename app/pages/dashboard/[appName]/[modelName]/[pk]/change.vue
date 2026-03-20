<script setup lang="ts">
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import type { ModelAdminSettingsType, ModelFieldType } from "~/shared/types/app";

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
const appName = ref(routeSegments.value.at(-4));
const modelName = ref(routeSegments.value.at(-3));
const pk = ref(routeSegments.value.at(-2));

const { isFieldValueValid } = useModelFormValidation();
const { getModelAdminSettings, getModelFieldsEdit } = useAdminApiRequests();

const formRef = ref<HTMLFormElement | null>(null);
const formErrors = ref<Record<string, string>>({});

const modelAdminSettingsResponse = await getModelAdminSettings(appName.value!, modelName.value!, pk.value!);
const modelAdminSettings: ModelAdminSettingsType = modelAdminSettingsResponse.model_admin_settings;

const modelFieldsResponse = await getModelFieldsEdit(appName.value!, modelName.value!, pk.value!);
const modelFields = modelFieldsResponse.fields;

const mapModelFieldValues = (dbModelFields: Record<string, ModelFieldType>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {}
  Object.keys(dbModelFields).forEach(key => {
    if (["ImageField", "FileField"].includes(dbModelFields[key]?.type as string)) {
      obj[key] = null;
    } else {
      obj[key] = dbModelFields[key]?.initial;
    }
  })

  return obj;
};

const fieldValues = mapModelFieldValues(modelFields);
const modelFieldValues = ref(fieldValues);

const scrollToTop = () => {
  if (formRef.value) {
    // smooth scrolling makes for a better user experience
    formRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const handleSave = () => {
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
    console.log("SUCCESS");
    console.log(modelFieldValues.value);
  } else {
    scrollToTop();
  }
};

const clearFieldError = (fieldName: string) => {
  formErrors.value[fieldName] = "";
};

const handleSaveAndAdd = () => {};

const handleSaveAndEdit = () => {};
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
      @save="handleSave"
      @save-add="handleSaveAndAdd"
      @save-edit="handleSaveAndEdit"
    />
  </form>
</template>
