<script setup lang="ts">
import { Button } from '@/components/ui/button'

// Define the three events the parent can listen to
const emit = defineEmits<{
  (e: 'save' | 'save-add' | 'save-edit'): void
}>()
</script>

<template>
  <div class="flex gap-2 border border-primary rounded-md my-6 p-2 w-fit">
    <Button class="cursor-pointer" @click="emit('save')">
      SAVE
    </Button>
    
    <Button class="bg-primary/50 cursor-pointer" @click="emit('save-add')">
      Save and add another
    </Button>
    
    <Button variant="outline" class="cursor-pointer" @click="emit('save-edit')">
      Save and continue editing
    </Button>
  </div>
</template>
