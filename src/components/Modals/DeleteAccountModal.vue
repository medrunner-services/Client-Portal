<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();
const emit = defineEmits<{
    close: [];
}>();

const deletingAccount = ref(false);
const errorDeletingAccount = ref("");

async function deleteAccount(): Promise<void> {
    errorDeletingAccount.value = "";
    deletingAccount.value = true;

    try {
        await userStore.deleteAccount();
    } catch (e) {
        errorDeletingAccount.value = t("error_generic");
    } finally {
        document.body.style.overflow = "auto";
        await userStore.disconnectUser();
        await router.push("/login");
    }

    deletingAccount.value = false;
}
</script>

<template>
    <ModalContainer :title="t('user_deleteAccountModalTitle')" @close="emit('close')" v-slot="modalContainer">
        <div>
            <p class="text-gray-500 dark:text-gray-400">{{ t("user_deleteAccountModalDescription") }}</p>

            <div class="mt-8 gap-2 lg:flex">
                <GlobalButton @click="deleteAccount()" :loading="deletingAccount" size="full" :error-text="errorDeletingAccount">{{
                    t("user_deleteAccountModalConfirm")
                }}</GlobalButton>
                <GlobalButton @click="modalContainer.close()" type="secondary" size="full" class="mt-2 lg:mt-0">{{
                    t("tracking_backCancelButton")
                }}</GlobalButton>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
