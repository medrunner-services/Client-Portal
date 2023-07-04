<script setup lang="ts">
import type { ApiToken } from "@medrunner-services/api-client";
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import ApiTokenLine from "@/components/ApiTokenLine.vue";
import Loader from "@/components/Loader.vue";
import Modal from "@/components/Modal.vue";
import CreateTokenModal from "@/components/Modals/CreateTokenModal.vue";
import { useUserStore } from "@/stores/userStore";
const { t } = useI18n();

const userStore = useUserStore();

const loadingTokens = ref(false);
const loadingTokensError = ref(false);
const tokens: Ref<ApiToken[]> = ref([]);
const deleteTokenError = ref(false);
const displayCreateTokenModal = ref(false);

onMounted(async () => {
    await getTokens();
});

async function getTokens(): Promise<void> {
    loadingTokens.value = true;
    try {
        const apiTokens = await userStore.fetchUserApiTokens();
        tokens.value = apiTokens.sort((a, b) => (a.created > b.created ? -1 : 1));
    } catch (e) {
        loadingTokensError.value = true;
    } finally {
        loadingTokens.value = false;
    }
}

async function deletedToken(id: string): Promise<void> {
    tokens.value = tokens.value.filter(token => token.id !== id);
}
</script>

<template>
    <div>
        <div class="content-container">
            <div class="mb-10 flex items-center justify-between">
                <h2 class="font-Mohave text-3xl font-semibold uppercase lg:text-4xl">
                    {{ t("developer_apiTokensTitle") }}
                </h2>

                <button class="h-fit bg-primary-900 px-6 py-2 font-medium text-gray-50" @click="displayCreateTokenModal = true">
                    {{ t("developer_createTokenButton") }}
                </button>
            </div>

            <Loader v-if="loadingTokens" class="flex h-80 w-full items-center justify-center" />
            <p class="text-primary-400" v-if="loadingTokensError">{{ t("error_loadingTokens") }}</p>

            <div v-auto-animate v-if="!loadingTokens">
                <div class="mb-4 flex justify-between gap-4">
                    <div class="grid w-full grid-cols-2 font-Mohave text-xl font-semibold text-primary-900">
                        <div>{{ t("developer_tokenListName") }}</div>
                        <div>{{ t("developer_tokenListLastUsed") }}</div>
                    </div>
                    <div class="w-5"></div>
                </div>
                <ApiTokenLine
                    class="mb-2 border-b border-gray-200 py-2 last:mb-0"
                    v-for="token in tokens"
                    :token="token"
                    @deleted-token="deletedToken"
                    @deleted-token-error="deleteTokenError = true"
                />
            </div>
            <div v-if="deleteTokenError" class="mt-2 w-full text-sm text-primary-400">{{ t("error_generic") }}</div>
        </div>

        <Modal
            @close-modal="displayCreateTokenModal = !displayCreateTokenModal"
            @click.self="displayCreateTokenModal = !displayCreateTokenModal"
            v-if="displayCreateTokenModal"
        >
            <CreateTokenModal @token-created="getTokens()" />
        </Modal>
    </div>
</template>

<style scoped></style>
