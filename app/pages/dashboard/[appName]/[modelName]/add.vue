<script setup lang="ts">
import { useModelFormValidation } from "~/composables/admin/useModelFormValidation";
import type { ModelAdminSettingsType, ModelFieldType } from "~/shared/types/app";

const route = useRoute();
const routeSegments = ref(route.path.split("/"));
// const appName = ref(routeSegments.value.at(-3));
const modelName = ref(routeSegments.value.at(-2));

const { isFieldValueValid } = useModelFormValidation();
const formErrors = ref<Record<string, string>>({});

const modelFields: Record<string, ModelFieldType> = {
  id: {
    name: "id",
    label: "ID",
    is_primary_key: true,
    max_length: null,
    editable: false,
    help_text: "",
    auto_created: true,
    type: "BigAutoField",
    initial: 26,
    required: false,
    choices: null,
    min_value: -9223372036854776000,
    max_value: 9223372036854776000,
  },
  created_at: {
    name: "created_at",
    label: "Created At",
    is_primary_key: false,
    max_length: null,
    editable: false,
    help_text: "",
    auto_created: false,
    type: "DateTimeField",
    initial: "2025-06-02T13:06:34.807823+00:00",
    required: false,
    choices: null,
  },
  updated_at: {
    name: "updated_at",
    label: "Updated At",
    is_primary_key: false,
    max_length: null,
    editable: false,
    help_text: "",
    auto_created: false,
    type: "DateTimeField",
    initial: "2025-06-02T13:06:34.814042+00:00",
    required: false,
    choices: null,
  },
  type: {
    name: "type",
    label: "Type",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "ForeignKey",
    initial: 1,
    required: true,
    choices: null,
    foreignkey_choices: [
      {
        value: 1,
        label: "Success",
        selected: true,
      },
      {
        value: 2,
        label: "Info",
        selected: false,
      },
      {
        value: 3,
        label: "Warning",
        selected: false,
      },
      {
        value: 4,
        label: "Danger",
        selected: false,
      },
    ],
    foreignkey_model: "Type",
    foreignkey_app: "django_admin",
    foreignkey_string: "Success",
  },
  color: {
    name: "color",
    label: "Color",
    is_primary_key: false,
    max_length: 10,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "CharField",
    initial: "Blue",
    required: true,
    choices: [
      {
        label: "Blue",
        value: "Blue",
        selected: true,
      },
      {
        label: "Red",
        value: "Red",
        selected: false,
      },
    ],
  },
  name: {
    name: "name",
    label: "Name",
    is_primary_key: false,
    max_length: 100,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "CharField",
    initial: "Test",
    required: true,
    choices: null,
  },
  email: {
    name: "email",
    label: "Email",
    is_primary_key: false,
    max_length: 254,
    editable: true,
    help_text: "Please enter a valid email address",
    auto_created: false,
    type: "EmailField",
    initial: "test@mail.com",
    required: true,
    choices: null,
  },
  ordering: {
    name: "ordering",
    label: "Ordering",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "PositiveIntegerField",
    initial: 0,
    required: true,
    choices: null,
    min_value: 0,
    max_value: 9223372036854776000,
  },
  range_number: {
    name: "range_number",
    label: "Range Number",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "Enter a number from 5 to 10",
    auto_created: false,
    type: "PositiveSmallIntegerField",
    initial: 5,
    required: true,
    choices: null,
    min_value: 5,
    max_value: 10,
  },
  amount: {
    name: "amount",
    label: "Amount",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "Max of 10 digits with format: 12345678.90",
    auto_created: false,
    type: "DecimalField",
    initial: "0.00",
    required: true,
    choices: null,
    regex_pattern: "^\\d{1,8}(\\.\\d{0,2})?$",
    regex_message:
      "Enter a valid amount (up to 8 digits before the decimal and 2 digits",
    max_digits: 10,
    decimal_places: 2,
  },
  comment: {
    name: "comment",
    label: "Comment",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "TextField",
    initial: "some comment",
    required: true,
    choices: null,
  },
  is_active: {
    name: "is_active",
    label: "Is Active",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "BooleanField",
    initial: true,
    required: true,
    choices: null,
  },
  date: {
    name: "date",
    label: "Date",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "DateField",
    initial: "2025-06-25",
    required: true,
    choices: null,
  },
  time: {
    name: "time",
    label: "Time",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "TimeField",
    initial: "12:59:00",
    required: true,
    choices: null,
  },
  last_log: {
    name: "last_log",
    label: "Last Log",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "DateTimeField",
    initial: "2025-06-05T10:58:00+00:00",
    required: true,
    choices: null,
  },
  file: {
    name: "file",
    label: "File",
    is_primary_key: false,
    max_length: 100,
    editable: true,
    help_text: "Allowed file types: [Any] | Max file size in MB: [None]",
    auto_created: false,
    type: "FileField",
    initial: "/media/alexa_aNqBwPz_y85wz36.png",
    required: true,
    choices: null,
  },
  image: {
    name: "image",
    label: "Image",
    is_primary_key: false,
    max_length: 100,
    editable: true,
    help_text:
      "Allowed file types: ['.jpg', '.jpeg', '.png'] | Max file size in MB: [2]",
    auto_created: false,
    type: "ImageField",
    initial: "/media/alexa_aNqBwPz_a2iBmrB.png",
    required: true,
    choices: null,
  },
  metadata: {
    name: "metadata",
    label: "Metadata",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "JSONField",
    initial: '{"name":"test"}',
    required: true,
    choices: null,
  },
  html: {
    name: "html",
    label: "HTML",
    is_primary_key: false,
    max_length: null,
    editable: false,
    help_text: "Enter html",
    auto_created: false,
    type: "HTMLField",
    initial: "<p>Hello World</p>",
    required: true,
    choices: null,
  },
  classification: {
    name: "classification",
    label: "Classification",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "ManyToManyField",
    initial: [1],
    required: true,
    choices: null,
    manytomany_choices: [
      {
        id: 1,
        label: "Good",
        checked: true,
      },
      {
        id: 2,
        label: "Better",
        checked: false,
      },
      {
        id: 3,
        label: "Best",
        checked: false,
      },
    ],
    manytomany_related_app: "django_admin",
    manytomany_related_model: "Classification",
  },
  permissions: {
    name: "permissions",
    label: "Permissions",
    is_primary_key: false,
    max_length: null,
    editable: true,
    help_text: "",
    auto_created: false,
    type: "ManyToManyField",
    initial: [74],
    required: true,
    choices: null,
    manytomany_choices: [
      {
        id: 74,
        label: "Accounts | customer | Can add customer",
        checked: true,
      },
      {
        id: 75,
        label: "Accounts | customer | Can change customer",
        checked: false,
      },
      {
        id: 76,
        label: "Accounts | customer | Can delete customer",
        checked: false,
      },
      {
        id: 77,
        label: "Accounts | customer | Can view customer",
        checked: false,
      },
      {
        id: 1,
        label: "Administration | log entry | Can add log entry",
        checked: false,
      },
      {
        id: 2,
        label: "Administration | log entry | Can change log entry",
        checked: false,
      },
      {
        id: 3,
        label: "Administration | log entry | Can delete log entry",
        checked: false,
      },
      {
        id: 4,
        label: "Administration | log entry | Can view log entry",
        checked: false,
      },
      {
        id: 9,
        label: "Authentication and Authorization | group | Can add group",
        checked: false,
      },
      {
        id: 10,
        label: "Authentication and Authorization | group | Can change group",
        checked: false,
      },
      {
        id: 11,
        label: "Authentication and Authorization | group | Can delete group",
        checked: false,
      },
      {
        id: 12,
        label: "Authentication and Authorization | group | Can view group",
        checked: false,
      },
      {
        id: 5,
        label:
          "Authentication and Authorization | permission | Can add permission",
        checked: false,
      },
      {
        id: 6,
        label:
          "Authentication and Authorization | permission | Can change permission",
        checked: false,
      },
      {
        id: 7,
        label:
          "Authentication and Authorization | permission | Can delete permission",
        checked: false,
      },
      {
        id: 8,
        label:
          "Authentication and Authorization | permission | Can view permission",
        checked: false,
      },
      {
        id: 13,
        label: "Content Types | content type | Can add content type",
        checked: false,
      },
      {
        id: 14,
        label: "Content Types | content type | Can change content type",
        checked: false,
      },
      {
        id: 15,
        label: "Content Types | content type | Can delete content type",
        checked: false,
      },
      {
        id: 16,
        label: "Content Types | content type | Can view content type",
        checked: false,
      },
      {
        id: 30,
        label: "Django_Admin | classification | Can add classification",
        checked: false,
      },
      {
        id: 31,
        label: "Django_Admin | classification | Can change classification",
        checked: false,
      },
      {
        id: 32,
        label: "Django_Admin | classification | Can delete classification",
        checked: false,
      },
      {
        id: 33,
        label: "Django_Admin | classification | Can view classification",
        checked: false,
      },
      {
        id: 34,
        label: "Django_Admin | country | Can add country",
        checked: false,
      },
      {
        id: 35,
        label: "Django_Admin | country | Can change country",
        checked: false,
      },
      {
        id: 36,
        label: "Django_Admin | country | Can delete country",
        checked: false,
      },
      {
        id: 37,
        label: "Django_Admin | country | Can view country",
        checked: false,
      },
      {
        id: 66,
        label: "Django_Admin | country profile | Can add country profile",
        checked: false,
      },
      {
        id: 67,
        label: "Django_Admin | country profile | Can change country profile",
        checked: false,
      },
      {
        id: 68,
        label: "Django_Admin | country profile | Can delete country profile",
        checked: false,
      },
      {
        id: 69,
        label: "Django_Admin | country profile | Can view country profile",
        checked: false,
      },
      {
        id: 58,
        label: "Django_Admin | User | Can add User",
        checked: false,
      },
      {
        id: 59,
        label: "Django_Admin | User | Can change User",
        checked: false,
      },
      {
        id: 60,
        label: "Django_Admin | User | Can delete User",
        checked: false,
      },
      {
        id: 61,
        label: "Django_Admin | User | Can view User",
        checked: false,
      },
      {
        id: 62,
        label: "Django_Admin | demo model | Can add demo model",
        checked: false,
      },
      {
        id: 63,
        label: "Django_Admin | demo model | Can change demo model",
        checked: false,
      },
      {
        id: 64,
        label: "Django_Admin | demo model | Can delete demo model",
        checked: false,
      },
      {
        id: 65,
        label: "Django_Admin | demo model | Can view demo model",
        checked: false,
      },
      {
        id: 38,
        label: "Django_Admin | level | Can add level",
        checked: false,
      },
      {
        id: 39,
        label: "Django_Admin | level | Can change level",
        checked: false,
      },
      {
        id: 40,
        label: "Django_Admin | level | Can delete level",
        checked: false,
      },
      {
        id: 41,
        label: "Django_Admin | level | Can view level",
        checked: false,
      },
      {
        id: 42,
        label:
          "Django_Admin | model documentation | Can add model documentation",
        checked: false,
      },
      {
        id: 43,
        label:
          "Django_Admin | model documentation | Can change model documentation",
        checked: false,
      },
      {
        id: 44,
        label:
          "Django_Admin | model documentation | Can delete model documentation",
        checked: false,
      },
      {
        id: 45,
        label:
          "Django_Admin | model documentation | Can view model documentation",
        checked: false,
      },
      {
        id: 46,
        label:
          "Django_Admin | saved query builder | Can add saved query builder",
        checked: false,
      },
      {
        id: 47,
        label:
          "Django_Admin | saved query builder | Can change saved query builder",
        checked: false,
      },
      {
        id: 48,
        label:
          "Django_Admin | saved query builder | Can delete saved query builder",
        checked: false,
      },
      {
        id: 49,
        label:
          "Django_Admin | saved query builder | Can view saved query builder",
        checked: false,
      },
      {
        id: 50,
        label: "Django_Admin | saved raw query | Can add saved raw query",
        checked: false,
      },
      {
        id: 51,
        label: "Django_Admin | saved raw query | Can change saved raw query",
        checked: false,
      },
      {
        id: 52,
        label: "Django_Admin | saved raw query | Can delete saved raw query",
        checked: false,
      },
      {
        id: 53,
        label: "Django_Admin | saved raw query | Can view saved raw query",
        checked: false,
      },
      {
        id: 54,
        label: "Django_Admin | type | Can add type",
        checked: false,
      },
      {
        id: 55,
        label: "Django_Admin | type | Can change type",
        checked: false,
      },
      {
        id: 56,
        label: "Django_Admin | type | Can delete type",
        checked: false,
      },
      {
        id: 57,
        label: "Django_Admin | type | Can view type",
        checked: false,
      },
      {
        id: 29,
        label: "Django_Rq | queue | Access admin page",
        checked: false,
      },
      {
        id: 70,
        label: "Products | product | Can add product",
        checked: false,
      },
      {
        id: 71,
        label: "Products | product | Can change product",
        checked: false,
      },
      {
        id: 72,
        label: "Products | product | Can delete product",
        checked: false,
      },
      {
        id: 73,
        label: "Products | product | Can view product",
        checked: false,
      },
      {
        id: 17,
        label: "Sessions | session | Can add session",
        checked: false,
      },
      {
        id: 18,
        label: "Sessions | session | Can change session",
        checked: false,
      },
      {
        id: 19,
        label: "Sessions | session | Can delete session",
        checked: false,
      },
      {
        id: 20,
        label: "Sessions | session | Can view session",
        checked: false,
      },
      {
        id: 21,
        label:
          "Token Blacklist | blacklisted token | Can add blacklisted token",
        checked: false,
      },
      {
        id: 22,
        label:
          "Token Blacklist | blacklisted token | Can change blacklisted token",
        checked: false,
      },
      {
        id: 23,
        label:
          "Token Blacklist | blacklisted token | Can delete blacklisted token",
        checked: false,
      },
      {
        id: 24,
        label:
          "Token Blacklist | blacklisted token | Can view blacklisted token",
        checked: false,
      },
      {
        id: 25,
        label:
          "Token Blacklist | outstanding token | Can add outstanding token",
        checked: false,
      },
      {
        id: 26,
        label:
          "Token Blacklist | outstanding token | Can change outstanding token",
        checked: false,
      },
      {
        id: 27,
        label:
          "Token Blacklist | outstanding token | Can delete outstanding token",
        checked: false,
      },
      {
        id: 28,
        label:
          "Token Blacklist | outstanding token | Can view outstanding token",
        checked: false,
      },
    ],
    manytomany_related_app: "auth",
    manytomany_related_model: "Permission",
  },
};

