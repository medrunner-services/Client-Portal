<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emit = defineEmits<{
    close: [];
}>();
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();
const deletingAccount = ref(false);
const errorDeletingAccount = ref("");

async function deleteAccount(): Promise<void> {
    errorDeletingAccount.value = "";
    deletingAccount.value = true;

    try {
        await userStore.deleteAccount();
    }
    catch (error: any) {
        errorDeletingAccount.value = errorString(error.statusCode);
    }
    finally {
        document.body.style.overflow = "auto";
        await userStore.disconnectUser();
        deletingAccount.value = false;
    }

    await router.push("/login");
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('user_deleteAccountModalTitle')" @close="emit('close')">
        <div>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("user_deleteAccountModalDescription") }}
            </p>

            <div
                class="
                    mt-8 gap-2
                    lg:flex
                "
            >
                <GlobalButton :loading="deletingAccount" size="full" @click="deleteAccount()">
                    {{ t("user_deleteAccountModalConfirm") }}
                </GlobalButton>
                <GlobalButton
                    type="secondary" size="full" class="
                        mt-2
                        lg:mt-0
                    " @click="modalContainer.close()"
                >
                    {{
                        t("tracking_backCancelButton")
                    }}
                </GlobalButton>
            </div>
            <GlobalErrorText v-if="errorDeletingAccount" :text="errorDeletingAccount" :icon="false" class="mt-2 text-sm font-semibold" />
        </div>
    </ModalContainer>
</template>

<style scoped></style>
