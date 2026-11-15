import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (import.meta.client) gsap.registerPlugin([ScrollSmoother, ScrollTrigger]);

export function useGSAP() {
  return { gsap, ScrollSmoother, ScrollTrigger };
}
