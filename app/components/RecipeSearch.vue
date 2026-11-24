<script setup lang="ts">
const props = defineProps<{ initial?: string; hero?: boolean }>();
const emit = defineEmits<{ search: [value: string] }>();
const state = reactive({ search: props.initial ?? "" });

watch(
  () => props.initial,
  (value) => (state.search = value ?? ""),
);

function submit() {
  emit("search", state.search.trim());
}
</script>

<template>
  <UForm
    :state="state"
    :loading-auto="false"
    class="flex w-full max-w-xl"
    :class="hero ? 'overflow-hidden rounded-sm' : 'gap-2'"
    role="search"
    method="get"
    @submit="submit"
  >
    <UFormField name="search" class="min-w-0 flex-1">
      <UInput
        v-model="state.search"
        type="search"
        :placeholder="hero ? 'Dish or ingredient' : 'Search recipes or ingredients'"
        icon="i-lucide-search"
        size="xl"
        class="flex w-full"
        :ui="
          hero
            ? {
                base: 'h-12 rounded-none bg-cream-200 text-ink-950 ring-0 placeholder:text-ink-950/65 focus-visible:bg-cream-100 focus-visible:outline-none sm:h-14',
                leadingIcon: 'text-ink-950/60',
              }
            : {
                base: 'h-12 ring-accented sm:h-13 light:bg-cream-200 light:text-stone-950 light:placeholder:text-stone-700 light:ring-cream-400 dark:bg-muted dark:text-highlighted dark:placeholder:text-muted',
                leadingIcon: 'text-toned light:text-stone-950',
              }
        "
      />
    </UFormField>
    <UButton
      type="submit"
      size="xl"
      class="shrink-0 px-3 sm:px-5"
      :class="
        hero &&
        'font-display cursor-pointer gap-1.5 rounded-none bg-turmeric-400 text-lg font-normal uppercase text-ink-950 outline-ink-950 hover:bg-turmeric-300 focus-visible:-outline-offset-4 active:bg-turmeric-300'
      "
    >
      <span :class="{ 'sm:hidden': !hero }">Search</span>
      <span v-if="!hero" class="hidden sm:inline">Find recipes</span>
      <UIcon
        v-if="hero"
        name="i-lucide-arrow-up-right"
        class="hidden size-4 shrink-0 min-[360px]:inline-block"
      />
    </UButton>
  </UForm>
</template>
