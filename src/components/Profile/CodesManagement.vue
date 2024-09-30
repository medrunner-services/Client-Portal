<script setup lang="ts">
import { CodeType } from "@medrunner/api-client";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();

// TODO: localization
function getCodeTypeString(type: CodeType): string {
    switch (type) {
        case CodeType.CitizenCon2954:
            return "CitizenCon 2954";

        default:
            return t("history_unknown");
    }
}
</script>

<template>
    <div>
        <!--  TODO: localization  -->
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">Promotional codes</h2>
        </div>

        <div class="w-full">
            <div class="rounded-lg shadow-md dark:bg-gray-800 dark:shadow-gray-900">
                <div>
                    <div class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <div
                            class="grid grid-cols-12 rounded-t-lg bg-gray-50 p-3 font-Mohave font-semibold uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400 md:grid-cols-12"
                        >
                            <div class="col-span-5">Code</div>
                            <div class="col-span-3">Event</div>
                        </div>
                        <div v-if="userStore.user.redeemedCodes.length > 0">
                            <div v-for="code in userStore.user.redeemedCodes" :key="code.code">
                                <div class="grid grid-cols-12 items-center border-b px-3 py-1 last:border-b-0 dark:border-gray-700 md:grid-cols-12">
                                    <div class="col-span-5 font-medium text-gray-900 dark:text-white md:col-span-5">{{ code.code }}</div>

                                    <div class="col-span-3">
                                        <p>{{ getCodeTypeString(code.type) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex h-56 w-full items-center justify-center">
                            <p>No codes redeemed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
