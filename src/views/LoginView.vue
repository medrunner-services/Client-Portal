<script setup lang="ts">
import { CheckIcon, Cog6ToothIcon, DocumentDuplicateIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import LabelInput from "@/components/LabelInput.vue";
import LoginAnimation from "@/components/Login/LoginAnimation.vue";
import Settings from "@/components/Settings.vue";
import router from "@/router";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { redirectToDiscordLogin } from "@/utils/discordRedirects";

const userStore = useUserStore();
const logicStore = useLogicStore();
const route = useRoute();
const { t } = useI18n();

const formUsername = ref("");
const waitingForApi = ref(false);
const formErrorMessage = ref(t("error_generic"));
const formErrorActive = ref(false);
const isCopied = ref(false);
const routeQueryError = ref(route.query.error);
const displaySettings = ref(false);
const loginAnimation = ref(
    localStorage.getItem("loginAnimation")
        ? localStorage.getItem("loginAnimation") === "true"
        : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
);
const loginAnimationSpeed = ref(parseInt(localStorage.getItem("loginAnimationSpeed") ?? "1"));
const loginAnimationStarSize = ref(parseInt(localStorage.getItem("loginAnimationStarSize") ?? "2"));
const loginAnimationGlowSize = ref(parseInt(localStorage.getItem("loginAnimationGlowSize") ?? "2"));

const submittingLinkForm = async (): Promise<void> => {
    waitingForApi.value = true;

    try {
        await userStore.linkUser(formUsername.value);
        await router.push("/");
    } catch (error: any) {
        if (error.statusCode === 451) formErrorMessage.value = t("error_blockedUser");
        if (error.statusCode === 403) formErrorMessage.value = t("error_noIdRsiBio");
        if (error.statusCode === 404) formErrorMessage.value = t("error_unknownRsiAccount");

        formErrorActive.value = true;
        waitingForApi.value = false;
    }
};

const copyIdToClipboard = (): void => {
    if (!userStore.user) return;
    navigator.clipboard.writeText(userStore.user.id).then(() => {
        isCopied.value = true;
    });
};

function getColoredTitle(): string {
    const title = t("login_welcomeMessage");

    return `${title.substring(
        0,
        title.indexOf("Medrunner"),
    )} <span class="text-primary-900 flex items-center justify-center"><img class="h-12 mr-2 my-2" src="${
        logicStore.medrunnerLogoUrl
    }" alt="Medrunner Logo" /></span> ${title.substring(title.indexOf("Medrunner")).substring(9)}`;
}

function getAddToBioText(): string {
    return t("login_addToBioText", {
        linkToBio: `<a href="https://robertsspaceindustries.com/account/profile" target="_blank" class="underline underline-offset-2 cursor-pointer">${t(
            "login_addToBioLink",
        )}</a>`,
    });
}

function getErrorText(): string {
    switch (routeQueryError.value) {
        case "deactivated":
            return t("error_loginAccountDeactivated");
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

function updateLoginAnimation(): void {
    if (loginAnimation.value) {
        loginAnimation.value = false;
        localStorage.setItem("loginAnimation", "false");
    } else {
        loginAnimation.value = true;
        localStorage.setItem("loginAnimation", "true");
    }
}

function updateSetting(setting: string, value: number): void {
    localStorage.setItem(setting, value.toString());
}

function resetAnimationSettings(): void {
    loginAnimationSpeed.value = 1;
    loginAnimationStarSize.value = 2;
    loginAnimationGlowSize.value = 2;

    localStorage.setItem("loginAnimationSpeed", "1");
    localStorage.setItem("loginAnimationStarSize", "2");
    localStorage.setItem("loginAnimationGlowSize", "2");
}
</script>

<template>
    <div class="flex h-screen items-center justify-center bg-white dark:bg-stone-900 lg:px-40" id="animation-bg">
        <LoginAnimation
            class="hidden md:block"
            :animation-status="loginAnimation"
            :speed="loginAnimation ? loginAnimationSpeed : 0"
            :glow-size="loginAnimationGlowSize"
            :star-size="loginAnimationStarSize"
        />

        <div
            v-if="routeQueryError"
            class="absolute top-14 z-20 border-2 border-red-500 bg-primary-100 px-8 py-4 font-Mohave text-lg font-bold dark:text-black lg:top-14"
        >
            <p>{{ getErrorText() }}</p>
        </div>

        <div class="z-10 flex h-full w-full flex-col items-center justify-center bg-white p-5 dark:bg-stone-900 md:h-fit md:w-[30rem] lg:mr-auto">
            <div class="hidden cursor-pointer self-end md:block" @click="displaySettings = !displaySettings" v-if="route.name === 'login'">
                <XMarkIcon class="h-6 w-6" v-if="displaySettings" />
                <Cog6ToothIcon class="h-6 w-6" v-else />
            </div>

            <div class="px-5 py-10 md:h-full md:px-10 md:py-14">
                <div v-if="displaySettings">
                    <div class="border-b border-gray-200 pb-5 dark:border-stone-700">
                        <Settings />
                    </div>
                    <div class="pt-5">
                        <div class="flex items-center justify-between">
                            <span class="font-semibold">{{ t("login_settingAnimation") }}</span>
                            <label class="relative mr-5 inline-flex cursor-pointer items-center">
                                <input @click="updateLoginAnimation" type="checkbox" v-model="loginAnimation" class="peer sr-only" />
                                <div
                                    class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-900/30 dark:bg-stone-800"
                                ></div>
                            </label>
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <span class="font-semibold">{{ t("login_settingAnimationSpeed") }}</span>
                            <input
                                type="number"
                                min="0"
                                v-model="loginAnimationSpeed"
                                class="w-16"
                                @input="updateSetting('loginAnimationSpeed', loginAnimationSpeed)"
                                oninput="validity.valid||(value='');"
                                :disabled="!loginAnimation"
                            />
                        </div>

                        <div class="mt-4 flex items-center justify-between">
                            <span class="font-semibold">{{ t("login_settingAnimationStarSize") }}</span>
                            <input
                                type="number"
                                min="0"
                                v-model="loginAnimationStarSize"
                                class="w-16"
                                @input="updateSetting('loginAnimationStarSize', loginAnimationStarSize)"
                                oninput="validity.valid||(value='');"
                                :disabled="!loginAnimation"
                            />
                        </div>

                        <div class="mt-4 flex items-center justify-between">
                            <span class="font-semibold">{{ t("login_settingAnimationStarGlow") }}</span>
                            <input
                                type="number"
                                min="0"
                                v-model="loginAnimationGlowSize"
                                class="w-16"
                                @input="updateSetting('loginAnimationGlowSize', loginAnimationGlowSize)"
                                oninput="validity.valid||(value='');"
                                :disabled="!loginAnimation"
                            />
                        </div>
                    </div>

                    <button
                        @click="resetAnimationSettings"
                        class="mt-5 flex w-full items-center justify-center border-2 border-primary-900 px-6 py-3 font-medium"
                    >
                        {{ t("login_settingReset") }}
                    </button>
                </div>
                <div v-else>
                    <h1 class="text-center font-Mohave text-3xl font-bold uppercase lg:text-4xl" v-html="getColoredTitle()"></h1>

                    <div v-if="route.name === 'loginLink'" class="mt-14 flex flex-col lg:mt-28">
                        <div class="w-full">
                            <p class="font-Inter text-small font-semibold" v-html="getAddToBioText()"></p>
                            <div class="mt-2 flex">
                                <div class="w-full bg-neutral-700 text-center font-Inter text-xs text-neutral-50">
                                    <p class="mx-auto py-3">
                                        {{ userStore.user?.id }}
                                    </p>
                                </div>
                                <div class="ml-3 flex cursor-pointer items-center xl:ml-6">
                                    <CheckIcon v-if="isCopied" class="h-6 w-6" />
                                    <DocumentDuplicateIcon v-else @click="copyIdToClipboard()" class="h-6 w-6" />
                                </div>
                            </div>
                            <p class="mt-5 text-xs italic lg:text-sm">
                                {{ t("login_warningRSIProfileBug") }}
                            </p>
                        </div>
                        <form class="mt-10 flex w-full flex-col xl:flex-row xl:items-end xl:justify-between" @submit.prevent="submittingLinkForm()">
                            <div class="w-full">
                                <LabelInput title-local="login_starCitizenUsername" description-local="login_RSIUsername" :required="true" />
                                <div class="mt-2 flex w-full">
                                    <input
                                        id="rsiHandle"
                                        v-model="formUsername"
                                        type="text"
                                        name="rsiHandle"
                                        class="w-full"
                                        :class="formErrorActive ? 'input-text-error' : 'input-text'"
                                        :placeholder="t('login_username') + '...'"
                                    />
                                </div>
                            </div>
                            <button
                                :disabled="waitingForApi"
                                class="button-primary mt-4 px-8 py-[11px] font-Inter text-small font-semibold xl:ml-4 xl:mt-0"
                            >
                                <svg
                                    v-if="waitingForApi"
                                    class="w-full animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                                    />
                                </svg>
                                <span v-else>{{ t("login_continue") }}</span>
                            </button>
                        </form>
                        <p v-if="formErrorActive" class="mt-2 font-Inter text-sm text-red-500">
                            {{ formErrorMessage }}
                        </p>
                    </div>
                    <div v-else class="mt-14 flex flex-col lg:mt-28">
                        <button class="button-48 bg-primary-900 text-white" @click="redirectToDiscordLogin()">
                            {{ t("login_logInButton") }}
                        </button>
                        <button disabled class="button-48 mt-5 cursor-not-allowed border-2 border-primary-900/50 text-black/50 dark:text-slate-50/50">
                            {{ t("login_registerButton") }}
                        </button>
                        <p class="mt-2 text-xs text-primary-400">{{ t("error_UnavailableFeatureBeta") }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#animation-bg {
    background-color: #000000;
    background-image: radial-gradient(circle at top right, rgba(121, 68, 154, 0.13), transparent),
        radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.13), transparent);
}
</style>
