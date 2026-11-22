<script setup lang="ts">
import { gsap } from "gsap";

const showIntro = ref(import.meta.server || useNuxtApp().isHydrating);
const root = useTemplateRef<HTMLElement>("root");
const overlay = useTemplateRef<HTMLElement>("overlay");
const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

const ringColors = ["bg-turmeric-400", "bg-orange-600", "bg-chili-700", "bg-ink-950"];
const ingredientPositions = [
  "top-[16%] left-[7%] bg-top-left sm:top-[10%] sm:left-[12%]",
  "top-[16%] right-[7%] bg-top-right sm:top-[10%] sm:right-[12%]",
  "bottom-[16%] left-[7%] bg-bottom-left sm:bottom-[10%] sm:left-[12%]",
  "right-[7%] bottom-[16%] bg-bottom-right sm:right-[12%] sm:bottom-[10%]",
];

let motion: gsap.Context | undefined;
let interactions: AbortController | undefined;
let introTimeout: number | undefined;

function finishIntro() {
  window.clearTimeout(introTimeout);
  interactions?.abort();
  motion?.revert();
  motion = undefined;
  showIntro.value = false;
}

onMounted(() => {
  const stage = overlay.value;
  if (!stage || !root.value) return;

  const { display, visibility } = getComputedStyle(stage);
  if (reducedMotion.value || display === "none" || visibility === "hidden") {
    finishIntro();
    return;
  }

  interactions = new AbortController();
  for (const event of ["focusin", "keydown", "touchmove", "wheel"]) {
    window.addEventListener(event, finishIntro, { passive: true, signal: interactions.signal });
  }
  introTimeout = window.setTimeout(finishIntro, 4200);

  motion = gsap.context(() => {
    gsap.set(stage, { animation: "none" });
    gsap.set(stage.querySelectorAll("[data-intro-dot]"), { visibility: "hidden" });

    gsap
      .timeline({ defaults: { ease: "power3.out" }, onComplete: finishIntro })
      .fromTo(
        stage.querySelectorAll("[data-intro-ring]"),
        { scale: 0, opacity: 1 },
        { scale: 1, duration: 0.85, ease: "power3.in", stagger: 0.13 },
      )
      .fromTo(
        stage.querySelectorAll("[data-intro-brand]"),
        { scale: 0.55, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.52 },
        0.95,
      )
      .fromTo(
        stage.querySelectorAll("[data-intro-ingredient]"),
        {
          xPercent: (index: number) => (index % 2 === 0 ? 55 : -55),
          yPercent: (index: number) => (index < 2 ? 55 : -55),
          rotation: (index: number) => (index % 2 === 0 ? -22 : 22),
          scale: 0.3,
          autoAlpha: 0,
        },
        {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.07,
        },
        1.1,
      )
      .addLabel("reveal", "+=0.28")
      .to(
        stage.querySelectorAll("[data-intro-ingredient]"),
        { y: (index: number) => (index < 2 ? -12 : 12), duration: 0.8, ease: "sine.inOut" },
        "reveal-=0.42",
      )
      .to(stage, { yPercent: -100, duration: 0.58, ease: "power3.inOut" }, "reveal")
      .from(
        "[data-intro-heading]",
        { yPercent: 100, duration: 0.48, stagger: 0.09 },
        "reveal+=0.27",
      )
      .from(
        "[data-intro-detail]",
        { y: 18, opacity: 0, duration: 0.48, stagger: 0.08 },
        "reveal+=0.44",
      );
  }, root.value);
});

watch(reducedMotion, (reduce) => {
  if (reduce) finishIntro();
});

onUnmounted(finishIntro);
</script>

<template>
  <div ref="root">
    <slot />

    <Teleport to="#teleports">
      <div
        v-if="showIntro"
        ref="overlay"
        class="intro-overlay fixed inset-0 z-100 hidden grid-cols-1 grid-rows-1 place-items-center overflow-hidden bg-ink-950 text-cream-200 motion-safe:[@media(scripting:enabled)]:grid"
        @click="finishIntro"
      >
        <span
          data-intro-dot
          class="col-start-1 row-start-1 size-2.5 animate-pulse rounded-full bg-turmeric-400"
        />
        <span
          v-for="color in ringColors"
          :key="color"
          data-intro-ring
          class="col-start-1 row-start-1 size-[150vmax] rounded-full opacity-0"
          :class="color"
        />
        <div data-intro-brand class="relative col-start-1 row-start-1 opacity-0">
          <BrandMark class="scale-[1.6] sm:scale-[2.25] lg:scale-[3.2]" />
        </div>
        <span
          v-for="position in ingredientPositions"
          :key="position"
          data-intro-ingredient
          class="absolute size-[clamp(5.5rem,23vmin,16rem)] bg-[url(/images/food/intro-ingredients.webp)] bg-size-[200%_200%] bg-no-repeat opacity-0"
          :class="position"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.intro-overlay {
  animation: dismiss-unmounted-intro 3.8s step-end forwards;
}

@keyframes dismiss-unmounted-intro {
  to {
    visibility: hidden;
  }
}
</style>
