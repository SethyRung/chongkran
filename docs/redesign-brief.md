# Chongkran redesign

Status: ready for shared-understanding confirmation before implementation.

## Confirmed direction

- Keep Chongkran's food identity: clean, warm, and food-focused.
- Use generous spacing, crisp typography, restrained colors, and warm food photography.
- Prioritize visual hierarchy and consistency.
- Use subtle motion to support the interface.
- Redesign every screen, including accounts, meal plans, shopping lists, and admin,
  using one consistent design system.
- Prioritize helping visitors find something to cook. Meal planning and sharing
  remain secondary.
- Use a SaaS landing-page homepage: benefit-led hero, product preview, key
  features, how it works, and final call to action. The primary CTA is
  "Explore recipes", leading to the Recipes discovery page with search, filters,
  and recipe cards.
- Show Chongkran's actual interface in the product preview, highlighting recipe
  discovery, meal planning, and shopping lists.
- Retain only the Chongkran name from the existing branding. Replace the visual
  identity; the existing green accent and pixel typography are not retained.
- Use warm ivory backgrounds, charcoal text, and restrained terracotta accents.
- Design for everyday home cooks exploring recipes across cuisines, with an
  approachable, practical browsing experience.
- Use clean sans-serif typography throughout, strong headings, and a simple
  Chongkran wordmark.
- Support light and dark modes: warm ivory surfaces in light mode, warm charcoal
  surfaces in dark mode, and terracotta accents in both.
- Follow Nuxt UI's color system and utility classes. Configure the palette
  centrally and use semantic colors in components, including text-default,
  bg-elevated, and border-muted.
- Provide quick hover feedback, gentle page transitions, stable loading states,
  and reduced-motion support. GSAP may be used for motion.
- Use a top navbar on public pages and sidebars for personal tools and admin.
  Collapse the sidebars into drawers on mobile.
- Fix incomplete UI interactions as part of the redesign, including search
  controls and recipe-creation links.

## Delegated design decisions

The user delegated remaining page-level choices and confirmed starting with the
design system and homepage, then applying the design across the site.

### Visual system

- Use a centered, spacious layout with a maximum content width of 80rem and
  narrower reading widths for recipe instructions and forms.
- Use Inter for the wordmark and interface, with clear heading, body, and metadata
  scales. Use consistent spacing, modest corner rounding, subtle borders, and
  restrained shadows.
- Define terracotta primary and warm neutral palettes centrally through Nuxt UI's
  theme system. Consume semantic tokens and utility classes in components.
- Generate the Tailwind color ramps with
  [tailwind_tools](https://github.com/SethyRung/tailwind_tools), using the commands
  recorded in DESIGN.md.
- Give controls clear hover, focus, active, disabled, and loading states in both
  appearance modes. Make actions accessible by keyboard and touch.

### Homepage

1. Compact public navbar with the wordmark, links to Recipes and Categories, and
   account actions. Signed-in visitors can access their personal tools.
2. Centered, benefit-led hero: "Find your next favorite meal." Supporting copy
   explains discovery, planning, and shopping. Use "Explore recipes" as the
   primary action and "Create account" as the secondary action for guests.
3. Large, responsive product preview below the hero, built from the actual
   redesigned Chongkran interface and representative recipe content.
4. Three feature sections showing recipe discovery, meal planning, and shopping
   lists, with discovery receiving the strongest emphasis.
5. A short how-it-works sequence: find a recipe, plan meals, prepare a shopping
   list.
6. Final "Explore recipes" CTA and a compact footer.

Use genuine product content and verified facts in previews and marketing copy.
The mobile layout preserves the hero action and a legible product preview.

### Other screens

- Recipes: searchable, filterable discovery with photographic cards and clear
  result counts, pagination, and loading, empty, and error states.
- Recipe detail: prominent title and photo, clear metadata and actions, readable
  ingredients and instructions, and an author section. Stack the cooking content
  naturally on mobile.
- Categories: consistent browsing and category detail screens using the same
  recipe cards and visual hierarchy as Recipes.
- Personal tools: a shared sidebar shell for profile, own recipes, settings,
  meal plans, and shopping lists. Prioritize the main action and useful content
  on each screen.
- Authoring: consistent recipe and meal-plan forms with clear validation and
  accessible submission feedback.
- Authentication: focused forms, consistent wordmark and palette, and clear
  recovery and verification paths.
- Admin: the shared visual system with denser tables, clear filters and status
  indicators, and usable action controls on small screens.

### Motion

- Use short, restrained feedback and transitions; give the homepage preview and
  feature sections gentle entrances where they help communicate hierarchy.
- Use GSAP for coordinated motion and native transitions for simple control
  feedback. Respect reduced-motion preferences throughout.
- Keep content available during loading and transitions, reserve image and
  preview space, and preserve native scrolling.
- Scope animation to its component and clean it up when navigating away.

## Implementation order

1. Align DESIGN.md with this recipe-app brief, replacing its unrelated game-store
   content. Establish theme tokens, typography, shared controls, and both modes.
2. Implement the homepage and public navigation, then recipe discovery, recipe
   detail, and categories.
3. Implement personal tools, authoring, and authentication screens.
4. Apply the system to every admin screen and fix incomplete UI interactions.
5. Verify the complete experience across desktop and mobile.

## Acceptance criteria

- Every existing screen uses the agreed visual system and appropriate navigation
  shell, in light and dark modes.
- The homepage follows the approved SaaS structure and shows the actual product;
  "Explore recipes" reaches working recipe discovery.
- Search, filters, pagination, recipe creation, account flows, meal planning,
  shopping-list interactions, and admin actions work with existing app behavior.
- Loading, empty, error, validation, and success states are consistent and clear.
- Layouts work on narrow mobile screens and desktop. Controls support keyboard
  use, visible focus, and touch access.
- Motion respects reduced-motion preferences and preserves stable layouts.
- Nuxt UI semantic colors and utilities are used consistently, with centrally
  configured palettes.
- Run formatting and lint checks, typecheck, unit tests, and a production build;
  perform browser checks of the changed flows in both modes and mobile layouts.
  Run focused integration checks when functional changes warrant them.
