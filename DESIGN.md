# Chongkran Design System

Design specification for the full-site redesign. Implementation awaits confirmation
of the [redesign brief](docs/redesign-brief.md).

## Product and direction

Chongkran helps everyday home cooks discover recipes across cuisines, plan meals,
and organize shopping. Recipe discovery is the primary journey.

The experience should feel like a polished SaaS product: clear hierarchy, generous
spacing, consistent controls, readable typography, and restrained motion. Warm
surfaces and genuine food photography establish its food identity.

Retain the Chongkran name. Establish a new wordmark, palette, and typography.

## Foundations

### Nuxt UI theme

Use Nuxt UI components, semantic color roles, and utility classes throughout.
Define the brand palette and appearance tokens centrally in
`app/assets/css/main.css`; configure semantic palette assignments and shared
component defaults in `app/app.config.ts`.

Generate complete custom color ramps from 50 through 950 for terracotta and warm
neutrals using [tailwind_tools](https://github.com/SethyRung/tailwind_tools).
Use its Tailwind v4 output with explicit palette names:

```sh
bunx @sethyrung/tailwind_tools palette '#A9462D' --name terracotta --step 600
bunx @sethyrung/tailwind_tools palette '#2C2522' --name warm-neutral --step 800
```

Place the generated theme declarations in the central stylesheet and map the
palettes to Nuxt UI's primary and neutral roles. Record the generator version
alongside the palette provenance when implementing.

The following anchors describe the intended appearance; use the generated ramps
to choose final shade assignments and validate token combinations for contrast.

| Role             | Light appearance           | Dark appearance            | Usage                                 |
| ---------------- | -------------------------- | -------------------------- | ------------------------------------- |
| Primary          | Deep terracotta, `#A9462D` | Soft terracotta, `#ECA58C` | Main actions, links, selected accents |
| Page surface     | Warm ivory, `#FAF8F5`      | Warm charcoal, `#1B1816`   | Page background                       |
| Elevated surface | Soft white, `#FFFDFC`      | Raised charcoal, `#25211F` | Cards, menus, overlays                |
| Main text        | Charcoal, `#2C2522`        | Warm ivory, `#F5EEE8`      | Headings and body copy                |
| Subtle border    | Warm neutral, `#E5DDD6`    | Deep neutral, `#453C36`    | Dividers and surface boundaries       |

Hex values belong in central theme definitions. Components consume semantic roles
and utilities rather than raw palette classes or inline color values.

| Purpose                    | Semantic expression                                            |
| -------------------------- | -------------------------------------------------------------- |
| Main action                | `color="primary"`, `variant="solid"`                           |
| Secondary action           | `color="neutral"`, `variant="outline"`                         |
| Quiet action or navigation | `color="neutral"`, `variant="ghost"`                           |
| Destructive action         | `color="error"`                                                |
| Status feedback            | `success`, `info`, `warning`, or `error`, according to meaning |
| Headings                   | `text-highlighted`                                             |
| Body copy                  | `text-default`                                                 |
| Supporting copy            | `text-muted` or `text-toned`                                   |
| Low-emphasis detail        | `text-dimmed`                                                  |
| Page background            | `bg-default`                                                   |
| Raised surface             | `bg-elevated`                                                  |
| Subtle grouping            | `bg-muted`                                                     |
| Surface boundary           | `border-default` or `border-muted`                             |

Preserve distinct feedback colors. Use primary color sparingly so main actions
remain easy to find. Theme overrides must work consistently in both modes.

### Typography and wordmark

- Use Inter with a system sans-serif fallback throughout.
- Render Chongkran as a simple text wordmark with deliberate weight and spacing.
- Use a responsive hero heading around 40–72px, with tight but readable leading.
- Use page headings around 30–40px and section headings around 24–32px.
- Use 16px body copy with approximately 1.6 line height; compact application
  layouts may use 14px text where readability remains strong.
- Use 12–14px metadata with sufficient contrast. Keep form fields at a readable
  size on mobile.
- Limit long-form reading width to approximately 65 characters per line.

### Space, shape, and elevation

- Base spacing on a consistent 4px scale, primarily using Tailwind utilities.
- Set the main container maximum to 80rem. Use roughly 20px mobile gutters and
  32px desktop gutters.
- Give landing sections approximately 64px vertical spacing on mobile and
  96–128px on desktop. Application screens use tighter spacing.
- Use 8px control rounding, 12–16px cards, and 16–24px larger preview frames.
- Reserve pill shapes for tags, badges, and compact category controls.
- Use subtle borders for structure and small shadows for elevation. Overlays
  should be visually distinct from the page.
- Prefer shared Nuxt UI defaults over repeated per-instance overrides.

### Photography and icons

- Use appetizing, natural food photography with consistent crops.
- Use 4:3 imagery for recipe cards and a wider image on recipe detail pages.
- Reserve image dimensions to keep layouts stable while media loads.
- Use Lucide icons consistently, with accessible labels for icon-only actions.
- Build product previews from Chongkran's actual redesigned interface and
  representative product content. Keep text legible at the displayed size.

## Navigation and layout

### Public pages

Use a compact top navbar with the wordmark, Recipes, Categories, appearance
control, and account actions. Give guests clear sign-in and create-account paths;
give signed-in visitors access to personal tools through account navigation.

On mobile, collapse navigation into an accessible menu while preserving the
primary page action. Use a compact footer with product and account links.

### Personal tools and admin

Use a shared sidebar pattern for profile, own recipes, settings, meal plans, and
shopping lists. Admin uses its own role-appropriate sidebar entries with the same
visual language. Collapse sidebars into drawers on mobile.

Each screen has a clear title, useful supporting context, and one dominant action.
Use denser layouts for admin tables while retaining comfortable controls.

## Homepage: SaaS landing page

The homepage presents the product and leads visitors to recipe discovery.

1. **Benefit-led hero.** Center the headline "Find your next favorite meal."
   Explain the value of discovery, planning, and shopping in concise supporting
   copy. Use **Explore recipes** as the primary CTA, linking to `/recipes`, and
   **Create account** as the secondary action for guests.
2. **Product preview.** Place a large responsive preview below the hero, showing
   the actual Chongkran interface. Lead with recipe discovery and include meal
   planning and shopping-list context.
3. **Key features.** Explain discovering recipes, planning meals, and organizing
   shopping through concise benefits and relevant product visuals. Give discovery
   the strongest emphasis.
4. **How it works.** Show a short progression: find a recipe, plan meals, prepare
   a shopping list.
5. **Final CTA.** Repeat Explore recipes with a concise benefit statement.
6. **Footer.** Finish with a compact, consistent set of navigation links.

Use genuine product content and verified facts in marketing copy. Keep decorative
elements restrained. On mobile, preserve clear CTAs and legible previews.

## Application screens

| Surface                 | Design requirements                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recipes                 | Main discovery hub with prominent search, filters, result count, photographic cards, and pagination. Stack controls naturally on mobile.                                             |
| Recipe card             | Consistent image crop, readable title, useful cooking metadata, author context, and clear actions. Keep card heights visually coherent.                                              |
| Recipe detail           | Prominent title and photo, readable metadata, clear save and sharing actions, ingredient checklist, numbered instructions, and author context. Prioritize cooking content on mobile. |
| Categories              | Consistent category browsing and detail pages that reuse recipe cards and discovery patterns. Label groupings accurately.                                                            |
| Profile and own recipes | Clear identity and account context, useful content summaries, and prominent recipe creation where appropriate.                                                                       |
| Meal plans              | Easy-to-scan plan cards and meal organization, with visible create, edit, and delete actions accessible by touch and keyboard.                                                       |
| Shopping lists          | Readable checklist items, clear completion state, and straightforward list actions.                                                                                                  |
| Authoring               | Consistent recipe and meal-plan forms, grouped fields, image upload feedback, clear validation, and explicit submission state.                                                       |
| Authentication          | Focused forms with the same wordmark, typography, colors, and control states. Clear verification and recovery paths.                                                                 |
| Settings                | Logically grouped fields and clear save feedback.                                                                                                                                    |
| Admin                   | Consistent dashboard cards, readable tables, filters, status indicators, pagination, and accessible row actions. Small screens retain access to every action.                        |

## Interaction and content states

- Fix incomplete UI interactions, including search controls and recipe-creation
  links, as part of the redesign.
- Reuse the existing product flows and data contracts when connecting controls.
- Define default, hover, focus, active, disabled, and loading states for controls.
- Match loading placeholders to the final content geometry.
- Give empty states a concise explanation and a relevant next action.
- Give errors readable context and recovery actions. Keep form values available
  after validation failures.
- Provide clear success feedback for completed actions.
- Confirm destructive actions in context and distinguish them semantically.

## Motion

Use GSAP for coordinated motion and native transitions for simple control
feedback. Motion supports hierarchy and continuity.

| Interaction                            | Target behavior                                                     |
| -------------------------------------- | ------------------------------------------------------------------- |
| Hover and focus feedback               | Approximately 120–180ms, subtle color or elevation change           |
| Small entrances and state changes      | Approximately 180–300ms, short travel and gentle easing             |
| Homepage preview and feature entrances | Approximately 300–500ms, restrained opacity and transform animation |
| Page transitions                       | Short, interruptible transitions that keep navigation responsive    |

Honor reduced-motion preferences by removing movement and simplifying state
changes. Keep content available and reserve layout space before animation begins.
Preserve native scrolling.

Run GSAP after the component mounts, scope selectors to the component, and revert
animations on unmount. Prefer transform and opacity animation. Keep loading,
focus, and navigation behavior usable throughout transitions.

## Responsive behavior and accessibility

- Support narrow mobile screens, tablets, and desktop without page-level
  horizontal overflow. Allow intentional table scrolling where needed.
- Stack grids and form columns according to content width.
- Preserve visible keyboard focus and logical tab order.
- Use labeled controls, meaningful headings, useful image alternatives, and
  accessible names for icon buttons.
- Keep text and interactive states at accessible contrast in both modes.
- Use comfortable touch targets and expose actions without requiring hover.
- Preserve accessible dialog behavior, focus management, and reduced motion.

## Verification

Review every existing screen in both modes. Check narrow mobile and desktop
layouts, keyboard navigation, reduced motion, loading, empty, error, and success
states. Exercise discovery, recipe creation, account flows, meal plans, shopping
lists, and admin actions.

Run formatting and lint checks, typecheck, unit tests, and a production build.
Use focused integration checks for functional changes. Keep the implementation
aligned with this document and the redesign brief.
