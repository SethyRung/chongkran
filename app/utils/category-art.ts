export const featuredCategories = [
  {
    label: "Weeknight",
    pattern: /weeknight|quick/i,
    query: { maxTime: "30" },
    image: "/images/food/weeknight.webp",
    tone: "bg-chili-700 text-cream-200",
  },
  {
    label: "Soups",
    pattern: /soups?/i,
    query: { search: "soup" },
    image: "/images/food/soups.webp",
    tone: "bg-plum-800 text-cream-200",
  },
  {
    label: "Grilling",
    pattern: /grill|barbecue/i,
    query: { search: "grill" },
    image: "/images/food/grilling.webp",
    tone: "bg-leaf-800 text-cream-200",
  },
  {
    label: "Desserts",
    pattern: /desserts?|sweets/i,
    query: { search: "dessert" },
    image: "/images/food/desserts.webp",
    tone: "bg-turmeric-400 text-ink-950",
  },
];

const categoriesWithArt = [
  ...featuredCategories,
  {
    pattern: /^breakfast$/i,
    image: "/images/food/breakfast.webp",
    tone: "bg-ochre-800 text-cream-200",
  },
  {
    pattern: /^salads?$/i,
    image: "/images/food/salads.webp",
    tone: "bg-leaf-800 text-cream-200",
  },
  {
    pattern: /^indian$/i,
    image: "/images/food/indian.webp",
    tone: "bg-rust-800 text-cream-200",
  },
  {
    pattern: /^american$/i,
    image: "/images/food/american.webp",
    tone: "bg-maroon-800 text-cream-200",
  },
  {
    pattern: /^asian$/i,
    image: "/images/food/asian.webp",
    tone: "bg-pine-800 text-cream-200",
  },
  {
    pattern: /^pasta$/i,
    image: "/images/food/pasta.webp",
    tone: "bg-mulberry-800 text-cream-200",
  },
];

export function categoryArt(name: string) {
  return categoriesWithArt.find(({ pattern }) => pattern.test(name.trim()));
}
