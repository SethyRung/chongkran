# Recipe-to-table flow updates

## Cooking journey

- Recipe pages offer **Add to meal plan**. Guests return to the same recipe and planning dialog after login. Choose a plan or create one inline, then choose day, meal and recipe quantity. Occupied slots are rejected instead of hiding an existing meal.
- Quantities are relative to the recipe as written: **1×** keeps its ingredient quantities; **2×** doubles them. Nonnumeric quantities such as “to taste” remain explicit.
- Meal-plan shopping previews offer **Add missing**, **Sync this plan**, and **Add again**. Missing is repeatable without increasing quantities. Sync replaces unchecked contributions from this plan while keeping purchases, manual items and other plans. Add again deliberately increases quantities. Purchased/manual stock allocated to one plan is not reused to cover another plan.
- After updating, choose **Open shopping list** or **Keep planning**. Generated items link back to recipes and their plan.
- **Start cooking** opens a focused view with ingredient checkboxes, adjustable quantities, large steps and previous/next controls. Starting from a meal plan carries its quantity multiplier into cooking.

## Accounts and publishing

- Local return paths survive login, signup, verification and password-recovery navigation. External return URLs and authentication loops are rejected.
- Verification recovery accepts an email address, surfaces service errors, and uses a resend cooldown. A separate link restarts signup with a different email while retaining the destination.
- Recipe text and selected images autosave to account-scoped IndexedDB drafts on the current device. Save draft & close retains incomplete forms. Successful submission removes the draft; failed submissions preserve it and offer retry with inline errors and upload progress.
- Own recipes distinguish Pending review, Published and Changes requested. Drafts are local, not synchronized across devices.
- Profile updates refresh existing recipe/review attribution, including name, image and bio.
- Public recipe reviews are visible on approved recipes; signed-in users can post/delete their reviews and administrators can moderate them.

## Administration

- Recipe search/status filters and user search/role filters run before database pagination. Recipe queue filters, page and page size survive viewing/moderating a recipe.
- Action buttons identify their row and page-size controls have labels. Admin tables render on the client with server placeholders to avoid loading-state hydration mismatches. Admin pages disable transitions incompatible with dashboard fragment roots.
- Plan/list administration uses dedicated admin-only global endpoints, displays owner names/emails, and supports authorized deletion.
- User deletion retains the existing account-ban policy, removes the account from normal user listings, revokes sessions, and prevents self-deletion by the administrator. It does not erase the author's recipes.

## Storage and compatibility

- Development uploads persist in ignored `.data/uploads` and are served only in development. Production uses a public Vercel Blob store via `BLOB_READ_WRITE_TOKEN`; valid storage credentials remain necessary.
- Uploads validate image signatures and a 2 MB limit. PNG, JPEG, GIF and WebP are supported; SVG is excluded. Failure is actionable and does not discard the recipe.
- Email delivery still requires working Resend configuration; a successful build does not verify delivery.
- Optional quantities, recipe sources and allocation metadata live in existing JSON columns. Existing records remain readable; no SQL schema migration is required.

## Validation

Commands: `bun run test:unit --run`, `bun run test:nuxt --run`, `bun typecheck`, `bun lint`, `bun run build`.

Regression coverage includes public attribution, complete-collection search, occupied/foreign planning slots, quantity scaling, idempotent missing/sync updates, preservation/allocation of purchases, admin owner identity and permissions, public reviews/moderation, upload validation/serving, deleted-account listing and session revocation, and safe authentication return paths.

The HTTP integration tests run in Node with real Nitro fixtures, preserving serial execution and the Bun test stub aliases. They do not start the extra browser-runtime fixture used by component tests.

Validated: **38 unit tests** and **48 HTTP integration tests** passed. Typecheck, lint, production build and `git diff --check` passed. Browser checks covered guest planning/login return, inline plan creation, scaled shopping generation and handoff, cooking on mobile, draft/image recovery after reload, upload/submission/approval, retained moderation filters, owner names, accessible controls and clean admin hydration.
