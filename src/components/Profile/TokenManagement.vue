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
        <div class="flex items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("developer_apiTokensTitle") }}</h2>
            <GlobalButton :disabled="userStore.isBlocked" icon="plus" @click="displayCreateTokenModal = true">{{
                t("developer_createTokenButton")
            }}</GlobalButton>
        </div>

        <div class="mt-4">
            <TokenTable :display-create-token-modal="displayCreateTokenModal" @close-create-token-modal="displayCreateTokenModal = false" />
        </div>
    </div>
</template>

<style scoped></style>
