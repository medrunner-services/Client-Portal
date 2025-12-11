<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";

const props = defineProps<Props>();
const emit = defineEmits(["close"]);
const { t } = useI18n();
const userStore = useUserStore();

export interface Props {
    emergencyId: string;
}

const isConfirming = ref(false);

async function confirmWarning() {
    try {
        isConfirming.value = true;
        await userStore.setSettings({ lastConfirmedWarningId: props.emergencyId });
    }
    catch (_e) {
        return;
    }

    isConfirming.value = false;
    document.body.style.overflow = "auto";
    emit("close");
}
</script>

<template>
    <ModalContainer :title="t('home_warningNoContactModalTitle')" :user-close-modal="false">
        <div>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("home_warningNoContactModalDescription") }}
            </p>

            <p
                class="
                    mt-2 text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("home_warningNoContactModalWarning") }}
            </p>

            <div
                class="
                    mt-8 gap-2
                    lg:flex
                "
            >
                <GlobalButton :loading="isConfirming" size="full" @click="confirmWarning()">
                    {{ t("form_confirm") }}
                </GlobalButton>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
