export function useRecipeFavorite(recipeId: MaybeRefOrGetter<string>) {
  const { user } = useUserSession();
  const route = useRoute();
  const toast = useToast();
  const saved = useState<Record<string, boolean>>("saved-recipes", () => ({}));
  const loading = ref(false);
  const key = computed(() => `${user.value?.id ?? ""}:${toValue(recipeId)}`);
  const isSaved = computed(() => saved.value[key.value] ?? false);

  onMounted(() => {
    watch(
      key,
      async (accountRecipe) => {
        const id = toValue(recipeId);
        if (!user.value || !id || accountRecipe in saved.value) return;
        try {
          const result = await $fetch(`/api/favorites/${id}/check`);
          if (!(accountRecipe in saved.value) && isSuccessResponse(result)) {
            saved.value[accountRecipe] = result.data.isFavorite;
          }
        } catch {
          // A failed initial check leaves the saved state unknown until the next action.
        }
      },
      { immediate: true },
    );
  });

  async function toggle() {
    if (!user.value) {
      await navigateTo({ path: "/auth/login", query: { redirect: route.fullPath } });
      return;
    }

    if (loading.value) return;
    const accountRecipe = key.value;
    const id = toValue(recipeId);
    loading.value = true;
    try {
      if (!(accountRecipe in saved.value)) {
        const result = await $fetch(`/api/favorites/${id}/check`);
        if (!isSuccessResponse(result)) throw new Error(result.status.message);
        saved.value[accountRecipe] = result.data.isFavorite;
      }
      const next = !saved.value[accountRecipe];
      const result = await $fetch<ApiResponse<string>>(`/api/favorites/${id}`, {
        method: next ? "POST" : "DELETE",
      });
      if (!isSuccessResponse(result)) throw new Error(result.status.message);
      saved.value[accountRecipe] = next;
      toast.add({
        title: next ? "Recipe saved" : "Recipe removed from saved recipes",
        color: "success",
      });
    } catch {
      toast.add({ title: "Couldn’t update saved recipes", color: "error" });
    } finally {
      loading.value = false;
    }
  }

  return { isSaved, loading, toggle };
}
