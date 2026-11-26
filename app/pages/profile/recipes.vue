<script setup lang="ts">
definePageMeta({ pageTransition: false });
useSeoMeta({ title: "My recipes · Chongkran" });

const { user } = useUserSession();
const canPublish = computed(() => user.value?.role === "admin" || user.value?.role === "author");
const mounted = useMounted();
const page = ref(1);
const limit = 10;
const draft = shallowRef<RecipeDraft>();
const {
  data: recipesResponse,
  status: recipesStatus,
  refresh: refreshRecipes,
} = useLazyFetch("/api/recipes/my", {
  query: computed(() => ({ status: "all", limit, offset: (page.value - 1) * limit })),
});
const recipes = computed(() => recipesResponse.value?.data ?? []);
const total = computed(() =>
  isSuccessResponse(recipesResponse.value) ? (recipesResponse.value.meta?.total ?? 0) : 0,
);
const recipeStatuses = {
  approved: { label: "Published", color: "success" },
  pending: { label: "Pending review", color: "warning" },
  rejected: { label: "Changes requested", color: "error" },
} as const;

watch(
  () => (mounted.value && canPublish.value ? user.value?.id : undefined),
  async (account, _, onCleanup) => {
    draft.value = undefined;
    if (!account) return;

    let active = true;
    onCleanup(() => {
      active = false;
    });
    const saved = await readRecipeDraft(account).catch(() => undefined);
    if (active) draft.value = saved;
  },
);
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-display font-normal leading-[1.06] uppercase text-4xl">My recipes</h2>
      <CreateRecipeModal v-if="canPublish" @saved="refreshRecipes" @draft="draft = $event">
        <UButton
          label="Create recipe"
          trailing-icon="i-lucide-plus"
          class="justify-center font-display"
        />
      </CreateRecipeModal>
    </div>
    <section v-if="canPublish && draft" class="mb-6">
      <h3 id="drafts" class="font-display font-normal leading-[1.12] mb-2 text-2xl">Local draft</h3>
      <div
        class="flex items-center justify-between gap-3 rounded-md border border-default bg-elevated light:bg-cream-50 p-4"
      >
        <div>
          <p class="font-semibold">{{ draft.title || "Untitled recipe" }}</p>
          <p class="text-sm text-muted">Saved on this device</p>
        </div>
        <CreateRecipeModal @saved="refreshRecipes" @draft="draft = $event">
          <UButton
            label="Continue"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          />
        </CreateRecipeModal>
      </div>
    </section>
    <USkeleton v-if="recipesStatus === 'idle' || recipesStatus === 'pending'" class="h-40" />
    <UAlert
      v-else-if="recipesStatus === 'error'"
      title="Couldn’t load submitted recipes"
      color="error"
      variant="soft"
      :actions="[{ label: 'Try again', onClick: () => refreshRecipes() }]"
    />
    <ul v-else-if="recipes.length" class="divide-y divide-default rounded-md border border-default">
      <li
        v-for="recipe in recipes"
        :key="recipe.id"
        class="flex flex-wrap items-center gap-3 p-3 sm:p-4"
      >
        <img
          v-if="recipe.image"
          :src="recipe.image"
          alt=""
          class="size-14 rounded-sm object-cover"
          loading="lazy"
        />
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="`/recipes/${recipe.id}`"
            class="wrap-break-word font-semibold hover:underline"
            >{{ recipe.title }}</NuxtLink
          >
          <p class="text-sm text-muted">{{ formatDate(recipe.updatedAt) }}</p>
        </div>
        <UBadge
          v-if="recipe.status"
          :label="recipeStatuses[recipe.status].label"
          :color="recipeStatuses[recipe.status].color"
          variant="soft"
        />
      </li>
    </ul>
    <UEmpty v-else icon="i-lucide-book-open" title="No submitted recipes yet" />
    <UPagination
      v-if="total > limit"
      v-model:page="page"
      :items-per-page="limit"
      :total="total"
      class="mt-5 justify-center"
    />
  </section>
</template>
