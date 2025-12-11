<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import { redirectToDiscordLogin, redirectToDiscordRegister } from "@/utils/discordRedirects";

const { t } = useI18n();
const route = useRoute();
</script>

<template>
    <div>
        <h1 class="mt-8 font-Mohave text-3xl font-bold">
            {{ t("login_welcomeRegister") }}
        </h1>
        <p class="mt-2 font-medium text-gray-500">
            {{ t("login_welcomeRegisterHelperText") }}
        </p>

        <GlobalButton class="mt-6 w-full" size="full" @click="redirectToDiscordRegister(encodeURIComponent(route.query.redirect as string) ?? '')">
            {{ t("login_welcomeRegisterButton") }}
        </GlobalButton>

        <div class="mt-10 flex gap-2 text-sm text-gray-500">
            <p>
                {{ t("login_welcomeRegisterLoginReminder")
                }}<span
                    class="ml-1 cursor-pointer underline"
                    @click="redirectToDiscordLogin(encodeURIComponent(route.query.redirect as string) ?? '')"
                >{{ t("login_welcomeRegisterLoginReminderLink") }}</span>
            </p>
        </div>
    </div>
</template>

<style scoped></style>
