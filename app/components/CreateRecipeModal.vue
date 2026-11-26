<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const emit = defineEmits<{ saved: []; draft: [draft: RecipeDraft | undefined] }>();
const open = ref(false);
const formId = useId();
const { user } = useUserSession();
const draftReady = ref(false);
const draftError = ref("");
const submitting = ref(false);
const savingDraft = ref(false);

const toast = useToast();

const schema = z.object({
  title: z.string("Title is required").trim().min(1, "Title is required"),
  description: z.string().optional(),
  image: z
    .instanceof(File, {
      message: "Please select an image file.",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: `The image is too large. Please choose an image smaller than 2MB.`,
    }),
  category: z.string("Category is required").trim().min(1, "Category is required"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    error: "Difficulty is required",
  }),
  cookTime: z
    .number("Cook time must be at least 1 minute")
    .min(1, "Cook time must be at least 1 minute"),
  tags: z.array(z.string()).default([]),
});

type Schema = z.output<typeof schema>;

const ingredientSchema = z.object({
  name: z.string("Name is required").trim().min(1, "Name is required"),
  quantity: z.string("Quantity is required").trim().min(1, "Quantity is required"),
});

const stepSchema = z.object({
  text: z.string("Step cannot be empty").trim().min(1, "Step cannot be empty"),
});

const state = reactive<
  Partial<
    Schema & {
      ingredients: Partial<z.output<typeof ingredientSchema>>[];
      steps: Partial<z.output<typeof stepSchema>>[];
    }
  >
>({
  ingredients: [{}],
  steps: [{}],
  tags: [],
});
const imagePreview = useObjectUrl(toRef(state, "image"));

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const { data: categories, execute } = await useFetch("/api/categories", {
  lazy: true,
  immediate: false,
  query: { limit: 100 },
  default: () => [],
  transform: (res) => (res.status.code === ApiResponseCode.Success ? res.data : []),
});

watch(open, async (isOpen) => {
  if (!isOpen) {
    if (draftReady.value && !submitting.value && !savingDraft.value) await persistDraft();
    draftReady.value = false;
    return;
  }

  const account = user.value?.id;
  draftError.value = "";
  resetForm();
  void execute();
  try {
    const draft = account ? await readRecipeDraft(account) : undefined;
    if (open.value && user.value?.id === account && draft) Object.assign(state, draft);
  } catch {
    draftError.value = "Couldn’t read local drafts.";
  } finally {
    draftReady.value = open.value;
  }
});

function snapshot(): RecipeDraft {
  return {
    title: state.title,
    description: state.description,
    category: state.category,
    difficulty: state.difficulty,
    cookTime: state.cookTime,
    image: state.image,
    tags: [...(state.tags ?? [])],
    ingredients: state.ingredients?.map(({ name, quantity }) => ({ name, quantity })),
    steps: state.steps?.map(({ text }) => ({ text })),
  };
}

async function persistDraft() {
  const account = user.value?.id;
  if (!account) return false;
  const draft = snapshot();
  if (
    !draft.title &&
    !draft.description &&
    !draft.image &&
    !draft.category &&
    !draft.difficulty &&
    !draft.cookTime &&
    !draft.tags?.length &&
    !draft.ingredients?.some(({ name, quantity }) => name || quantity) &&
    !draft.steps?.some(({ text }) => text)
  )
    return true;
  try {
    await writeRecipeDraft(account, draft);
    if (user.value?.id === account) emit("draft", draft);
    return true;
  } catch {
    draftError.value = "Couldn’t save this draft on this device.";
    return false;
  }
}

watchDebounced(
  state,
  () => {
    if (open.value && draftReady.value && !submitting.value && !savingDraft.value)
      void persistDraft();
  },
  { deep: true, debounce: 350 },
);

async function saveAndClose() {
  savingDraft.value = true;
  if (await persistDraft()) {
    draftReady.value = false;
    open.value = false;
  }
  savingDraft.value = false;
}

function addIngredient() {
  if (state.ingredients) {
    state.ingredients.push({});
  } else {
    state.ingredients = [];
  }
}

function removeIngredient(index: number) {
  if (state.ingredients && state.ingredients.length > 1) {
    state.ingredients.splice(index, 1);
  }
}

function addStep() {
  if (state.steps) {
    state.steps.push({});
  } else {
    state.steps = [];
  }
}

