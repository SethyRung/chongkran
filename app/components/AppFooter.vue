<template>
  <footer class="border-t border-neutral-800 bg-ink-950 text-cream-200">
    <UContainer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5">
      <NuxtLink to="/">
        <BrandMark />
      </NuxtLink>
      <nav class="flex gap-6 text-sm font-semibold">
        <NuxtLink to="/recipes" class="hover:underline">Recipes</NuxtLink>
        <NuxtLink to="/categories" class="hover:underline">Categories</NuxtLink>
      </nav>
    </UContainer>
  </footer>
</template>
