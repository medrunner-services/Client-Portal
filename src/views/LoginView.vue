<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import router from "@/router";
import { useUserStore } from "@/stores/userStore";
import { redirectToDiscordLogin } from "@/utils/discordRedirects";

const userStore = useUserStore();
const route = useRoute();
const { t } = useI18n();

const formUsername = ref("");
const waitingForApi = ref(false);
const loginErrorAlert = ref(false);
const formErrorMessage = ref(t("login_genericError"));
const formErrorActive = ref(false);
const clipboardIcon = ref("/icons/copy-icon.svg");

onMounted(() => {
    if (route.query.error) loginErrorAlert.value = true;
});

const submittingLinkForm = async (): Promise<void> => {
    waitingForApi.value = true;
    loginErrorAlert.value = false;

    try {
        await userStore.linkUser(formUsername.value);
        await router.push("/");
    } catch (error: any) {
        if (error === 451) formErrorMessage.value = t("login_errorAccountBlocked");
        if (error === 403) formErrorMessage.value = t("login_errorMissingMedrunnerId");
        if (error === 404) formErrorMessage.value = t("login_errorUnknownRSIAccount");

        formErrorActive.value = true;
        waitingForApi.value = false;
    }
};

const copyIdToClipboard = (): void => {
    if (!userStore.user) return;
    navigator.clipboard.writeText(userStore.user.id).then(() => {
        clipboardIcon.value = "/icons/check-icon.svg";
    });
};

function getColoredTitle(): string {
    const title = t("login_welcomeMessage");

    return `${title.substring(
        0,
        title.indexOf("Medrunner"),
    )} <span class="text-primary-900 flex items-center justify-center"><img class="h-12 mr-2" src="/images/medrunner-logo.webp" alt="Medrunner Logo" />Medrunner </span> ${title
        .substring(title.indexOf("Medrunner"))
        .substring(9)}`;
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
    <div class="pt-0 h-screen flex justify-center">
        <div v-if="loginErrorAlert" class="absolute z-10 top-14 lg:top-10 bg-primary-100 font-Mohave font-bold py-4 px-8 border-2 border-primary-900">
            <p>{{ t("login_modalErrorMessage") }}</p>
        </div>
        <div class="w-[55%] justify-center items-center bg-[url('/images/background-login.webp')] bg-center bg-cover hidden md:flex" />
        <div class="flex flex-col justify-center items-center h-full md:w-[45%]">
            <h1 class="text-center uppercase text-neutral-900 text-title font-Mohave font-bold" v-html="getColoredTitle()"></h1>

            <div v-if="route.path === '/login/link'" class="flex w-4/5 xl:w-3/5 flex-col mt-20">
                <div class="w-full">
                    <p class="text-neutral-900 font-Inter font-semibold text-small" v-html="getAddToBioText()"></p>
                    <div class="flex mt-2">
                        <div class="bg-neutral-700 text-neutral-50 font-Inter text-xs w-full text-center">
                            <p class="py-3 mx-auto">
                                {{ userStore.user?.id }}
                            </p>
                        </div>
                        <img :src="clipboardIcon" class="ml-3 xl:ml-6 cursor-pointer" alt="copy id" @click="copyIdToClipboard()" />
                    </div>
                    <p class="mt-5 text-xs italic lg:text-sm">
                        {{ t("login_warningRSIProfileBug") }}
                    </p>
                </div>
                <form class="flex flex-col w-full mt-10 xl:flex-row xl:items-end xl:justify-between" @submit.prevent="submittingLinkForm()">
                    <div class="w-full">
                        <div class="flex items-center mb-2">
                            <label for="rsiHandle" class="text-small font-semibold font-Inter text-neutral-900">{{
                                t("login_starCitizenUsername")
                            }}</label>
                            <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('login_RSIUsername')" />
                        </div>
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
                    <button :disabled="waitingForApi" class="button-primary font-Inter font-semibold text-small px-8 py-[11px] xl:ml-4 mt-4 xl:mt-0">
                        <svg
                            v-if="waitingForApi"
                            class="animate-spin text-white w-full"
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
                <p v-if="formErrorActive" class="mt-2 text-primary-400 font-Inter text-sm">
                    {{ formErrorMessage }}
                </p>
            </div>
            <div v-else class="flex flex-col mt-14">
                <button class="button-primary button-48" @click="redirectToDiscordLogin()">
                    {{ t("login_logInButton") }}
                </button>
                <button
                    disabled
                    class="border-2 border-primary-900/50 text-black/50 button-48 mt-5 cursor-not-allowed"
                    title="Unavailable during Beta"
                >
                    {{ t("login_registerButton") }}
                </button>
            </div>
        </div>
    </div>
</template>
