<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useBlocklistStore } from "@/stores/blocklistStore";

const blocklistStore = useBlocklistStore();
const { t } = useI18n();

const searchType = ref("user");
const formName = ref("");
const formErrorMessage = ref("");
const formSubmittingSearch = ref(false);

async function searchBlocklist() {
    formSubmittingSearch.value = true;
    formErrorMessage.value = "";

    blocklistStore.isQueryEmpty = false;
    blocklistStore.curentQuery = [];

    try {
        const queryResponse = await blocklistStore.fetchBlocklist(searchType.value, formName.value);
        if (queryResponse.length === 0) {
            blocklistStore.isQueryEmpty = true;
        } else {
            blocklistStore.curentQuery = queryResponse;
        }
        formSubmittingSearch.value = false;
    } catch (error) {
        formErrorMessage.value = t("error_generic");
        formSubmittingSearch.value = false;
    }
}

function clearForm() {
    formErrorMessage.value = "";
    formName.value = "";

    blocklistStore.curentQuery = [];
    blocklistStore.isQueryEmpty = false;
}
</script>

<template>
    <form @submit.prevent="searchBlocklist()" class="mt-14 w-full max-w-3xl lg:flex lg:max-w-5xl lg:justify-between">
        <div class="flex lg:mr-8 lg:flex-grow">
            <select
                @change="clearForm()"
                class="focus:border-secondary-500 focus:ring-secondary-500"
                v-model="searchType"
                required
                :disabled="formSubmittingSearch"
            >
                <option value="user">{{ t("blocklist_User") }}</option>
                <option value="org">{{ t("blocklist_Org") }}</option>
            </select>

            <input
                type="text"
                autocomplete="off"
                v-model="formName"
                class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                :class="formErrorMessage ? 'input-text-error' : 'input-text'"
                :disabled="formSubmittingSearch"
                :placeholder="t('blocklist_InputDescription')"
                required
            />
        </div>

        <button
            type="submit"
            class="my-4 flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:my-0 lg:w-fit"
            :disabled="formSubmittingSearch"
        >
            <svg
                v-if="formSubmittingSearch"
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
            <span v-else>{{ t("blocklist_Search") }}</span>
        </button>
    </form>
    <p v-if="formErrorMessage" class="mt-2 w-full max-w-3xl text-sm text-primary-400 lg:max-w-5xl">
        {{ formErrorMessage }}
    </p>
</template>

<style scoped></style>
