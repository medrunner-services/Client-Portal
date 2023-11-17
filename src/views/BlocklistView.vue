<script setup lang="ts">
import type { BlockReport } from "@medrunner-services/api-client";
import { computed, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useBlocklistStore } from "@/stores/blocklistStore";
import { useLogicStore } from "@/stores/logicStore";

const { t } = useI18n();
const blocklistStore = useBlocklistStore();
const logicStore = useLogicStore();

const searchType: Ref<"user" | "org"> = ref("user");
const inputName = ref("");
const formErrorMessage = ref("");
const formSearching = ref(false);

const searchedResult: Ref<BlockReport | undefined> = ref(undefined);
const searchResultEmptyName = ref("");

const inputPlaceholder = computed(() => {
    if (searchType.value === "user") return t("blocklist_placeholderUser");
    else return t("blocklist_placeholderOrg");
});

async function searchBlocklist() {
    formSearching.value = true;
    formErrorMessage.value = "";
    searchResultEmptyName.value = "";
    searchedResult.value = undefined;

    try {
        const queryResponse = await blocklistStore.fetchBlocklist(searchType.value, inputName.value);
        if (queryResponse.length > 0) {
            searchedResult.value = queryResponse[0];
        } else {
            searchResultEmptyName.value = inputName.value;
        }
        formSearching.value = false;
    } catch (error) {
        formErrorMessage.value = t("error_generic");
        formSearching.value = false;
    }
}

function clearForm() {
    formErrorMessage.value = "";
    inputName.value = "";
    searchedResult.value = undefined;
    searchResultEmptyName.value = "";
}
</script>

<template>
    <div class="content-container lg:w-1/2">
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("blocklist_Title") }}</h2>

        <form @submit.prevent="searchBlocklist()" class="mt-4">
            <div class="flex items-center">
                <GlobalSelectInput
                    :options="[
                        { value: 'user', label: t('blocklist_User') },
                        { value: 'org', label: t('blocklist_Org') },
                    ]"
                    radius="rounded-l-lg"
                    v-model="searchType"
                    class="font-semibold"
                    @change="clearForm()"
                />
                <GlobalTextInput class="flex-grow" radius="none" :required="true" v-model="inputName" :placeholder="inputPlaceholder" />
                <button type="submit" class="rounded-r-lg border border-primary-600 bg-primary-600 p-3 text-sm font-medium text-white">
                    <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                    </svg>
                </button>
            </div>
        </form>

        <GlobalCard v-if="formErrorMessage || searchedResult || searchResultEmptyName || formSearching" class="mt-10 text-center">
            <div v-if="formSearching" class="flex h-48 w-full items-center justify-center">
                <GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
            </div>
            <GlobalErrorText class="my-[6.4rem]" v-else-if="formErrorMessage" :text="formErrorMessage" />
            <div v-else class="flex flex-col items-center">
                <div>
                    <div v-if="searchResultEmptyName" class="h-24 w-24 rounded-full bg-green-300 p-8 shadow-md">
                        <svg
                            class="h-full w-full text-green-600"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 12"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M1 5.917 5.724 10.5 15 1.5"
                            />
                        </svg>
                    </div>

                    <div v-else class="h-24 w-24 rounded-full bg-red-300 p-8 shadow-md">
                        <svg class="h-full w-full text-red-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                    </div>
                </div>

                <p v-if="searchResultEmptyName" class="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                    {{ searchResultEmptyName }}
                </p>
                <p v-else-if="searchedResult" class="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                    {{ searchedResult.rsiHandle ? searchedResult.rsiHandle : searchedResult.orgSid }}
                </p>
                <p v-if="searchResultEmptyName" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t("blocklist_NotBlocked") }}</p>
                <p v-else-if="searchedResult?.updated" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ t("blocklist_Blocked") }} <span class="font-bold">{{ logicStore.timestampToDate(searchedResult?.updated) }}</span>
                </p>
                <a
                    v-if="searchedResult?.rsiHandle"
                    :href="`https://robertsspaceindustries.com/citizens/${searchedResult.rsiHandle}`"
                    target="_blank"
                    class="mt-6"
                >
                    <GlobalButton icon="link">{{ t("blocklist_RSIProfile") }}</GlobalButton>
                </a>
                <a
                    v-else-if="searchedResult?.orgSid"
                    :href="`https://robertsspaceindustries.com/orgs/${searchedResult.orgSid}`"
                    target="_blank"
                    class="mt-6"
                >
                    <GlobalButton icon="link">{{ t("blocklist_RSIPage") }}</GlobalButton>
                </a>
            </div>
        </GlobalCard>
    </div>
</template>
