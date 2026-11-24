<script setup lang="ts">
useSeoMeta({
  title: "Chongkran — What’s cooking?",
  description: "Find recipes by ingredient, browse categories, and plan what to cook this week.",
});

const { data: categories } = useLazyFetch("/api/categories", { query: { limit: 100 } });
const {
  data: popular,
  status: popularStatus,
  refresh: refreshPopular,
} = useLazyFetch("/api/recipes/popular", { query: { limit: 3 } });

const tiles = computed(() =>
  featuredCategories.map((feature) => {
    const category = categories.value?.data?.find(({ name }) => feature.pattern.test(name));
    const to = category ? `/categories/${category.id}` : { path: "/recipes", query: feature.query };
    return { ...feature, to };
  }),
);

function submitSearch(search: string) {
  return navigateTo({ path: "/recipes", query: search ? { search } : {} });
}
</script>

<template>
  <HomeIntro>
    <section class="relative isolate overflow-hidden bg-ink-950 text-cream-200">
      <div
        class="absolute inset-0 -z-10 bg-chili-700 [clip-path:polygon(0_100%,100%_52%,100%_100%)] lg:[clip-path:polygon(64%_0,100%_0,100%_100%,41%_100%)]"
      />
      <UContainer class="relative grid items-center lg:min-h-100 lg:grid-cols-[5fr_7fr]">
        <div class="relative z-10 pt-8 pb-2 sm:pt-12 lg:py-12">
          <h1
            class="font-display font-normal uppercase mb-5 text-[clamp(3.75rem,13vw,6.5rem)] leading-[0.98] lg:text-[clamp(5.25rem,8.1vw,8.5rem)]"
          >
            <span class="block overflow-hidden">
              <span data-intro-heading class="block">What’s</span>
            </span>
            <span class="block overflow-hidden text-turmeric-400">
              <span data-intro-heading class="block">Cooking?</span>
            </span>
          </h1>
          <RecipeSearch hero data-intro-detail @search="submitSearch" />
        </div>

        <figure
          data-intro-detail
          class="relative isolate -mx-4 min-h-42 self-stretch sm:-mx-6 lg:mx-0 lg:min-h-0"
        >
          <img
            src="/images/food/nom-banh-chok.webp"
            alt="Nom banh chok, Cambodian rice noodles with green fish curry and fresh herbs"
            width="1200"
            height="800"
            fetchpriority="high"
            class="mx-auto -mt-2 block h-56 w-full object-contain object-center sm:h-76 lg:absolute lg:inset-0 lg:mt-0 lg:size-full lg:scale-110"
          />
          <figcaption
            class="relative flex justify-end px-4 pb-4 sm:px-6 lg:absolute lg:right-0 lg:bottom-1 lg:p-0"
          >
            <NuxtLink
              :to="{ path: '/recipes', query: { search: 'Nom banh chok' } }"
              class="inline-flex items-center gap-1.5 rounded-sm bg-ink-950/85 px-2.5 py-1 text-sm font-semibold underline underline-offset-4"
            >
              Nom banh chok <UIcon name="i-lucide-arrow-up-right" class="size-4" />
            </NuxtLink>
          </figcaption>
        </figure>
      </UContainer>
    </section>

    <UContainer class="space-y-6 py-5 sm:space-y-5 sm:py-5">
      <section>
        <div class="mb-3 flex items-center justify-between gap-4">
          <h2
            id="home-categories"
            class="font-display font-normal leading-[1.12] text-2xl text-highlighted sm:text-4xl"
          >
            Browse categories
          </h2>
          <NuxtLink
            to="/categories"
            class="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-highlighted underline underline-offset-4"
          >
            All categories <UIcon name="i-lucide-arrow-right" class="size-4" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <CategoryTile
            v-for="tile in tiles"
            :key="tile.label"
            :name="tile.label"
            :to="tile.to"
            :image="tile.image"
            :tone="tile.tone"
          />
        </div>
      </section>

      <section>
        <h2
          id="home-popular"
          class="font-display font-normal leading-[1.12] mb-3 text-2xl text-highlighted sm:text-4xl"
        >
          Popular recipes
        </h2>
        <div
          v-if="popularStatus === 'idle' || popularStatus === 'pending'"
          class="grid gap-4 sm:grid-cols-3"
        >
          <USkeleton v-for="index in 3" :key="index" class="h-56" />
        </div>
        <UAlert
          v-else-if="popularStatus === 'error'"
          title="Couldn’t load popular recipes"
          color="error"
          variant="soft"
          :actions="[{ label: 'Try again', onClick: () => refreshPopular() }]"
        />
        <div v-else-if="popular?.data?.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RecipeCard v-for="recipe in popular.data" :key="recipe.id" :recipe="recipe" compact />
        </div>
        <div v-else class="rounded-md border border-default bg-elevated light:bg-cream-50 p-6">
          <p class="mb-3 text-muted">Popular recipes will appear here as cooks share them.</p>
          <UButton to="/recipes" label="Browse recipes" trailing-icon="i-lucide-arrow-right" />
        </div>
      </section>
    </UContainer>
  </HomeIntro>
</template>
