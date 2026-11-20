# Chongkran Design System

The [redesign boards](docs/mockups/redesign/prompts.md) specify the visual direction across all 24 routes. The [recipe-to-table flow notes](docs/flow-updates.md) describe the cooking, shopping, and publishing journeys.

## Visual foundations

- Use `ink-950` for navigation and editorial surfaces, `cream-200` for light-mode work areas, and `turmeric-400` for brand accents. Use the chili, plum, leaf, and other accent palettes for category art and editorial surfaces.
- Use Anton for display headings and the Chongkran wordmark. Use Geist for body copy, controls, and data. Use uppercase for page titles and sentence case for controls.
- Use `BrandMark` in navigation, authentication, and admin. Keep the public footer focused on Recipes and Categories.
- Keep corners modest and borders visible. Use dark text on turmeric. Keep status colors distinct from accent colors.

## Nuxt UI

Nuxt UI uses the generated turmeric palette for `primary` and Tailwind stone for `neutral`. Use semantic utilities such as `bg-elevated`, `text-muted`, and `border-default` for controls and work areas. Use named brand utilities for editorial art and the fixed header. Scope cream backgrounds on work areas with `light:`.

Generate palette shades with [tailwind_tools](https://github.com/SethyRung/tailwind_tools) and define them in `app/assets/css/palette.css`.

Use color and type to establish hierarchy. Avoid decorative badges and repeated supporting text. Keep loading skeletons close to the final layout. Give empty states a useful next action, validation errors clear instructions, and destructive actions a confirmation.

## Page patterns

| Surface                    | Pattern                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage                   | Split charcoal hero with a photo cutout and recipe search. Follow with four category tiles and three popular recipe cards.                                       |
| Discovery                  | Dark title and search band with warm filters and results below. Use live categories, recipe counts, and pagination.                                              |
| Recipe detail              | Use a dark title and photo band, then ingredients, instructions, and reviews. Cooking mode uses a full-screen step view with persistent progress and navigation. |
| Meal plans and shopping    | Use a turmeric plan index, a weekly schedule, ingredient preview before saving, and clearly grouped shopping checkboxes.                                         |
| Profile and authentication | Use compact navigation and account context. Keep form labels above fields and show explicit save, verification, and recovery states.                             |
| Admin                      | Use a charcoal sidebar, compact tables, charts, visible filters, and labeled row actions.                                                                        |

## Responsive and accessible interaction

Stack editorial columns and forms on narrow screens. Preserve touch and keyboard access to navigation, filters, and row actions. Limit horizontal scrolling to data tables. Use visible focus, label icon-only actions, and reserve space for photos as they load. Keep motion short and honor reduced-motion preferences.
