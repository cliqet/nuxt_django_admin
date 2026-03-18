<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';
import { DashboardRoute } from '~/shared/constants/routes';

const route = useRoute();

const formatTitle = (str: string) => {
  return str
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .toLowerCase()         // Optional: normalization to ensure consistent casing
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize every first letter
};

const items = computed<BreadcrumbItem[]>(() => {
  // Start with the fixed Home item
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      to: DashboardRoute.DashboardHome
    }
  ];

  // Extract segments after the DashboardHome base path
  const [_, rightSideRoute] = route.path.split(DashboardRoute.DashboardHome);
  
  if (rightSideRoute) {
    const segments = rightSideRoute.split("/").filter(Boolean);
    let accumulatedPath = DashboardRoute.DashboardHome as string;

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      // Append current segment to the path for the link
      accumulatedPath = `${accumulatedPath.replace(/\/$/, '')}/${segment}`;

      breadcrumbs.push({
        label: formatTitle(segment),
        // Only add 'to' if it's not the last item
        ...(isLast ? {} : { to: accumulatedPath })
      });
    });
  }

  return breadcrumbs;
});
</script>

<template>
  <div class="flex flex-col h-screen overflow-y-hidden">
    <AppHeader />
    <AppSearchDialog />
    <SidebarProvider
      class="h-screen"
    >
      <AppSidebar />
      <main class="relative px-3 md:px-10 py-3 w-full overflow-y-auto">
        <SidebarTrigger class="absolute top-1/3 left-0 cursor-pointer" />
        <div class="h-full w-full pb-40 px-5">
          <UBreadcrumb :items="items" class="mb-3" />
          <slot />
        </div>
      </main>
    </SidebarProvider>
  </div>
</template>
