<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-vue-next";

defineProps<{
  placeholder?: string;
}>();

// This replaces the old modelValue prop and emit logic
const modelValue = defineModel<string>({ default: "" });

const emit = defineEmits(["search"]);

const clear = () => {
  modelValue.value = "";
  emit("search", modelValue.value);
};
</script>

<template>
  <form
    class="flex w-full max-w-sm items-center space-x-2"
    @submit.prevent="emit('search', modelValue)"
  >
    <div class="relative w-full items-center">
      <span
        class="absolute inset-y-0 inset-s-0 flex items-center justify-center px-3 pointer-events-none"
      >
        <Search class="size-4 text-muted-foreground" />
      </span>

      <!-- Bind directly to modelValue -->
      <Input
        v-model="modelValue"
        type="text"
        :placeholder="placeholder || 'Search...'"
        class="pl-10 pr-10"
      />

      <Button
        v-if="modelValue"
        type="button"
        class="bg-transparent absolute inset-y-0 inset-e-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground"
        @click="clear"
      >
        <X class="size-4" />
      </Button>
    </div>

    <Button
      type="submit"
      class="cursor-pointer"
      @click="emit('search', modelValue)"
    >
      Search
    </Button>
  </form>
</template>
