<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/outline";
import type { ApiToken } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t, locale } = useI18n();

const emit = defineEmits(["deletedToken", "deletedTokenError"]);

const props = defineProps({
    token: {
        type: Object as () => ApiToken,
        required: true,
    },
});

const deleteTokenError = ref(false);
const isTokenExpired = ref(props.token.expirationDate ? Date.now() / 1000 > props.token.expirationDate : false);

function timestampToDate(timestamp: string | number): string {
    return new Date(timestamp).toLocaleDateString(locale.value, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

async function deleteToken(): Promise<void> {
    deleteTokenError.value = false;
    try {
        await userStore.deleteApiToken(props.token.id);
        emit("deletedToken", props.token.id);
    } catch (e) {
        emit("deletedTokenError");
        deleteTokenError.value = true;
    }
}
</script>

<template>
    <div>
        <div class="flex justify-between gap-4">
            <div class="grid w-full grid-cols-2 gap-x-8 lg:gap-x-0" :class="deleteTokenError ? 'text-red-500' : ''">
                <div>{{ token.name }}</div>
                <div v-if="token.lastUsed">{{ timestampToDate(token.lastUsed) }}</div>
                <div v-else>{{ t("developer_tokenNeverUsed") }}</div>
            </div>
            <TrashIcon class="h-5 w-5 cursor-pointer" @click="deleteToken()" />
        </div>
        <p v-if="token.expirationDate" class="mt-4 text-xs font-semibold lg:text-sm" :class="isTokenExpired ? 'text-primary-900' : ''">
            {{ t("developer_tokenExpires", { date: timestampToDate(token.expirationDate) }) }}
        </p>
        <p v-else class="mt-4 text-xs font-semibold text-yellow-600 lg:text-sm">{{ t("developer_tokenNeverExpires") }}</p>
    </div>
</template>

<style scoped></style>
