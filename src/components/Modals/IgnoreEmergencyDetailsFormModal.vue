<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";

const emit = defineEmits(["ignoreDetails", "close"]);

const { t } = useI18n();

function ignoreDetails() {
    document.body.style.overflow = "auto";
    emit("ignoreDetails");
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('formDetailed_ignoreDetailsModalTitle')" @close="emit('close')">
        <div>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("formDetailed_ignoreDetailsModalSubTitle") }}
            </p>

            <div
                class="
                    mt-8 gap-2
                    lg:flex
                "
            >
                <GlobalButton size="full" @click="ignoreDetails()">
                    {{ t("form_confirm") }}
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
        </div>
    </ModalContainer>
</template>

<style scoped></style>
