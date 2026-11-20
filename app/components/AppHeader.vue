<script setup lang="ts">
import { gsap } from "gsap";

const route = useRoute();
const { user, signOut } = useUserSession();

const menuOpen = ref(false);

const headerAction = "bg-transparent text-cream-200 hover:bg-white/10 active:bg-white/15";
const headerAccountAction =
  "font-display flex min-h-11 cursor-pointer items-center gap-1.5 px-2 text-lg leading-[1.06] font-normal uppercase transition-colors hover:text-turmeric-400 focus-visible:text-turmeric-400 xl:text-xl";

const desktopNav = useTemplateRef<HTMLElement>("desktop-nav");
const menuTrigger = useTemplateRef<{ $el: HTMLButtonElement }>("menu-trigger");
const mobileMenu = useTemplateRef<HTMLDialogElement>("mobile-menu");

const desktop = useMediaQuery("(min-width: 64rem)");
const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

const signInLink = computed(() => ({
  path: "/auth/login",
  query: { redirect: route.fullPath },
}));

watch([desktop, () => route.fullPath], ([isDesktop]) => {
  if (isDesktop) finishMenuClose();
  else closeMenu();
});

const navigation = [
  { label: "Recipes", to: "/recipes" },
  { label: "Categories", to: "/categories" },
  { label: "Meal plans", to: "/meal-plans" },
  { label: "Shopping list", to: "/shopping-lists" },
];

let navMotion: gsap.MatchMedia | undefined;

onMounted(() => {
  const nav = desktopNav.value;
  if (!nav) return;

  navMotion = gsap.matchMedia();
  navMotion.add(
    "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
    () => {
      const listeners = new AbortController();

      for (const link of nav.querySelectorAll<HTMLAnchorElement>(".header-link")) {
        const roll = gsap
          .timeline({ paused: true })
          .to(link.querySelectorAll(".header-link-track"), {
            yPercent: -50,
            duration: 0.28,
            ease: "power2.inOut",
            stagger: 0.028,
          });

        const updateRoll = () => {
          if (link.matches(":hover, :focus-visible")) roll.play();
          else roll.reverse();
        };

        for (const event of ["mouseenter", "mouseleave", "focus", "blur"]) {
          link.addEventListener(event, updateRoll, { signal: listeners.signal });
        }

        updateRoll();
      }

      return () => listeners.abort();
    },
    nav,
  );
});

onUnmounted(() => navMotion?.revert());

let animateMenuClose: (() => void) | undefined;
let menuClosing = false;

function finishMenuClose() {
  mobileMenu.value?.close();
  menuClosing = false;
  menuOpen.value = false;
}

function closeMenu() {
  if (!menuOpen.value || menuClosing) return;

  if (reducedMotion.value || !animateMenuClose) {
    finishMenuClose();
  } else {
    menuClosing = true;
    animateMenuClose();
  }
}

watch(
  [mobileMenu, reducedMotion],
  ([menu, reduce], [previousMenu], onCleanup) => {
    if (!menu) return;
    if (!menu.open) menu.showModal();

    if (reduce) {
      if (menuClosing) finishMenuClose();
      return;
    }

    const surface = menu.querySelector<HTMLElement>(".mobile-menu-surface");
    const trigger = menuTrigger.value?.$el;
    if (!surface || !trigger) return;

    const expanded = "inset(0px 0px 0px 0px round 0px)";
    const collapsed = () => {
      const panel = surface.getBoundingClientRect();
      const button = trigger.getBoundingClientRect();
      const inset = [
        button.top - panel.top,
        panel.right - button.right,
        panel.bottom - button.bottom,
        button.left - panel.left,
      ].map((offset) => `${Math.max(0, offset)}px`);
      return `inset(${inset.join(" ")} round 6px)`;
    };

    let opening: gsap.core.Timeline | undefined;
    const context = gsap.context(() => {
      if (menu !== previousMenu) {
        opening = gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .from(".mobile-menu-shade", { opacity: 0, duration: 0.36 }, 0)
          .fromTo(
            surface,
            { clipPath: collapsed(), opacity: 0.35 },
            { clipPath: expanded, opacity: 1, duration: 0.42, ease: "power2.inOut" },
            0,
          )
          .from(".mobile-menu-heading", { opacity: 0, duration: 0.18 }, 0.18)
          .from(".mobile-nav-item", { opacity: 0, y: 12, duration: 0.2, stagger: 0.04 }, 0.33)
          .from(".mobile-menu-footer", { opacity: 0, y: 8, duration: 0.18 }, 0.49);
      }
    }, menu);

    animateMenuClose = () => {
      opening?.pause();
      context.add(() => {
        gsap
          .timeline({ onComplete: finishMenuClose })
          .to(
            surface,
            { clipPath: collapsed(), opacity: 0, duration: 0.36, ease: "power2.inOut" },
            0,
          )
          .to(".mobile-menu-shade", { opacity: 0, duration: 0.36, ease: "power2.out" }, 0);
      });
    };

    onCleanup(() => {
      animateMenuClose = undefined;
      context.revert();
    });
  },
  { flush: "post" },
);

const accountLinks = computed(() => [
  { label: "Profile", icon: "i-lucide-user", to: "/profile" },
  ...(user.value?.role === "author" || user.value?.role === "admin"
    ? [{ label: "My recipes", icon: "i-lucide-book-open", to: "/profile/recipes" }]
    : []),
  ...(user.value?.role === "admin"
    ? [{ label: "Admin dashboard", icon: "i-lucide-layout-dashboard", to: "/admin" }]
    : []),
]);

const signOutItem = { label: "Sign out", icon: "i-lucide-log-out", onSelect: logout };

