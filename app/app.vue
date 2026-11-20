<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" error-color="var(--ui-error)" :height="2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
