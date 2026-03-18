<script setup lang="ts">
import type { AppSettingsType } from "~/shared/types/app";
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { useAdminApiRequests } from "~/composables/admin/useAdminApiRequests";
import Collapsible from "./ui/collapsible/Collapsible.vue";
import CollapsibleTrigger from "./ui/collapsible/CollapsibleTrigger.vue";
import CollapsibleContent from "./ui/collapsible/CollapsibleContent.vue";

const { getAdminAppRequest } = useAdminApiRequests();

const appSettings = ref<AppSettingsType[]>([]);

const response = await getAdminAppRequest();
appSettings.value = response.appList;

const appOpenStates = ref(
  Array.from({ length: appSettings.value.length }, () => true)
);
</script>

<template>
  <ClientOnly v-if="appSettings">
    <Sidebar class="border-r-slate-400">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel class="cursor-pointer">
            <NuxtLink href="/">
              <div class="flex items-center gap-1">
                <Icon name="ep:back" size="20" class="text-primary" />
                <span class="font-bold text-sm text-primary">Home</span>
              </div>
            </NuxtLink>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible
                  v-for="(app, index) in appSettings"
                  :key="app.name"
                  default-open
                  class="group/collapsible"
                >
                  <SidebarGroup class="py-0">
                    <SidebarGroupLabel as-child>
                      <CollapsibleTrigger class="bg-primary my-2 py-1 flex h-fit">
                        <div class="grow">
                          <span class="font-bold text-white text-sm">
                            {{ app.name }}
                          </span>
                        </div>
                        <div class="ml-auto">
                          <ChevronUp
                            v-if="appOpenStates[index]"
                            :class="{ 'rotate-180': !appOpenStates[index] }"
                            class="transition-transform cursor-pointer text-white"
                            :size="18"
                            @click="appOpenStates[index] = false"
                          />
                          <ChevronDown
                            v-if="!appOpenStates[index]"
                            :class="{ 'rotate-180': appOpenStates[index] }"
                            class="transition-transform cursor-pointer text-white"
                            @click="appOpenStates[index] = true"
                          />
                        </div>
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent v-if="appOpenStates[index]">
                        <SidebarMenu>
                          <SidebarMenuItem
                            v-for="model in app.models"
                            :key="model.name"
                            class="flex justify-between"
                          >
                            <SidebarMenuButton
                              as-child
                              class="min-h-6 h-auto py-1 flex"
                            >
                              <NuxtLink
                                :href="model.adminUrl"
                                class="hover:underline hover:decoration-primary hover:bg-transparent"
                              >
                                <span class="text-[13px]">{{
                                  model.name
                                }}</span>
                              </NuxtLink>
                            </SidebarMenuButton>
                            <div class="flex items-center justify-center">
                              <NuxtLink :href="model.addUrl">
                                <Icon
                                  size="18"
                                  name="stash:plus-duotone"
                                  class="text-main-color pr-8 hover:text-primary"
                                />
                              </NuxtLink>
                            </div>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </ClientOnly>
</template>
