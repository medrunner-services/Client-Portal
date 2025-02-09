<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import LoginAnimation from "@/components/Login/LoginAnimation.vue";
import LoginLinkForm from "@/components/Login/LoginLinkForm.vue";
import LoginRegister from "@/components/Login/LoginRegister.vue";
import LoginSettings from "@/components/Login/LoginSettings.vue";
import LoginWelcome from "@/components/Login/LoginWelcome.vue";
import { useAlertStore } from "@/stores/alertStore";
import { useLogicStore } from "@/stores/logicStore";
import { AlertColors } from "@/types";

const route = useRoute();
const { t } = useI18n();
const logicStore = useLogicStore();
const alertStore = useAlertStore();

const showSettings = ref(false);
const routeQueryError = ref(route.query.error);
const showLoginRegister = ref(false);

onMounted(async () => {
    if (routeQueryError.value) {
        if (routeQueryError.value === "accountUnknown") {
            showLoginRegister.value = true;
        } else {
            alertStore.newAlert(AlertColors.RED, getErrorText());
        }
    }
});

function getErrorText(): string {
    switch (routeQueryError.value) {
        case "discord_access_denied":
            return t("error_loginDiscordDenied");
        case "accountUnknown":
            return t("error_loginAccountUnknown");
        case "accountKnown":
            return t("error_loginAccountKnown");
        default:
            return t("error_generic");
    }
}
</script>

<template>
    <div id="animation-bg" class="flex h-screen justify-center">
        <LoginAnimation
            class="hidden md:block"
            :animation-status="logicStore.isLoginAnimationAllowed"
            :speed="logicStore.isLoginAnimationAllowed ? logicStore.loginAnimationSpeed : 0"
            :glow-size="logicStore.loginAnimationGlowSize"
            :star-size="logicStore.loginAnimationStarSize"
        />

        <div class="content-container flex h-full w-full items-center">
            <div class="z-10 w-full rounded-lg bg-white dark:bg-gray-800 dark:text-white md:p-10 lg:mx-14 lg:w-1/2 2xl:w-1/3">
                <div>
                    <div class="flex items-center justify-between">
                        <img class="w-52 lg:w-72" :src="logicStore.medrunnerLogoUrl" alt="Medrunner Logo" />
                        <div v-if="route.name === 'login'">
                            <svg
                                v-if="showSettings"
                                class="h-5 w-5 cursor-pointer text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                                @click="showSettings = false"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <svg
                                v-else
                                class="h-5 w-5 cursor-pointer text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                @click="showSettings = true"
                            >
                                <path
                                    d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z"
                                />
                            </svg>
                        </div>
                    </div>
                    <LoginSettings v-if="showSettings" />
                    <LoginLinkForm v-else-if="route.name === 'loginLink'" />
                    <LoginRegister v-else-if="showLoginRegister" />
                    <LoginWelcome v-else />
                </div>
            </div>
        </div>
    </div>
</template>
