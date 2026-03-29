<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { ACCESS_TOKEN_KEY } from "~/shared/constants/app";
import { PublicRoute } from "~/shared/constants/routes";
import { useAppStore } from "~/stores/app";

const isDark = useDark();

const appStore = useAppStore();
const userStore = useUserStore();

const onLogout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  userStore.setUser(null);
  navigateTo(PublicRoute.Login);
};

const onAppSearchClick = () => {
  appStore.setIsModalOpen(!appStore.isModalOpen);
}
</script>

<template>
  <div class="border-b-[0.3px] flex items-center justify-between p-2">
    <h1 class="font-extrabold text-2xl">Logo</h1>

    <!-- <AppMenuList /> -->
    <div class="flex gap-2">
      <Button
        v-if="userStore.user"
        class="p-2"
        @click="onAppSearchClick"
      >
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

      <Popover v-if="userStore.user">
        <PopoverTrigger as-child>
          <Button class="p-2">
            <Icon
              name="iconamoon:profile-fill"
              size="25"
              class="cursor-pointer"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
          <div class="grid gap-4">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">
                {{ userStore.user.email }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="cursor-pointer border-b py-2">
                <p class="text-sm">Settings</p>
              </div>
              <div class="cursor-pointer border-b py-2" @click="onLogout">
                <p class="text-sm">Logout</p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div class="lg:hidden">
        <!-- <AppMobileMenuList /> -->
      </div>
    </div>
  </div>
</template>