async function logout() {
  closeMenu();
  await signOut();
  await navigateTo("/auth/login");
}
</script>

<template>
  <header class="h-(--ui-header-height) border-b border-cream-200/10 bg-ink-950 text-cream-200">
    <UContainer class="flex h-full items-center justify-between gap-1.5">
      <NuxtLink to="/" class="flex shrink-0 items-center">
        <BrandMark class="max-[360px]:[&>.font-display]:text-xl" />
      </NuxtLink>

      <div class="hidden items-center gap-5 lg:flex xl:gap-7">
        <nav ref="desktop-nav" class="flex items-center gap-5 xl:gap-7">
          <NuxtLink
            v-for="link in navigation"
            :key="link.to"
            :to="link.to"
            class="header-link font-display font-normal leading-[1.06] uppercase flex min-h-11 items-center text-lg motion-reduce:hover:text-primary-300 motion-reduce:focus-visible:text-primary-300 xl:text-xl"
            active-class="text-turmeric-400"
          >
            <span class="flex h-[1.2em] items-start overflow-hidden leading-[1.2]">
              <span
                v-for="(letter, index) in link.label.replaceAll(' ', '\u00a0')"
                :key="index"
                class="header-link-track grid"
              >
                <span>{{ letter }}</span>
                <span
                  class="[-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_currentColor]"
                >
                  {{ letter }}
                </span>
              </span>
            </span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-1.5 border-l border-cream-200/20 pl-4">
          <UColorModeButton :class="headerAction" />

          <UDropdownMenu
            v-if="user"
            :items="[accountLinks, [signOutItem]]"
            :content="{ align: 'end' }"
            :ui="{
              content: 'min-w-48 bg-ink-950 ring-cream-200/20',
              viewport: 'divide-cream-200/15',
              item: 'min-h-10 cursor-pointer items-center gap-2.5 px-3 text-cream-200 before:bg-transparent data-highlighted:text-turmeric-400 data-highlighted:before:bg-cream-200/10',
              itemLabel: 'font-display text-base font-normal uppercase tracking-wide',
              itemLeadingIcon:
                'size-4 text-turmeric-400/75 group-data-highlighted:text-turmeric-400',
            }"
          >
            <button type="button" :class="headerAccountAction">
              Account
              <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-turmeric-400" />
            </button>
            <template #item-label="{ item, active }">
              <span :class="{ 'text-turmeric-400': active }">{{ item.label }}</span>
            </template>
          </UDropdownMenu>
          <NuxtLink v-else :to="signInLink" :class="headerAccountAction">
            Sign in
            <UIcon name="i-lucide-arrow-up-right" class="size-4 shrink-0 text-turmeric-400" />
          </NuxtLink>
        </div>
      </div>

      <div class="flex items-center gap-1.5 lg:hidden">
        <UButton
          to="/recipes"
          label="Recipes"
          color="primary"
          class="font-display font-normal leading-[1.06] uppercase min-h-11 px-2.5 sm:px-4"
        />
        <UButton
          to="/shopping-lists"
          icon="i-lucide-shopping-basket"
          color="neutral"
          variant="outline"
          class="size-11 justify-center ring-white/30"
          :class="headerAction"
          square
        />

        <UButton
          ref="menu-trigger"
          icon="i-lucide-equal"
          color="neutral"
          variant="outline"
          class="size-11 justify-center ring-white/30"
          :class="headerAction"
          square
          @click="menuOpen = true"
        />
      </div>
    </UContainer>

    <dialog
      v-if="menuOpen"
      ref="mobile-menu"
      class="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent open:flex backdrop:bg-transparent"
      @cancel.prevent="closeMenu"
    >
      <div class="mobile-menu-shade pointer-events-none absolute inset-0 bg-black/40" />
      <div
        class="mobile-menu-surface relative flex min-h-0 w-full flex-col bg-default text-default"
      >
        <div
          class="mobile-menu-heading flex h-(--ui-header-height) shrink-0 items-center justify-between gap-3 px-4 sm:px-6"
        >
          <NuxtLink to="/" @click="closeMenu">
            <BrandMark />
          </NuxtLink>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="outline"
            class="size-11 justify-center"
            square
            autofocus
            @click="closeMenu"
          />
        </div>

        <div
          class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6"
        >
          <nav class="mb-4">
            <ul class="border-y border-muted">
              <li
                v-for="link in navigation"
                :key="link.to"
                class="mobile-nav-item border-b border-muted last:border-b-0"
              >
                <NuxtLink
                  :to="link.to"
                  class="font-display font-normal leading-[1.06] uppercase flex items-center justify-between gap-3 py-3.5 text-[clamp(2rem,9vw,4rem)]"
                  active-class="text-highlighted underline decoration-primary decoration-2 underline-offset-4"
                  @click="closeMenu"
                >
                  {{ link.label }}
                  <UIcon name="i-lucide-arrow-up-right" class="size-5 shrink-0 text-muted" />
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div
            class="mobile-menu-footer mt-auto flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <nav v-if="user" class="flex flex-wrap gap-2">
              <UButton
                v-for="link in accountLinks"
                :key="link.to"
                v-bind="link"
                color="neutral"
                variant="outline"
                class="min-h-11"
                @click="closeMenu"
              />

              <UButton
                :label="signOutItem.label"
                :icon="signOutItem.icon"
                color="neutral"
                variant="ghost"
                class="min-h-11"
                @click="logout"
              />
            </nav>
            <UButton
              v-else
              :to="signInLink"
              label="Sign in"
              color="neutral"
              variant="outline"
              class="min-h-11 px-4 font-semibold"
              @click="closeMenu"
            />
            <UColorModeButton class="size-11 justify-center" />
          </div>
        </div>
      </div>
    </dialog>
  </header>
</template>
