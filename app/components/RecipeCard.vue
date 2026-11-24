<script setup lang="ts">
const props = defineProps<{ recipe: RecipeResponse; compact?: boolean }>();
const imageFailed = ref(false);
watch(
  () => props.recipe.image,
  () => (imageFailed.value = false),
);
const { isSaved, loading, toggle } = useRecipeFavorite(() => props.recipe.id);
</script>

<template>
  <article
    :data-recipe-card="recipe.id"
    class="group relative flex flex-col overflow-hidden rounded-md border border-default bg-elevated light:bg-cream-50"
  >
    <NuxtLink
      :to="`/recipes/${recipe.id}`"
      tabindex="-1"
      class="relative block overflow-hidden bg-muted"
      :class="compact ? 'aspect-[2.65/1]' : 'aspect-[4/3]'"
    >
      <img
        v-if="recipe.image && !imageFailed"
        :src="recipe.image"
        alt=""
        loading="lazy"
        data-recipe-card-photo
        @error="imageFailed = true"
        class="size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
      />
      <UIcon
        v-else
        name="i-lucide-cooking-pot"
        class="absolute inset-0 m-auto size-12 text-dimmed"
      />
    </NuxtLink>

    <div class="flex flex-1 gap-2.5 p-3" :class="compact ? 'items-center' : 'items-start'">
      <div class="min-w-0 flex-1">
        <h3 class="font-display font-normal leading-[1.12] text-xl text-highlighted sm:text-2xl">
          <NuxtLink :to="`/recipes/${recipe.id}`" class="hover:underline underline-offset-4">
            {{ recipe.title }}
          </NuxtLink>
        </h3>
        <p v-if="!compact" class="mt-1 truncate text-sm text-muted">
          {{ recipe.authorName || "Community recipe" }}
        </p>
        <p v-if="!compact" class="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <UIcon name="i-lucide-clock" class="size-4" /> {{ recipe.cookTime }} min
          <span>·</span>
          <span class="capitalize">{{ recipe.difficulty }}</span>
        </p>
      </div>
      <p v-if="compact" class="flex shrink-0 items-center gap-1 text-xs text-muted sm:text-sm">
        <UIcon name="i-lucide-clock" class="size-4" /> {{ recipe.cookTime }} min
      </p>
      <UButton
        icon="i-lucide-heart"
        :color="isSaved ? 'error' : 'neutral'"
        variant="outline"
        :class="{ 'light:bg-cream-200': !isSaved }"
        :loading="loading"
        :ui="{ leadingIcon: isSaved ? 'fill-current' : '' }"
        @click="toggle"
      />
    </div>
  </article>
</template>
