<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import TokenTable from "@/components/Profile/Token/TokenTable.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import { useUserStore } from "@/stores/userStore";

const { t } = useI18n();
const userStore = useUserStore();

const displayCreateTokenModal = ref(false);
</script>

<template>
    <div class="mt-10">
        <div class="flex min-h-11 items-center justify-between">
            <div class="flex gap-2">
                <h2 class="font-Mohave text-2xl font-semibold uppercase">
                    {{ t("developer_apiTokensTitle") }}
                </h2>

                <a href="https://medrunner.dev" target="_blank" :title="t('developer_APIDocumentation')">
                    <svg
                        class="
                            h-4 w-4 cursor-pointer text-gray-900
                            dark:text-white
                        "
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                        />
                    </svg>
                </a>
            </div>

            <GlobalButton :disabled="userStore.isBlocked" icon="plus" @click="displayCreateTokenModal = true">
                {{
                    t("developer_createTokenButton")
                }}
            </GlobalButton>
        </div>

        <div class="mt-4">
            <TokenTable :display-create-token-modal="displayCreateTokenModal" @close-create-token-modal="displayCreateTokenModal = false" />
        </div>
    </div>
</template>

<style scoped></style>
