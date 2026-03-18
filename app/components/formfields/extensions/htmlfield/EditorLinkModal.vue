<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  initialUrl?: string
  initialTarget?: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const url = ref(props.initialUrl || '')
const openInNewTab = ref(props.initialTarget === '_blank')

const save = () => {
  emit('submit', { 
    url: url.value, 
    target: openInNewTab.value ? '_blank' : '_self' 
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6">Edit Link</h3>
          <UButton color="primary" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('update:modelValue', false)" />
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="URL">
          <UInput v-model="url" placeholder="https://example.com" autofocus />
        </UFormGroup>
        
        <UFormGroup>
          <UCheckbox v-model="openInNewTab" label="Open in new tab" />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end gap-x-3">
          <UButton color="primary" variant="ghost" label="Cancel" @click="emit('update:modelValue', false)" />
          <UButton color="primary" label="Save" @click="save" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