function removeStep(index: number) {
  if (state.steps && state.steps.length > 1) {
    state.steps.splice(index, 1);
  }
}

const submittingLabel = ref("Submit for review");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    if (submitting.value) return;
    submitting.value = true;
    draftError.value = "";
    submittingLabel.value = "Uploading image…";
    const { data } = event;

    const formData = new FormData();
    formData.append("file", data.image);

    const uploadRes = await $fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (uploadRes.status.code !== ApiResponseCode.Success) {
      toast.add({
        title: "Upload failed",
        description: uploadRes.status.message || "Failed to upload image.",
        color: "error",
        icon: "i-lucide-alert-circle",
      });
      return;
    }

    submittingLabel.value = "Submitting recipe…";
    const res = await $fetch("/api/recipes", {
      method: "POST",
      body: {
        ...data,
        ingredients: state.ingredients,
        steps: (state.steps ?? []).map((s) => s.text),
        image: uploadRes.data?.url,
      },
    });

    if (res.status.code === ApiResponseCode.Success) {
      toast.add({
        title: "Recipe created",
        description: "Your recipe has been submitted for review.",
        color: "success",
        icon: "i-lucide-check-circle",
      });
      const account = user.value?.id;
      if (account) {
        try {
          await writeRecipeDraft(account, undefined);
          emit("draft", undefined);
        } catch {
          toast.add({
            title: "Recipe submitted. The local draft could not be cleared.",
            color: "warning",
          });
        }
      }
      draftReady.value = false;
      open.value = false;
      resetForm();
      emit("saved");
    } else {
      toast.add({
        title: "Failed to create recipe",
        description: res.status.message || "Please try again.",
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    }
  } catch {
    toast.add({
      title: "Failed to create recipe",
      description: "Something went wrong.",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    submitting.value = false;
    submittingLabel.value = "Submit for review";
  }
}

function resetForm() {
  Object.assign(state, {
    title: undefined,
    description: undefined,
    image: undefined,
    category: undefined,
    difficulty: undefined,
    cookTime: undefined,
    ingredients: [{}],
    steps: [{}],
    tags: [],
  });
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create recipe"
    :close="{ disabled: submitting || savingDraft }"
    :dismissible="!submitting && !savingDraft"
    :ui="{
      content: 'sm:max-w-3xl',
      title: 'font-display text-3xl font-normal uppercase',
      footer: 'flex-wrap justify-end gap-2',
    }"
  >
    <slot />

    <template #body>
      <UForm :id="formId" :schema="schema" :state="state" @submit="onSubmit">
        <UTheme
          :ui="{
            input: { root: 'w-full', base: 'min-h-11 text-base sm:text-sm' },
            textarea: { root: 'w-full', base: 'text-base sm:text-sm' },
            selectMenu: { base: 'min-h-11 w-full text-base sm:text-sm' },
            inputTags: { root: 'min-h-11 w-full' },
            inputNumber: { root: 'w-full', base: 'min-h-11 text-base sm:text-sm' },
          }"
        >
          <div class="space-y-6">
            <UAlert v-if="draftError" :title="draftError" color="error" variant="soft" />

            <section class="space-y-4">
              <h3 class="font-display text-2xl leading-[1.12] font-normal">Details</h3>

              <div class="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
                <UFormField
                  name="image"
                  label="Recipe photo"
                  help="PNG, JPEG, GIF or WebP. Max 2 MB."
                  required
                >
                  <UFileUpload
                    v-model="state.image"
                    position="outside"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    :ui="{
                      base: 'overflow-hidden rounded-md bg-elevated p-0 light:bg-cream-100',
                      wrapper: 'relative min-h-40 gap-2 p-3',
                      label: 'relative mt-0',
                    }"
                  >
                    <template #leading>
                      <img
                        v-if="imagePreview"
                        :src="imagePreview"
                        alt=""
                        class="absolute inset-0 size-full object-cover"
                      />
                      <UIcon v-else name="i-lucide-camera" class="size-7 text-toned" />
                    </template>

                    <template #label>
                      <span
                        :class="
                          imagePreview && 'rounded-sm bg-ink-950/80 px-2.5 py-1 text-cream-200'
                        "
                      >
                        {{ imagePreview ? "Change photo" : "Upload photo" }}
                      </span>
                    </template>

                    <template #files="{ removeFile }">
                      <UButton
                        label="Remove photo"
                        icon="i-lucide-x"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        @click="removeFile()"
                      />
                    </template>
                  </UFileUpload>
                </UFormField>

                <div class="grid min-w-0 gap-4 sm:grid-cols-2">
                  <UFormField name="title" label="Recipe title" required class="sm:col-span-2">
                    <UInput v-model="state.title" placeholder="e.g., Chicken curry" />
                  </UFormField>

                  <UFormField name="category" label="Category" required>
                    <USelectMenu
                      v-model="state.category"
                      :items="categories ?? []"
                      placeholder="Select category"
                      label-key="name"
                      value-key="id"
                    />
                  </UFormField>

                  <UFormField name="difficulty" label="Difficulty" required>
                    <USelectMenu
                      v-model="state.difficulty"
                      :items="difficultyOptions"
                      placeholder="Select difficulty"
                      value-key="value"
                    />
                  </UFormField>

                  <UFormField name="cookTime" label="Cook time (minutes)" required>
                    <UInputNumber v-model="state.cookTime" :min="1" orientation="vertical" />
                  </UFormField>

                  <UFormField name="tags" label="Tags">
                    <UInputTags v-model="state.tags" placeholder="Add tags (press Enter)" />
                  </UFormField>

                  <UFormField name="description" label="Description" class="sm:col-span-2">
                    <UTextarea
                      v-model="state.description"
                      placeholder="Describe your recipe"
                      :rows="3"
                      autoresize
                    />
                  </UFormField>
                </div>
              </div>
            </section>

            <section class="space-y-3 border-t border-default pt-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="font-display text-2xl leading-[1.12] font-normal">Ingredients</h3>
                <UButton
                  label="Add ingredient"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  class="min-h-10 cursor-pointer"
                  @click="addIngredient"
                />
              </div>

              <UForm
                v-for="(ingredient, index) in state.ingredients"
                :key="index"
                :name="`ingredients.${index}`"
                :schema="ingredientSchema"
                nested
                class="grid grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_2.5rem] items-start gap-2 rounded-md border border-default p-3 sm:gap-3"
              >
                <UFormField name="name" label="Ingredient" class="min-w-0">
                  <UInput v-model="ingredient.name" placeholder="e.g., Chicken thigh" />
                </UFormField>

                <UFormField name="quantity" label="Amount" class="min-w-0">
                  <UInput v-model="ingredient.quantity" placeholder="e.g., 500 g" />
                </UFormField>

                <UButton
                  v-if="index > 0"
                  title="Remove ingredient"
                  icon="i-lucide-trash"
                  variant="ghost"
                  color="error"
                  class="mt-6 min-h-11 justify-center"
                  @click="removeIngredient(index)"
                />
              </UForm>
            </section>

            <section class="space-y-3 border-t border-default pt-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="font-display text-2xl leading-[1.12] font-normal">Steps</h3>
                <UButton
                  label="Add step"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  class="min-h-10 cursor-pointer"
                  @click="addStep"
                />
              </div>

              <UForm
                v-for="(step, index) in state.steps"
                :key="index"
                :name="`steps.${index}`"
                :schema="stepSchema"
                nested
                class="flex items-start gap-2 rounded-md border border-default p-3 sm:gap-3"
              >
                <span
                  class="grid size-8 shrink-0 place-items-center font-display text-base text-highlighted"
                >
                  {{ index + 1 }}
                </span>

                <UFormField name="text" class="min-w-0 flex-1">
                  <UTextarea
                    v-model="step.text"
                    :placeholder="`Describe step ${index + 1}`"
                    :rows="2"
                    autoresize
                  />
                </UFormField>

                <UButton
                  v-if="index > 0"
                  title="Remove step"
                  icon="i-lucide-trash"
                  variant="ghost"
                  color="error"
                  class="min-h-11"
                  @click="removeStep(index)"
                />
              </UForm>
            </section>
          </div>
        </UTheme>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Save draft &amp; close"
        color="neutral"
        variant="ghost"
        class="font-display"
        :disabled="submitting"
        :loading="savingDraft"
        @click="saveAndClose"
      />

      <UButton
        :form="formId"
        type="submit"
        :label="submittingLabel"
        class="font-display"
        :loading="submitting"
        :disabled="savingDraft || !draftReady"
      />
    </template>
  </UModal>
</template>
