<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import { redirectToDiscordLogin, redirectToDiscordRegister } from "@/utils/discordRedirects";

const { t } = useI18n();
const route = useRoute();

const isRegistrationEnabled = !!(import.meta.env.VITE_FEATURE_REGISTRATION_ENABLED && import.meta.env.VITE_FEATURE_REGISTRATION_ENABLED === "true");
</script>

<template>
    <div>
        <h1 class="mt-8 font-Mohave text-3xl font-bold">{{ t("login_welcomeBack") }}</h1>
        <p class="mt-2 font-medium text-gray-500">{{ t("login_welcomeBackHelperText") }}</p>
        <GlobalButton class="mt-8 w-full" size="full" @click="redirectToDiscordLogin((route.query.redirect as string) ?? '')"
            >{{ t("login_logInButton") }}
        </GlobalButton>
        <GlobalButton v-if="isRegistrationEnabled" class="mt-4 w-full" type="secondary" size="full" @click="redirectToDiscordRegister()"
            >{{ t("login_registerButton") }}
        </GlobalButton>
    </div>
</template>

<style scoped></style>
