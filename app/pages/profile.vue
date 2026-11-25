<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { gsap } from "gsap";

const { user } = useUserSession();
const animateEntrance = !useNuxtApp().isHydrating;
const hero = useTemplateRef<HTMLElement>("hero");
const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

let entrance: gsap.Context | undefined;

const displayName = computed(() =>
  `${user.value?.firstName ?? ""} ${user.value?.lastName ?? ""}`.trim(),
);

const items: NavigationMenuItem[] = [
  {
    label: "Overview",
    icon: "i-lucide-user",
    to: "/profile",
    exact: true,
  },
  {
    label: "My recipes",
    icon: "i-lucide-book-open",
    to: "/profile/recipes",
  },
];

onMounted(() => {
  if (!animateEntrance || !hero.value || reducedMotion.value) return;

  entrance = gsap.context(() => {
    gsap
      .timeline({
        defaults: { duration: 0.48, ease: "power3.out", clearProps: "transform,opacity" },
      })
      .from("[data-profile-title]", { yPercent: 100 })
      .from("[data-profile-detail]", { y: 18, opacity: 0, stagger: 0.06 }, 0.12);
  }, hero.value);
});

watch(reducedMotion, (reduce) => {
  if (reduce) entrance?.revert();
});

onUnmounted(() => entrance?.revert());
</script>

<template>
  <div>
    <section ref="hero" class="relative isolate overflow-hidden bg-ink-950 text-cream-200">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-chili-700 [clip-path:polygon(100%_38%,100%_100%,62%_100%)] md:[clip-path:polygon(82%_0,100%_0,100%_100%,66%_100%)]"
      />
      <UContainer
        class="grid items-center gap-4 py-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-6 sm:py-10 md:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8 lg:py-12"
      >
        <div data-profile-detail class="justify-self-start">
          <UAvatar
            :src="user?.image ?? undefined"
            :alt="displayName"
            size="3xl"
            icon="i-lucide-user"
            class="size-16 bg-cream-200 ring-2 ring-cream-200/25 sm:size-24"
            :ui="{ icon: 'size-7 text-ink-950/80 sm:size-9' }"
          />
        </div>

        <div class="min-w-0">
          <h1
            class="overflow-hidden font-display text-5xl leading-[1.06] font-normal wrap-anywhere uppercase sm:text-6xl lg:text-7xl"
          >
            <span data-profile-title class="block">{{ displayName }}</span>
          </h1>
          <div data-profile-detail class="mt-2 max-w-lg text-sm wrap-anywhere">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p>{{ user?.email }}</p>
              <p v-if="user?.role" class="font-semibold text-turmeric-400 capitalize">
                {{ user.role }}
              </p>
            </div>
            <p v-if="user?.bio" class="mt-2 text-cream-200/85">{{ user.bio }}</p>
          </div>
        </div>

        <ProfileSettingsModal>
          <UButton
            label="Edit profile"
            trailing-icon="i-lucide-pencil"
            size="lg"
            class="cursor-pointer justify-center font-display text-lg font-normal light:text-highlighted"
          />
        </ProfileSettingsModal>
      </UContainer>
    </section>

    <div class="border-b border-default bg-elevated light:bg-cream-50">
      <UContainer>
        <UNavigationMenu
          :items="items"
          variant="link"
          color="neutral"
          highlight
          highlight-color="primary"
          :ui="{
            item: 'py-1.5',
            link: 'font-semibold after:-bottom-1.5 after:h-0.5',
            linkLeadingIcon: 'hidden sm:block',
          }"
        />
      </UContainer>
    </div>

    <UContainer class="py-5 sm:py-6">
      <NuxtPage />
    </UContainer>
  </div>
</template>
