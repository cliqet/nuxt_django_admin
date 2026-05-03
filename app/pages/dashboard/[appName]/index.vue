<script setup lang="ts">
const appStore = useAppStore();
const route = useRoute();
const appSegment = ref<string>(route.path.split("/").at(-1) as string);

const currentApp = appStore.appSettings.find(
  (app) => app.appLabel === appSegment.value
);
</script>

<template>
  <div v-if="currentApp">
    <h1 class="text-xl font-bold text-primary">{{ currentApp.name }}</h1>

    <div class="mt-3 w-full md:w-1/2 lg:w-1/3">
      <div
        v-for="model in currentApp.models"
        :key="model.name"
        class="my-2 py-1 grid grid-cols-[1fr_auto] hover:bg-slate-200 dark:hover:bg-slate-800"
      >
        <NuxtLink
          :href="model.adminUrl"
          class="flex items-center hover:underline hover:decoration-primary hover:bg-transparent"
        >
          <span class="text-[13px] leading-none">{{ model.name }}</span>
        </NuxtLink>

        <NuxtLink :href="model.addUrl" class="flex items-center ml-10">
          <Icon
            size="18"
            name="stash:plus-duotone"
            class="text-main-color hover:text-primary"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
