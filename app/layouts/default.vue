<template>
  <div class="min-h-dvh">
    <div class="fixed inset-x-0 top-0 z-50">
      <AppHeader />
    </div>

    <AppScrollSmoother content-class="flex min-h-dvh flex-col pt-(--ui-header-height)">
      <UMain class="min-h-0 flex-1">
        <slot />
      </UMain>

      <AppFooter />
    </AppScrollSmoother>
  </div>
</template>
