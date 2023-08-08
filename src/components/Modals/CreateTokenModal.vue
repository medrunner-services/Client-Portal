<script setup lang="ts">
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/vue/24/outline";
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();
const emit = defineEmits(["tokenCreated"]);

const newTokenName = ref("");
const createdToken = ref("");
const newTokenExpirationDate = ref("");
const errorCreationToken = ref("");
const submittingNewToken = ref(false);
const inputExpirationDate: Ref<HTMLInputElement | null> = ref(null);
const isCopied = ref(false);

onMounted(() => {
    if (inputExpirationDate.value) {
        inputExpirationDate.value.min = new Date().toISOString().split("T")[0];
    }
});

async function createToken() {
    submittingNewToken.value = true;
    errorCreationToken.value = "";

    try {
        if (newTokenExpirationDate.value) {
            createdToken.value = await userStore.createApiToken(newTokenName.value, new Date(newTokenExpirationDate.value));
        } else {
            createdToken.value = await userStore.createApiToken(newTokenName.value);
        }
        submittingNewToken.value = false;
        emit("tokenCreated");
    } catch (error: any) {
        submittingNewToken.value = false;

        if (error.statusCode === 403) errorCreationToken.value = t("error_blockedUser");
        if (error.statusCode === 429) errorCreationToken.value = t("error_rateLimit");
        else errorCreationToken.value = t("error_generic");
    }
}

const copyTokenToClipboard = (): void => {
    navigator.clipboard.writeText(createdToken.value).then(() => {
        isCopied.value = true;
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
            <div class="ml-3 flex cursor-pointer items-center xl:ml-6">
                <CheckIcon v-if="isCopied" class="h-6 w-6" />
                <DocumentDuplicateIcon v-else @click="copyTokenToClipboard()" class="h-6 w-6" />
            </div>
        </div>
    </div>

    <form class="mt-10" @submit.prevent="createToken()" v-else>
        <div>
            <label>{{ t("developer_createTokenFormName") }} *</label>
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

        <p v-if="errorCreationToken" class="mt-2 w-full text-sm text-primary-400">{{ errorCreationToken }}</p>
    </form>
</template>

<style scoped></style>
