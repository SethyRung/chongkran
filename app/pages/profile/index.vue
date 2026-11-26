<script setup lang="ts">
const { user, fetchSession } = useUserSession();
const toast = useToast();
const requestingAuthorAccess = ref(false);

const { data: stats } = useLazyFetch(() => `/api/follows/stats/${user.value?.id}`);
const {
  data: favorites,
  status: favoritesStatus,
  refresh: refreshFavorites,
} = useLazyFetch("/api/favorites", {
  query: { limit: 6 },
});
const { data: published } = useLazyFetch("/api/recipes/my", {
  query: { limit: 1, status: "approved" },
});

const cards = computed(() => [
  {
    label: "Recipes",
    value: isSuccessResponse(published.value) ? (published.value.meta?.total ?? 0) : 0,
  },
  { label: "Followers", value: stats.value?.data?.followersCount ?? 0 },
  { label: "Following", value: stats.value?.data?.followingCount ?? 0 },
]);

async function requestAuthorAccess() {
  if (requestingAuthorAccess.value) return;
  requestingAuthorAccess.value = true;
  try {
    const result = await $fetch("/api/users/become-author", { method: "PUT" });
    if (!isSuccessResponse(result)) throw new Error(result.status.message);
    await fetchSession({ force: true });
    toast.add({ title: "Author request submitted", color: "success" });
  } catch {
    toast.add({ title: "Couldn’t submit the request", color: "error" });
  } finally {
    requestingAuthorAccess.value = false;
  }
}
</script>

<template>
  <div class="space-y-7">
    <dl class="grid grid-cols-3 gap-2 sm:gap-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-md border border-default bg-elevated light:bg-cream-50 p-3 sm:p-4"
      >
        <dt class="text-sm font-medium text-muted">{{ card.label }}</dt>
        <dd class="font-display font-normal leading-[1.12] mt-1 text-3xl">{{ card.value }}</dd>
      </div>
    </dl>
    <UAlert
      v-if="user?.role === 'user' && user.authorRequestStatus === 'pending'"
      title="Author request pending"
      variant="soft"
      color="warning"
    />
    <UButton
      v-else-if="user?.role === 'user'"
      label="Apply to become an author"
      icon="i-lucide-user-plus"
      color="neutral"
      variant="outline"
      :loading="requestingAuthorAccess"
      @click="requestAuthorAccess"
    />
    <section>
      <h2 id="saved-recipes" class="font-display font-normal leading-[1.12] mb-4 text-3xl">
        Saved recipes
      </h2>
      <USkeleton v-if="favoritesStatus === 'idle' || favoritesStatus === 'pending'" class="h-48" />
      <UAlert
        v-else-if="favoritesStatus === 'error'"
        title="Couldn’t load saved recipes"
        color="error"
        variant="soft"
        :actions="[{ label: 'Try again', onClick: () => refreshFavorites() }]"
      />
      <div v-else-if="favorites?.data?.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RecipeCard v-for="recipe in favorites.data" :key="recipe.id" :recipe="recipe" compact />
      </div>
      <UEmpty
        v-else
        :as="{ title: 'h3' }"
        title="No saved recipes"
        description="Select the heart on any recipe to save it here."
        class="gap-4 rounded-md bg-elevated light:bg-cream-100"
        :ui="{
          title: 'font-display text-2xl leading-[1.12] font-normal sm:text-3xl',
          body: 'w-full max-w-64',
          actions: 'w-full',
        }"
      >
        <template #leading>
          <UIcon name="i-lucide-heart" class="size-8 text-highlighted" />
        </template>

        <template #actions>
          <UButton
            to="/recipes"
            label="Browse recipes"
            trailing-icon="i-lucide-arrow-right"
            class="font-display"
          />
        </template>
      </UEmpty>
    </section>
  </div>
</template>
