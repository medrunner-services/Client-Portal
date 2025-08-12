<script setup lang="ts">
import type { ApiToken } from "@medrunner/api-client";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import DeleteTokenModal from "@/components/Modals/DeleteTokenModal.vue";
import GlobalLocalizedDate from "@/components/utils/GlobalLocalizedDate.vue";
const { t } = useI18n();

export interface Props {
    token: ApiToken;
}
const props = defineProps<Props>();
const emit = defineEmits(["tokenDeleted"]);

const displayDeleteTokenModal = ref(false);

const isTokenExpired = computed(() => {
    if (!props.token.expirationDate) return false;
    return Date.now() / 1000 > new Date(props.token.expirationDate).getTime();
});
</script>

<template>
    <div class="grid grid-cols-12 items-center border-b px-3 py-1 last:border-b-0 dark:border-gray-700 md:grid-cols-12">
        <div class="col-span-5 font-medium text-gray-900 dark:text-white md:col-span-5">{{ props.token.name }}</div>

        <div class="col-span-3">
            <GlobalLocalizedDate v-if="props.token.lastUsed" :date="props.token.lastUsed" format="toDate" />
            <p v-else>{{ t("developer_tokenNever") }}</p>
        </div>

        <div class="col-span-3 md:col-span-2">
            <GlobalLocalizedDate
                v-if="props.token.expirationDate"
                :class="isTokenExpired ? 'font-medium text-red-600' : ''"
                :date="props.token.expirationDate"
                format="toDate"
            />
            <p v-else class="font-medium text-yellow-400">{{ t("developer_tokenNever") }}</p>
        </div>

        <div class="col-span-1 flex items-center justify-end font-medium text-red-600 md:col-span-2">
            <div class="flex cursor-pointer gap-2 rounded-lg p-2 hover:bg-red-600/10" @click="displayDeleteTokenModal = true">
                <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                    <path
                        d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"
                    />
                </svg>
                <p class="hidden md:block">{{ t("developer_tokenDelete") }}</p>
            </div>
        </div>

        <DeleteTokenModal
            v-if="displayDeleteTokenModal"
            :token="props.token"
            @close="displayDeleteTokenModal = false"
            @token-deleted="
                (id) => {
                    emit('tokenDeleted', id);
                }
            "
        />
    </div>
</template>

<style scoped></style>
