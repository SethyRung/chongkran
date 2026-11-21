<script setup lang="ts">
import type { RouterScrollBehavior } from "vue-router";

import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";

defineProps<{ contentClass?: string }>();

const wrapper = useTemplateRef<HTMLElement>("scroll-wrapper");
const content = useTemplateRef<HTMLElement>("scroll-content");
const router = useRouter();

onMounted(() => {
  const viewport = wrapper.value;
  const page = content.value;
  if (!viewport || !page) return;

  const media = gsap.matchMedia();
  media.add(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => {
      const smoother = ScrollSmoother.create({
        wrapper: viewport,
        content: page,
        smooth: 0.7,
        onFocusIn: (_smoother, event) =>
          event.target instanceof Node && page.contains(event.target),
      });

      const nativeScroll = router.options.scrollBehavior;
      const scrollBehavior: RouterScrollBehavior = async (to, from, savedPosition) => {
        const position = await nativeScroll?.(to, from, savedPosition);
        if (!position || ScrollSmoother.get() !== smoother || router.currentRoute.value !== to) {
          return position;
        }

        smoother.refresh();
        if ("el" in position || position.top === undefined) {
          smoother.scrollTop(window.scrollY);
          return position;
        }

        // The shared photo measures the destination as soon as route scroll restoration finishes.
        smoother.scrollTo(position.top, position.behavior === "smooth");
        return position.left === undefined ? false : { left: position.left };
      };

      router.options.scrollBehavior = scrollBehavior;
      return () => {
        if (router.options.scrollBehavior === scrollBehavior) {
          router.options.scrollBehavior = nativeScroll;
        }
      };
    },
  );

  onBeforeUnmount(() => media.revert());
});
</script>

<template>
  <div ref="scroll-wrapper">
    <div ref="scroll-content" :class="contentClass">
      <slot />
    </div>
  </div>
</template>
