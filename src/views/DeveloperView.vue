<script setup lang="ts">
import type { ApiToken } from "@medrunner-services/api-client";
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import ApiTokenLine from "@/components/ApiTokenLine.vue";
import { useUserStore } from "@/stores/userStore";
const { t } = useI18n();

const userStore = useUserStore();

const tokens: Ref<ApiToken[]> = ref([]);
const deleteTokenError = ref(false);

onMounted(async () => {
    tokens.value = await userStore.fetchUserApiTokens();
});

async function deletedToken(id: string): Promise<void> {
    tokens.value = tokens.value.filter(token => token.id !== id);
}
</script>

<template>
    <div class="content-container">
        <h2 class="mb-5 font-Mohave text-3xl font-semibold uppercase lg:text-4xl">
            <!--  TODO: Add localization -->
            API Tokens
        </h2>
        <div v-auto-animate>
            <div class="mb-4 flex justify-between gap-4">
                <div class="grid w-full grid-cols-2 font-Mohave text-xl font-semibold text-primary-900">
                    <!--  TODO: Add localization -->
                    <div>Name</div>
                    <div>Created</div>
                </div>
                <div class="w-5"></div>
            </div>
            <ApiTokenLine
                class="mb-2 last:mb-0"
                v-for="token in tokens"
                :token="token"
                @deleted-token="deletedToken"
                @deleted-token-error="deleteTokenError = true"
            />
        </div>
        <div v-if="deleteTokenError" class="mt-2 w-full text-sm text-primary-400">{{ t("error_generic") }}</div>
    </div>
</template>

<style scoped></style>
