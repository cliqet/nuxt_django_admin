<script setup lang="ts">
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import Collapsible from "./ui/collapsible/Collapsible.vue";
import CollapsibleTrigger from "./ui/collapsible/CollapsibleTrigger.vue";
import CollapsibleContent from "./ui/collapsible/CollapsibleContent.vue";
import { DashboardRoute } from "~/shared/constants/routes";

const appStore = useAppStore();

const allowedApps = computed(() => {
  return appStore.appSettings
    .filter(app => app.hasModulePerms) // 1. Keep only allowed groups
    .map(app => ({
      ...app,
      // 2. Filter the models inside each group
      models: app.models.filter(model => model.perms.view) 
    }))
});

const appOpenStates = ref<Record<string, boolean>>({});

// Watch allowedApps and fill the object with 'true' for any new apps
watch(allowedApps, (newApps) => {
  newApps.forEach(app => {
    if (appOpenStates.value[app.name] === undefined) {
      appOpenStates.value[app.name] = true;
    }
  });
}, { immediate: true });
</script>

<template>
  <ClientOnly v-if="allowedApps.length > 0">
    <Sidebar class="border-r-slate-400">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel class="cursor-pointer">
            <NuxtLink :href="`${DashboardRoute.DashboardHome}`">
              <div class="flex items-center gap-1">
                <Icon name="ep:back" size="20" class="text-primary" />
                <span class="font-bold text-sm text-primary">Dashboard</span>
              </div>
            </NuxtLink>
          </SidebarGroupLabel>
          <SidebarGroupContent class="pb-10">
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible
                  v-for="app in allowedApps"
                  :key="app.name"
                  default-open
                  class="group/collapsible"
                >
                  <SidebarGroup  
                    v-if="app.hasModulePerms"
                    class="py-0"
                  >
                    <SidebarGroupLabel as-child>
                      <CollapsibleTrigger 
                        class="bg-primary my-2 py-1 flex h-fit" 
                        @click="appOpenStates[app.name] = !appOpenStates[app.name]"
                      >
                        <div class="grow">
                          <span class="font-bold text-white text-sm">
                            {{ app.name }}
                          </span>
                        </div>
                        <div class="ml-auto">
                          <ChevronUp
                            v-if="appOpenStates[app.name]"
                            class="transition-transform cursor-pointer text-white"
                            :size="18"
                          />
                          <ChevronDown
                            v-else
                            class="transition-transform cursor-pointer text-white"
                            :size="18"
                          />
                        </div>
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent v-if="appOpenStates[app.name]">
                        <SidebarMenu>
                          <SidebarMenuItem
                            v-for="model in app.models"
                            :key="model.name"
                            class="flex justify-between"
                          >
                            <SidebarMenuButton
                              v-if="model.perms.view"
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
                            <div
                              v-if="model.perms.add" 
                              class="flex items-center justify-center"
                            >
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
