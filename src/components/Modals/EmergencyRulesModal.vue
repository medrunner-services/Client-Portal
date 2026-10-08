<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCheckbox from "@/components/utils/GlobalCheckbox.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";

const emit = defineEmits(["confirmed", "close"]);
const { t } = useI18n();
const userStore = useUserStore();
const logicStore = useLogicStore();

const checkboxValue = ref(false);
const isConfirming = ref(false);

async function confirmRules() {
    if (checkboxValue.value) {
        try {
            isConfirming.value = true;
            await userStore.setSettings({ hideEmergencyRulesModal: true });
        }
        catch (_e) {
            return;
        }
    }

    isConfirming.value = false;
    emit("confirmed");
}
</script>

<template>
    <ModalContainer :title="t('tracking_emergencyRulesModalTitle')" @close="emit('close')">
        <div>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{
                    logicStore.isNotificationGranted
                        ? t("tracking_emergencyRulesModalDescriptionSimplified")
                        : t("tracking_emergencyRulesModalDescription")
                }}
            </p>

            <div
                class="
                    mt-8 place-content-between items-center
                    lg:flex
                "
            >
                <GlobalButton size="full" @click="confirmRules()">
                    {{ t("form_confirm") }}
                </GlobalButton>

                <GlobalCheckbox v-model="checkboxValue" class="mt-2 mr-4">
                    {{ t("tracking_emergencyRulesModalHideLater") }}
                </GlobalCheckbox>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
