<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor
  autoOpen?: boolean
}>()

const open = ref(false)
const url = ref('')
const target = ref('_blank')

// Use :items for Nuxt UI v4
const targetOptions = [
  { label: 'Current Tab', value: '_self' },
  { label: 'New Tab', value: '_blank' },
  { label: 'New Window', value: 'window' }
]

const active = computed(() => props.editor.isActive('link'))
const disabled = computed(() => {
  if (!props.editor.isEditable) return true
  const { selection } = props.editor.state
  return selection.empty && !props.editor.isActive('link')
})

watch(() => props.editor, (editor, _, onCleanup) => {
  if (!editor) return

  const updateUrl = () => {
    const attrs = editor.getAttributes('link')
    url.value = attrs.href || ''
    target.value = attrs.target || '_blank'
  }

  updateUrl()
  editor.on('selectionUpdate', updateUrl)
  onCleanup(() => editor.off('selectionUpdate', updateUrl))
}, { immediate: true })

function setLink() {
  if (!url.value) return
  const linkTarget = target.value === 'window' ? '_blank' : target.value
  
  props.editor.chain().focus()
    .extendMarkRange('link')
    .setLink({ href: url.value, target: linkTarget })
    .run()

  open.value = false
}

function removeLink() {
  props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
  url.value = ''
  open.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    setLink()
  }
}
</script>

<template>
  <UPopover v-model:open="open" :ui="{ content: 'p-3 w-64' }">
    <UTooltip text="Link">
      <UButton
        icon="i-lucide-link"
        color="neutral"
        variant="ghost"
        size="sm"
        :active="active"
        :disabled="disabled"
      />
    </UTooltip>

    <template #content>
      <div class="flex flex-col gap-4">
        <UInput
          v-model="url"
          autofocus
          placeholder="Paste link..."
          @keydown="handleKeyDown"
        />

        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-bold text-gray-400 uppercase">Open In</span>
          <!-- Changed :options to :items -->
          <URadioGroup
            v-model="target"
            :items="targetOptions"
          />
        </div>

        <div class="flex justify-end gap-2 border-t pt-2 dark:border-gray-800">
          <UButton
            icon="i-lucide-trash"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="removeLink"
          />
          <UButton
            label="Apply"
            size="sm"
            @click="setLink"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
