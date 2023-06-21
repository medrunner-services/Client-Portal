<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
const { t } = useI18n();

const userStore = useUserStore();

const emit = defineEmits(["disconnectUser", "closeModal"]);

const isInputtingRsiHandle = ref(false);
const newRsiHandle = ref(userStore.user.rsiHandle);
const rsiHandleErrorMessage = ref("");
const rsiHandleUpdating = ref(false);
// eslint-disable-next-line no-undef
const appVersion = APP_VERSION;

async function updateRsiHandle(): Promise<void> {
    if (!isInputtingRsiHandle.value) {
        isInputtingRsiHandle.value = true;
        return;
    }

    rsiHandleUpdating.value = true;
    try {
        if (newRsiHandle.value) {
            await userStore.linkUser(newRsiHandle.value);
        }

        isInputtingRsiHandle.value = false;
        rsiHandleUpdating.value = false;
        rsiHandleErrorMessage.value = "";
    } catch (error: any) {
        if (error.statusCode === 451) rsiHandleErrorMessage.value = t("error_blockedUser");
        else if (error.statusCode === 403) rsiHandleErrorMessage.value = t("error_noIdRsiBio");
        else if (error.statusCode === 404) rsiHandleErrorMessage.value = t("error_unknownRsiAccount");
        else if (error.statusCode === 409) rsiHandleErrorMessage.value = t("error_rsiAccountLinked");
        else if (error.statusCode === 429) rsiHandleErrorMessage.value = t("error_rateLimit");
        else rsiHandleErrorMessage.value = t("error_generic");

        rsiHandleUpdating.value = false;
    }
}
</script>

<template>
    <div class="mt-2 flex flex-col justify-between lg:flex-row lg:items-center">
        <input
            v-if="isInputtingRsiHandle"
            type="text"
            v-model="newRsiHandle"
            class="w-fit flex-grow"
            :class="[rsiHandleErrorMessage ? 'input-text-error' : 'input-text', userStore.user.personType !== 0 ? 'w-fit' : '']"
            :disabled="!isInputtingRsiHandle"
        />
        <p v-else class="font-Mohave text-3xl font-bold text-primary-900 lg:text-3xl">{{ userStore.user.rsiHandle }}</p>
        <button
            v-if="userStore.user.personType === 0"
            :disabled="rsiHandleUpdating"
            @click.prevent="updateRsiHandle()"
            class="mt-3 flex w-fit items-center justify-center border-2 border-primary-900 px-5 py-2 font-Inter font-bold lg:mt-0 lg:px-10"
            :class="[isInputtingRsiHandle ? 'ml-0 lg:ml-3' : 'ml-0']"
        >
            <svg
                v-if="rsiHandleUpdating"
                class="mx-5 h-5 w-5 animate-spin text-primary-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span v-else>{{ isInputtingRsiHandle ? t("form_confirm") : t("form_edit") }}</span>
        </button>
    </div>
    <p v-if="rsiHandleErrorMessage" class="mt-2 w-full text-xs text-primary-400">
        {{ rsiHandleErrorMessage }}
    </p>

    <div class="mt-16 lg:flex lg:items-end lg:justify-between">
        <button @click="emit('disconnectUser')" class="button-primary button-48 w-full lg:w-fit">
            {{ t("navbar_disconnect") }}
        </button>

        <p class="mt-5 w-fit text-xs lg:mt-0">v{{ appVersion }}</p>
    </div>
</template>

<style scoped></style>
