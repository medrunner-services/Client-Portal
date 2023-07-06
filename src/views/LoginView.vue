<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import LabelEmergencyForm from "@/components/Emergency/LabelEmergencyForm.vue";
import LoginAnimation from "@/components/LoginAnimation.vue";
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
const clipboardIcon = ref(logicStore.darkMode ? "/icons/copy-icon-dark.svg" : "/icons/copy-icon.svg");

onMounted(() => {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "z") redirectToDiscordLogin();
    });
});

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
        clipboardIcon.value = logicStore.darkMode ? "/icons/check-icon-dark.svg" : "/icons/check-icon.svg";
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
</script>

<template>
    <div class="flex h-screen items-center justify-center bg-white dark:bg-stone-900 lg:px-40" id="animation-bg">
        <LoginAnimation />
        <div
            class="z-10 flex h-full w-full flex-col items-center justify-center bg-white px-5 py-10 dark:bg-stone-900 md:h-fit md:w-fit md:px-20 md:py-24 lg:mr-auto"
        >
            <h1 class="text-center font-Mohave text-3xl font-bold uppercase lg:text-4xl" v-html="getColoredTitle()"></h1>

            <div v-if="route.path === '/login/link'" class="mt-14 flex flex-col lg:mt-28">
                <div class="w-full">
                    <p class="font-Inter text-small font-semibold" v-html="getAddToBioText()"></p>
                    <div class="mt-2 flex">
                        <div class="w-full bg-neutral-700 text-center font-Inter text-xs text-neutral-50">
                            <p class="mx-auto py-3">
                                {{ userStore.user?.id }}
                            </p>
                        </div>
                        <img :src="clipboardIcon" class="ml-3 cursor-pointer xl:ml-6" alt="copy id" @click="copyIdToClipboard()" />
                    </div>
                    <p class="mt-5 text-xs italic lg:text-sm">
                        {{ t("login_warningRSIProfileBug") }}
                    </p>
                </div>
                <form class="mt-10 flex w-full flex-col xl:flex-row xl:items-end xl:justify-between" @submit.prevent="submittingLinkForm()">
                    <div class="w-full">
                        <LabelEmergencyForm title-local="login_starCitizenUsername" description-local="login_RSIUsername" />
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
                    <button :disabled="waitingForApi" class="button-primary mt-4 px-8 py-[11px] font-Inter text-small font-semibold xl:ml-4 xl:mt-0">
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
                <p v-if="formErrorActive" class="mt-2 font-Inter text-sm text-primary-400">
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
</template>

<style scoped>
#animation-bg {
    background-color: #000000;
    background-image: radial-gradient(circle at top right, rgba(121, 68, 154, 0.13), transparent),
        radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.13), transparent);
}
</style>
