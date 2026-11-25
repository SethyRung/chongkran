<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import type { UserResponse } from "#shared/types";

const toast = useToast();
const { user, fetchSession } = useUserSession();
const route = useRoute();
const router = useRouter();
const open = ref(route.query.settings === "open");
const formId = useId();
const loading = ref(false);
const avatarFile = ref<File>();
const avatarObjectUrl = useObjectUrl(avatarFile);

const displayName = computed(() =>
  `${user.value?.firstName ?? ""} ${user.value?.lastName ?? ""}`.trim(),
);

const schema = z.object({
  firstName: z.string().trim().min(1, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(1, "Last name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  bio: z.string().max(300, "Bio must be 300 characters or less").optional(),
});

type Schema = z.output<typeof schema>;

const profileFields = computed(() => ({
  firstName: user.value?.firstName ?? "",
  lastName: user.value?.lastName ?? "",
  email: user.value?.email ?? "",
  bio: user.value?.bio ?? "",
}));
const state = reactive({ ...profileFields.value });
const avatarPreview = computed(() => avatarObjectUrl.value ?? user.value?.image ?? undefined);
const bioCount = computed(() => state.bio.length);

watch(
  () => route.query.settings,
  (settings, previous) => {
    if (settings === "open" || previous === "open") open.value = settings === "open";
  },
);

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(state, profileFields.value);
    avatarFile.value = undefined;
  } else if (route.query.settings === "open") {
    const { settings, ...query } = route.query;
    void router.replace({ query, hash: route.hash });
  }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (loading.value || !user.value) return;
  const { id } = user.value;

  try {
    loading.value = true;
    const { data } = event;

    let avatarUrl: string | undefined;

    if (avatarFile.value) {
      const formData = new FormData();
      formData.append("file", avatarFile.value);

      const uploadRes = await $fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!isSuccessResponse(uploadRes)) {
        toast.add({ title: uploadRes.status.message || "Photo upload failed", color: "error" });
        return;
      }
      avatarUrl = uploadRes.data.url;
    }

    const res = await $fetch<ApiResponse<UserResponse>>(`/api/users/${id}`, {
      method: "PATCH",
      body: {
        ...data,
        avatar: avatarUrl,
      },
    });

    if (res.status.code === ApiResponseCode.Success) {
      await fetchSession({ force: true });

      open.value = false;

      toast.add({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      toast.add({
        title: "Update failed",
        description: res.status.message || "Please try again.",
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    }
  } catch {
    toast.add({
      title: "Update failed",
      description: "Something went wrong. Please try again.",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Edit profile"
    :close="{ disabled: loading }"
    :dismissible="!loading"
    :ui="{
      title: 'font-display text-3xl font-normal uppercase',
      footer: 'justify-end',
    }"
    @after:leave="avatarFile = undefined"
  >
    <slot />

    <template #body>
      <UForm :id="formId" :schema="schema" :state="state" @submit="onSubmit">
        <fieldset :disabled="loading" class="grid gap-5">
          <UFileUpload
            v-model="avatarFile"
            accept="image/*"
            :multiple="false"
            :interactive="false"
            :preview="false"
            :dropzone="false"
          >
            <template #default="{ open: openFilePicker }">
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-default pb-4">
                <UButton
                  color="neutral"
                  variant="link"
                  class="group cursor-pointer flex-col gap-1.5 p-0 font-semibold"
                  @click="openFilePicker()"
                >
                  <span class="relative grid place-items-center">
                    <UAvatar
                      :src="avatarPreview"
                      :alt="displayName"
                      size="3xl"
                      icon="i-lucide-camera"
                      class="size-20 ring ring-default group-hover:ring-primary"
                      :ui="{ icon: 'size-7 text-toned' }"
                    />
                    <span
                      v-if="avatarPreview"
                      class="absolute grid size-10 place-items-center rounded-full bg-ink-950/75 text-cream-200 group-hover:bg-ink-950"
                    >
                      <UIcon name="i-lucide-camera" class="size-5" />
                    </span>
                  </span>
                  <span class="group-hover:underline group-hover:underline-offset-4">
                    Change photo
                  </span>
                </UButton>
                <UButton
                  v-if="avatarFile"
                  label="Undo change"
                  icon="i-lucide-undo-2"
                  color="neutral"
                  variant="outline"
                  class="cursor-pointer"
                  @click="avatarFile = undefined"
                />
              </div>
            </template>
          </UFileUpload>

          <UTheme
            :ui="{
              input: { root: 'w-full', base: 'min-h-11 text-base sm:text-sm' },
              textarea: { root: 'w-full', base: 'text-base sm:text-sm' },
            }"
          >
            <UFormField name="firstName" label="First name" size="lg" required>
              <UInput v-model="state.firstName" autocomplete="given-name" />
            </UFormField>

            <UFormField name="lastName" label="Last name" size="lg" required>
              <UInput v-model="state.lastName" autocomplete="family-name" />
            </UFormField>

            <UFormField name="email" label="Email address" size="lg" required class="col-span-full">
              <UInput v-model="state.email" type="email" autocomplete="email" />
            </UFormField>

            <UFormField
              name="bio"
              label="Bio"
              size="lg"
              :hint="`${bioCount}/300`"
              class="col-span-full"
            >
              <UTextarea v-model="state.bio" :rows="3" />
            </UFormField>
          </UTheme>
        </fieldset>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="ghost" :disabled="loading" @click="close" />
      <UButton
        :form="formId"
        type="submit"
        label="Save changes"
        icon="i-lucide-check"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
