<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useDark } from "@vueuse/core";
import { ACCESS_TOKEN_KEY } from "~/shared/constants/app";
import { DashboardRoute, PublicRoute } from "~/shared/constants/routes";
import { useAppStore } from "~/stores/app";

const isDark = useDark();

const appStore = useAppStore();
const userStore = useUserStore();

const onLogout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  userStore.setUser(null);
  navigateTo(PublicRoute.Login);
};

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: userStore.user?.email,
      type: "label"
    }
  ],
  [
    {
      label: 'Settings',
      to: DashboardRoute.DashboardHome
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      color: 'error',
      class: 'cursor-pointer flex items-center',
      iconClass: 'self-center align-middle', 
      onSelect: onLogout
    }
  ]
]);



const onAppSearchClick = () => {
  appStore.setIsModalOpen(!appStore.isModalOpen);
};
</script>

<template>
  <div class="border-b-[0.3px] flex items-center justify-between p-2">
    <h1 class="font-extrabold text-2xl">Logo</h1>

    <!-- <AppMenuList /> -->
    <div class="flex gap-2">
      <Button v-if="userStore.user" class="p-2" @click="onAppSearchClick">
        <Icon
          name="bitcoin-icons:search-outline"
          size="25"
          class="cursor-pointer"
        />
      </Button>

      <ClientOnly>
        <Button class="p-2" @click="() => (isDark = !isDark)">
          <Icon
            v-if="isDark"
            name="mynaui:sun"
            size="20"
            class="cursor-pointer"
          />
          <Icon
            v-if="!isDark"
            name="mynaui:moon"
            size="20"
            class="cursor-pointer"
          />
        </Button>
      </ClientOnly>

      <UDropdownMenu :items="items">
        <UButton 
          icon="i-lucide-circle-user"
          size="xl"
          variant="solid"
          color="primary"
          class="text-white text-xl justify-center cursor-pointer"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
