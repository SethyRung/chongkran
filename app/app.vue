<script setup lang="ts">
useHead({ htmlAttrs: { lang: "en" } });
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" error-color="var(--ui-error)" :height="2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
