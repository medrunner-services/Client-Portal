<script setup lang="ts">
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();
const emit = defineEmits(["tokenCreated"]);

const newTokenName = ref("");
const createdToken = ref("");
const newTokenExpirationDate = ref("");
const errorCreationToken = ref(false);
const submittingNewToken = ref(false);
const inputExpirationDate: Ref<HTMLInputElement | null> = ref(null);
const clipboardIcon = ref("/icons/copy-icon.svg");

onMounted(() => {
    if (inputExpirationDate.value) {
        inputExpirationDate.value.min = new Date().toISOString().split("T")[0];
    }
});

async function createToken() {
    submittingNewToken.value = true;
    errorCreationToken.value = false;

    try {
        if (newTokenExpirationDate.value) {
            createdToken.value = await userStore.createApiToken(newTokenName.value, new Date(newTokenExpirationDate.value));
        } else {
            createdToken.value = await userStore.createApiToken(newTokenName.value);
        }
        submittingNewToken.value = false;
        emit("tokenCreated");
    } catch (error) {
        errorCreationToken.value = true;
        submittingNewToken.value = false;
    }
}

const copyTokenToClipboard = (): void => {
    navigator.clipboard.writeText(createdToken.value).then(() => {
        clipboardIcon.value = "/icons/check-icon.svg";
    });
};
</script>

<template>
    <div v-if="createdToken">
        <p class="mt-4">{{ t("developer_createTokenAlertCopy") }}</p>
        <div class="mt-4 flex w-full">
            <div class="bg-neutral-700 text-center font-Inter text-xs text-neutral-50">
                <p class="break-all px-2 py-3">
                    {{ createdToken }}
                </p>
            </div>
            <img :src="clipboardIcon" class="ml-3 cursor-pointer xl:ml-6" alt="copy id" @click="copyTokenToClipboard()" />
        </div>
    </div>

    <form class="mt-10" @submit.prevent="createToken()" v-else>
        <div>
            <label>{{ t("developer_createTokenFormName") }}</label>
            <input
                type="text"
                autocomplete="off"
                v-model="newTokenName"
                class="mt-2 w-full focus:border-secondary-500 focus:ring-secondary-500"
                :class="errorCreationToken ? 'input-text-error' : 'input-text'"
                :disabled="submittingNewToken"
                :placeholder="t('developer_createTokenPlaceholderFormName')"
                required
            />
        </div>

        <div class="mt-6">
            <label>{{ t("developer_createTokenFormExpirationDate") }}</label>
            <input
                type="date"
                v-model="newTokenExpirationDate"
                class="mt-2 w-full focus:border-secondary-500 focus:ring-secondary-500 dark:[color-scheme:dark]"
                :class="errorCreationToken ? 'input-text-error' : 'input-text'"
                :disabled="submittingNewToken"
                ref="inputExpirationDate"
            />
        </div>

        <button
            type="submit"
            class="my-6 flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50"
            :disabled="submittingNewToken"
        >
            <svg
                v-if="submittingNewToken"
                class="mx-4 my-0.5 h-5 w-5 animate-spin text-white"
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
            <span v-else>{{ t("developer_createTokenFormButton") }}</span>
        </button>
    </form>
</template>

<style scoped></style>
