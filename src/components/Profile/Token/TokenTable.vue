<script setup lang="ts">
import type { ApiToken } from "@medrunner/api-client";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import CreateTokenModal from "@/components/Modals/CreateTokenModal.vue";
import TokenTableRow from "@/components/Profile/Token/TokenTableRow.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const props = defineProps<Props>();
const emit = defineEmits(["closeCreateTokenModal", "disableTokenCreation"]);
const { t } = useI18n();
const userStore = useUserStore();

export interface Props {
    displayCreateTokenModal: boolean;
}
const loadingTokens = ref(false);
const loadingTokensError = ref("");
const userTokens = ref<ApiToken[]>([]);
const parentRowsDiv = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    await getTokens();
});

async function getTokens(): Promise<void> {
    loadingTokens.value = true;
    try {
        const apiTokens = await userStore.fetchUserApiTokens();
        userTokens.value = apiTokens.sort((a, b) => (a.created > b.created ? -1 : 1));
    }
    catch (error: any) {
        loadingTokensError.value = errorString(error.statusCode);
    }
    finally {
        loadingTokens.value = false;

        if (userTokens.value.length >= 10) {
            emit("disableTokenCreation");
        }
    }
}

function deletedToken(id: string): void {
    userTokens.value = userTokens.value.filter(token => token.id !== id);
}
</script>

<template>
    <div class="w-full">
        <div
            class="
                rounded-lg shadow-md
                dark:bg-gray-800 dark:shadow-gray-900
            "
        >
            <div>
                <div
                    class="
                        w-full text-left text-sm text-gray-500
                        dark:text-gray-400
                    "
                >
                    <div
                        class="
                            grid grid-cols-12 rounded-t-lg bg-gray-50 p-3 font-Mohave font-semibold text-gray-500 uppercase
                            md:grid-cols-12
                            dark:bg-gray-700 dark:text-gray-400
                        "
                    >
                        <div class="col-span-5 col-start-2">
                            {{ t("developer_tokenListName") }}
                        </div>
                        <div class="col-span-3">
                            {{ t("developer_tokenListLastUsed") }}
                        </div>
                        <div class="col-span-3">
                            {{ t("developer_tokenListExpiration") }}
                        </div>
                    </div>
                    <div v-if="loadingTokensError" class="flex h-56 w-full items-center justify-center">
                        <GlobalErrorText :text="loadingTokensError" />
                    </div>
                    <div v-else-if="loadingTokens" class="flex h-56 w-full items-center justify-center">
                        <GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
                    </div>
                    <div v-else-if="userTokens.length > 0" ref="parentRowsDiv">
                        <TokenTableRow
                            v-for="token in userTokens"
                            :key="token.id"
                            :token="token"
                            :parent-div="parentRowsDiv"
                            @token-deleted="
                                (id) => {
                                    deletedToken(id);
                                }
                            "
                        />
                    </div>
                    <div v-else class="flex h-56 w-full items-center justify-center">
                        <p>{{ t("developer_tokenListEmpty") }}</p>
                    </div>
                </div>
            </div>
        </div>

        <CreateTokenModal v-if="props.displayCreateTokenModal" @close="emit('closeCreateTokenModal')" @token-created="getTokens()" />
    </div>
</template>

<style scoped></style>
