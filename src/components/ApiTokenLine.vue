<script setup lang="ts">
import type { ApiToken } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t, locale } = useI18n();

const emit = defineEmits(["deletedToken", "deletedTokenError"]);
const props = defineProps<{
    token: ApiToken;
}>();
const deleteTokenError = ref(false);

function timestampToDate(timestamp: string): string {
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
    <div class="flex justify-between gap-4">
        <div class="grid w-full grid-cols-2" :class="deleteTokenError ? 'text-primary-400' : ''">
            <div>{{ token.name }}</div>
            <div v-if="token.created">{{ timestampToDate(token.created) }}</div>
            <div v-if="token.expirationDate">{{ token.expirationDate }}</div>
            <div v-if="token.lastUsed">{{ token.lastUsed }}</div>
        </div>
        <img src="/icons/trash-icon.svg" alt="Delete" class="h-5 w-5 cursor-pointer" @click="deleteToken()" />
    </div>
</template>

<style scoped></style>
