<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{
  name: string;
  to: RouteLocationRaw;
  image?: string;
  tone?: string;
  count?: number;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative isolate flex min-h-32 flex-col justify-between overflow-hidden rounded-md p-3 sm:min-h-42 sm:p-5"
    :class="tone ?? 'bg-ink-950 text-cream-200'"
  >
    <img
      v-if="image"
      :src="image"
      alt=""
      loading="lazy"
      class="absolute inset-0 -z-20 size-full object-cover object-center transition-transform duration-300 motion-safe:group-hover:scale-105"
    />
    <div
      v-if="image"
      class="absolute inset-0 -z-10 bg-linear-to-b via-transparent to-transparent"
      :class="tone?.includes('text-ink-950') ? 'from-turmeric-400/90' : 'from-ink-950/60'"
    />
    <h3
      class="font-display font-normal leading-[1.06] uppercase max-w-48 text-xl sm:text-3xl xl:text-4xl"
    >
      {{ name }}
    </h3>
    <span
      v-if="count !== undefined"
      class="mt-3 self-start rounded-sm px-2 py-0.5 text-xs font-semibold"
      :class="tone?.includes('text-ink-950') ? 'bg-turmeric-400' : 'bg-ink-950'"
    >
      {{ count }} {{ count === 1 ? "recipe" : "recipes" }}
    </span>
    <UIcon v-else name="i-lucide-arrow-up-right" class="mt-auto size-5 self-end" />
  </NuxtLink>
</template>
