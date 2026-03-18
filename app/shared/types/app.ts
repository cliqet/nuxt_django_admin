export type AppType = {
  isSearchDialogOpen: boolean;
};

export type MenuItemType = {
  title: string;
  url: string;
};

export type MenuItemObjectType = {
  [key: string]: MenuItemType[];
};

export type AppInfoType = {
  name: string;
  description: string;
  link: string;
};

export type AppGroupType = {
  name: string;
  appList: AppInfoType[];
};

export type ModelPermissionType = {
  add: boolean;
  change: boolean;
  delete: boolean;
  view: boolean;
};

export type AppModelType = {
  name: string;
  objectName: string;
  adminUrl: string;
  addUrl: string;
  perms: ModelPermissionType;
  viewOnly: boolean;
};

export type AppSettingsType = {
  name: string;
  appLabel: string;
  appUrl: string;
  hasModulePerms: boolean;
  models: AppModelType[];
};

export type AppListType = {
  appList: AppSettingsType[];
};

/**
 * FORM FIELD TYPES
 */

export type SelectedOptionsType = {
  selected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  label: string;
};

export type ManyToManyCheckboxDataType = {
  id: string | number;
  checked: boolean;
  label: string;
};

export type DjangoFieldType =
  | "CharField"
  | "IntegerField"
  | "DecimalField"
  | "EmailField"
  | "BooleanField"
  | "DateField"
  | "TimeField"
  | "DateTimeField"
  | "JSONField" 
  | "HTMLField" 
  | "BigAutoField" 
  | "PositiveIntegerField" 
  | "PositiveSmallIntegerField" 
  | "ManyToManyField" 
  | "ImageField" 
  | "FileField" 
  | "OneToOneField" 
  | "TextField" 
  | "ForeignKey" 
  | "SlugField";

export type ModelFieldType = {
  name: string;
  label: string;
  is_primary_key: boolean;
  max_length: number | null;
  editable: boolean;
  help_text: string;
  auto_created: boolean;
  type: DjangoFieldType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: any;
  required: boolean;
  choices: SelectedOptionsType[] | null;
  foreignkey_choices?: SelectedOptionsType[] | null;
  foreignkey_app?: string;
  foreignkey_model?: string;
  foreignkey_string?: string;
  regex_pattern?: string;
  regex_message?: string;
  min_value?: number;
  max_value?: number;
  max_digits?: number;
  decimal_places?: number;
  manytomany_choices?: ManyToManyCheckboxDataType[];
  manytomany_related_app?: string;
  manytomany_related_model?: string;
};

export type ModelFieldsObjType = {
  [key: string]: ModelFieldType;
};

/** Model Admin Settings */
export type FieldsetType = {
  title: string;
  fields: (string | string[])[];
};

export type FieldStateType = {
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  isInvalid: boolean;
  errorMsg: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
};

export type FieldsInFormStateType = {
  [key: string]: FieldStateType;
};

export type CustomActionsType = {
  func: string;
  label: string;
};

export type TableFilterValues = {
  value: string | number | boolean | null;
  label: string;
}

export type TableFiltersType = {
  field: string;
  values: TableFilterValues[];
}

export type CustomInlineType = {
  app_label: string;
  model_name: string;
  model_name_label: string;
  list_display: string[];
  list_display_links: string[];
  custom_change_link: string;
  list_per_page: number;
  class_name: string;
  table_header: string;
}

export type ModelAdminSettingsType = {
  model_name: string;
  app_label: string;
  fieldsets: FieldsetType[];
  list_display: string[];
  list_display_links: string[];
  list_per_page: number;
  search_fields: string[];
  search_help_text: string;
  list_filter: string[];
  readonly_fields: string[];
  ordering: string[];
  custom_actions: CustomActionsType[];
  autocomplete_fields: string[];
  table_filters: TableFiltersType[];
  custom_inlines: CustomInlineType[];
  extra_inlines: string[];
  custom_change_link: string;
  table_header: string;
};

export type ListviewDataType = {
  count: number;
  next: string | null;
  previous: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
}
