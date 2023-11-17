<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import router from "@/router";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const { t } = useI18n();
const logicStore = useLogicStore();
const userStore = useUserStore();
const isIdCopied = ref(false);
const waitingForApi = ref(false);
const formUsername = ref("");
const formErrorMessage = ref("");
const userId = userStore.user.id;

async function copyId(): Promise<void> {
    await logicStore.addTextToClipboard(userStore.user.id);
    isIdCopied.value = true;
}

function getAddToBioText(): string {
    return t("login_addToBioText", {
        linkToBio: `<a href="https://robertsspaceindustries.com/account/profile" target="_blank" class="underline underline-offset-2 cursor-pointer">${t(
            "login_addToBioLink",
        )}</a>`,
    });
}

const submittingLinkForm = async (): Promise<void> => {
    waitingForApi.value = true;
    formErrorMessage.value = "";

    try {
        await userStore.linkUser(formUsername.value);
        await router.push("/");
    } catch (error: any) {
        if (error.statusCode === 451) formErrorMessage.value = t("error_blockedUser");
        else if (error.statusCode === 403) formErrorMessage.value = t("error_noIdRsiBio");
        else if (error.statusCode === 404) formErrorMessage.value = t("error_unknownRsiAccount");
        else formErrorMessage.value = t("error_generic");

        waitingForApi.value = false;
    }
};
</script>

<template>
    <div>
        <h1 class="mt-8 font-Mohave text-3xl font-bold">{{ t("login_verifyRSIAccount") }}</h1>
        <p class="mt-2 font-medium text-gray-500 dark:text-gray-400" v-html="getAddToBioText()" />
        <div class="mt-5 flex items-center">
            <GlobalTextInput class="flex-grow" :disabled="true" v-model="userId" />
            <svg
                v-if="!isIdCopied"
                @click="copyId()"
                class="ml-4 h-6 w-6 cursor-pointer text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
            >
                <path
                    d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"
                />
                <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z" />
            </svg>
            <svg
                v-else
                class="ml-4 h-6 w-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
            >
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
            </svg>
        </div>

        <form class="mt-10" @submit.prevent="submittingLinkForm()">
            <GlobalTextInput
                v-model="formUsername"
                :label="t('login_starCitizenUsername')"
                :placeholder="t('login_username')"
                :disabled="waitingForApi"
                :required="true"
            />
            <p class="mt-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {{ t("login_termsOfService").split("~")[0] }}
                <a
                    class="text-gray-900 underline underline-offset-2 dark:text-gray-100"
                    href="https://www.medrunner.space/terms-of-service"
                    target="_blank"
                    >{{ t("login_termsOfService").split("~")[1] }}.</a
                >
            </p>
            <GlobalButton class="mt-4 w-full" :submit="true" :loading="waitingForApi" size="full" :error-text="formErrorMessage">
                {{ t("login_verify") }}</GlobalButton
            >
        </form>
    </div>
</template>

<style scoped></style>