<script setup lang="ts">
import type { ApiToken } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";

export interface Props {
    token: ApiToken;
}
const props = defineProps<Props>();
const emit = defineEmits(["tokenDeleted", "close"]);
const userStore = useUserStore();
const { t } = useI18n();

const deletingToken = ref(false);
const errorDeletingToken = ref("");

async function deleteToken(): Promise<void> {
    errorDeletingToken.value = "";
    deletingToken.value = true;

    try {
        await userStore.deleteApiToken(props.token.id);
        emit("tokenDeleted", props.token.id);
    } catch (e) {
        errorDeletingToken.value = t("error_generic");
    }

    deletingToken.value = false;
}
</script>

<template>
    <ModalContainer :title="t('developer_deleteTokenTitle')" @close="emit('close')" v-slot="modalContainer">
        <div>
            <p class="text-gray-500 dark:text-gray-400">
                {{ t("developer_deleteTokenSubtitle") }}
            </p>

            <div class="mt-8 gap-2 lg:flex">
                <GlobalButton @click="deleteToken()" :loading="deletingToken" size="full" :error-text="errorDeletingToken">
                    {{ t("developer_deleteTokenButton") }}</GlobalButton
                >
                <GlobalButton @click="modalContainer.close()" type="secondary" size="full" class="mt-2 lg:mt-0">{{
                    t("tracking_backCancelButton")
                }}</GlobalButton>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
