<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem } from "@nuxt/ui";
import type { ModelFieldType } from "~/shared/types/app";
import ImageUpload from "./extensions/htmlfield/EditorImageUploadExtension";
import type { Editor } from "@tiptap/vue-3";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";
import EditorLinkPopover from "./extensions/htmlfield/EditorLinkPopover.vue";

defineProps<{
  field: ModelFieldType;
  errorMessage?: string;
}>();

const emit = defineEmits(["clear-error"]);

// 1. Initialize lowlight and register your languages
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("python", python);

// 2. Configure the extension
const customCodeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "javascript", // Optional: set a default
});

// 3. Update your extensions list
// Note: You MUST disable the starter-kit's codeBlock to avoid conflicts
const editorExtensions = [
  customCodeBlock,
  ImageUpload,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelValue = defineModel<any>({
  default: (props: { field: ModelFieldType }) => props.field.initial,
});

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) =>
      editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) =>
      editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;

const items = [
  [
    {
      kind: "imageUpload",
      icon: "i-lucide-image",
      label: "Add image",
      variant: "soft",
    },
  ],
  [
    {
      icon: "i-lucide-heading",
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-lucide-heading-1",
          label: "Heading 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Heading 4",
        },
      ],
    },
  ],
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
    },
    { kind: "textAlign", align: "left", icon: "i-lucide-align-left" },
    { kind: "textAlign", align: "center", icon: "i-lucide-align-center" },
    { kind: "textAlign", align: "right", icon: "i-lucide-align-right" },
    { kind: "bulletList", icon: "i-lucide-list" },
    { kind: "orderedList", icon: "i-lucide-list-ordered" },
    { slot: 'link' as const },
    {
      kind: "codeBlock", // This triggers the multi-line block
      icon: "i-lucide-code-2",
      label: "Code Block",
    },
  ],
] satisfies EditorToolbarItem<typeof customHandlers>[][];
</script>

<template>
  <Field>
    <FieldLabel :for="field.name"> {{ field.label }} </FieldLabel>
    <UEditor
      v-slot="{ editor }"
      v-model="modelValue"
      content-type="html"
      :editable="field.editable"
      :extensions="editorExtensions"
      :starter-kit="{
        codeBlock: false,
      }"
      :handlers="customHandlers"
      :class="[
        'border rounded-md transition-colors min-h-40 p-2',
        errorMessage
          ? 'border-red-500 ring-1 ring-red-500'
          : 'border-slate-300 dark:border-slate-700 ring-0 ring-slate-300 dark:ring-slate-700',
      ]"
      @update:model-value="emit('clear-error')"
    >
      <UEditorToolbar :editor="editor" :items="items">
        <template #link>
          <EditorLinkPopover :editor="editor" auto-open />
        </template>
      </UEditorToolbar>
    </UEditor>
    <FieldDescription class="text-xs">{{ field.help_text }}</FieldDescription>
  </Field>
  <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
</template>