const modelAdminSettings: ModelAdminSettingsType = {
  model_name: "DemoModel",
  app_label: "django_admin",
  fieldsets: [
    {
      title: "Section 1",
      fields: [
        "id",
        ["type", "color", "name", "email"],
        ["ordering", "range_number", "amount", "is_active"],
        "comment",
      ],
    },
    {
      title: "Section 2",
      fields: [
        ["date", "time", "last_log"],
        ["classification", "permissions"],
        ["file", "image"],
        "metadata",
        "html",
      ],
    },
  ],
  list_display: [
    "name",
    "type",
    "color",
    "ordering",
    "is_active",
    "email",
    "date",
    "metadata",
    "html",
  ],
  list_per_page: 5,
  list_display_links: ["name"],
  search_fields: ["name", "email"],
  search_help_text: "Search by name, email",
  list_filter: ["color", "type", "is_active"],
  readonly_fields: ["created_at", "updated_at"],
  ordering: ["-name", "type"],
  custom_actions: [
    {
      func: "delete",
      label: "Delete selected records",
    },
    {
      func: "copy_demo_model",
      label: "Copy Demo Model",
    },
  ],
  autocomplete_fields: ["type"],
  table_filters: [
    {
      field: "color",
      values: [
        {
          value: null,
          label: "All",
        },
        {
          value: "Blue",
          label: "Blue",
        },
        {
          value: "Red",
          label: "Red",
        },
      ],
    },
    {
      field: "type",
      values: [
        {
          value: null,
          label: "All",
        },
        {
          value: 1,
          label: "Success",
        },
        {
          value: 2,
          label: "Info",
        },
        {
          value: 3,
          label: "Warning",
        },
        {
          value: 4,
          label: "Danger",
        },
      ],
    },
    {
      field: "is_active",
      values: [
        {
          value: null,
          label: "All",
        },
        {
          value: true,
          label: "True",
        },
        {
          value: false,
          label: "False",
        },
      ],
    },
  ],
  custom_inlines: [],
  extra_inlines: [],
  custom_change_link: "",
  table_header: "sample_listview_table_header",
};

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
  }
};

const clearFieldError = (fieldName: string) => {
  formErrors.value[fieldName] = "";
};

const handleSaveAndAdd = () => {};

const handleSaveAndEdit = () => {};
</script>

<template>
  <form novalidate="true" class="pb-10" @submit.prevent="">
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
      @save="handleSave"
      @save-add="handleSaveAndAdd"
      @save-edit="handleSaveAndEdit"
    />
  </form>
</template>
