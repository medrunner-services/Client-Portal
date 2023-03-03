<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosError } from "axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import router from "@/router";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const route = useRoute();

const formUsername = ref("");
const waitingForApi = ref(false);
const loginErrorAlert = ref(false);
const formErrorMessage = ref("An error occurred");
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
        router.push("/");
    } catch (error: AxiosError | any) {
        if (error.message === "451") formErrorMessage.value = "This account is blocked";
        if (error.message === "403") formErrorMessage.value = "Missing Medrunner ID in RSI Bio";
        if (error.message === "404")
            formErrorMessage.value = "Cannot find a RSI account with this username";

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
</script>

<template>
    <div class="pt-0 h-screen flex justify-center">
        <div
            v-if="loginErrorAlert"
            class="absolute z-10 top-14 lg:top-10 bg-primary-100 font-Mohave font-bold py-4 px-8 border-2 border-primary-900"
        >
            <p>Something went wrong, please try again</p>
        </div>
        <div
            class="w-[55%] justify-center items-center bg-[url('/images/background-login.webp')] bg-center bg-cover hidden md:flex"
        />
        <div class="flex flex-col justify-center items-center h-full md:w-[45%]">
            <h1 class="title">Welcome to the</h1>
            <div class="flex items-center">
                <img class="h-12 mr-2" src="/images/medrunner-logo.webp" alt="Medrunner Logo" />
                <h1 class="title"><span class="text-primary-900">Medrunner</span> Portal</h1>
            </div>

            <div v-if="route.path === '/login/link'" class="flex w-4/5 xl:w-3/5 flex-col mt-20">
                <div class="w-full">
                    <p class="text-neutral-900 font-Inter font-semibold text-small">
                        Please add this to your
                        <a
                            href="https://robertsspaceindustries.com/account/profile"
                            target="_blank"
                            class="underline underline-offset-2 cursor-pointer"
                            >RSI bio</a
                        >
                        before submitting your username :
                    </p>
                    <div class="flex mt-2">
                        <div
                            class="bg-neutral-700 text-neutral-50 font-Inter text-xs w-full text-center"
                        >
                            <p class="py-3 mx-auto">
                                {{ userStore.user?.id }}
                            </p>
                        </div>
                        <img
                            :src="clipboardIcon"
                            class="ml-3 xl:ml-6 cursor-pointer"
                            alt="copy id"
                            @click="copyIdToClipboard()"
                        />
                    </div>
                </div>
                <form
                    class="flex flex-col w-full mt-10 xl:flex-row xl:items-end xl:justify-between"
                    @submit.prevent="submittingLinkForm()"
                >
                    <div class="w-full">
                        <div class="flex items-center mb-2">
                            <label
                                for="rsiHandle"
                                class="text-small font-semibold font-Inter text-neutral-900"
                                >Star Citizen username</label
                            >
                            <img
                                src="/icons/info-icon.svg"
                                alt="Info label"
                                class="ml-2 h-4 w-4 cursor-help"
                                title="The username of your RSI account"
                            />
                        </div>
                        <input
                            id="rsiHandle"
                            v-model="formUsername"
                            type="text"
                            name="rsiHandle"
                            class="w-full"
                            :class="formErrorActive ? 'input-text-error' : 'input-text'"
                            placeholder="Your username..."
                        />
                    </div>
                    <button
                        :disabled="waitingForApi"
                        class="button-primary font-Inter font-semibold text-small px-8 py-[11px] xl:ml-4 mt-4 xl:mt-0"
                    >
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
                        <span v-else>Continue</span>
                    </button>
                </form>
                <p v-if="formErrorActive" class="mt-2 text-primary-400 font-Inter text-sm">
                    {{ formErrorMessage }}
                </p>
            </div>
            <div v-else class="flex flex-col mt-14">
                <button
                    class="button-primary button-48"
                    @click="userStore.redirectToDiscordLogin()"
                >
                    Login with Discord
                </button>
                <button
                    class="button-secondary button-48 mt-5"
                    @click="userStore.redirectToDiscordRegister()"
                >
                    Register with Discord
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title {
    @apply uppercase text-neutral-900 text-title font-Mohave font-bold;
}
</style>
