<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";

const { t } = useI18n();

const emit = defineEmits(["ignoreDetails", "close"]);

function ignoreDetails() {
    document.body.style.overflow = "auto";
    emit("ignoreDetails");
}
</script>

<template>
    <ModalContainer @close="emit('close')" v-slot="modalContainer">
        <div>
            <p class="text-xl font-semibold">{{ t("formDetailed_ignoreDetailsModalTitle") }}</p>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
                {{ t("formDetailed_ignoreDetailsModalSubTitle") }}
            </p>

            <div class="mt-8 gap-2 lg:flex">
                <GlobalButton @click="ignoreDetails()" size="full">{{ t("form_confirm") }}</GlobalButton>
                <GlobalButton @click="modalContainer.close()" type="secondary" size="full" class="mt-2 lg:mt-0">{{
                    t("tracking_backCancelButton")
                }}</GlobalButton>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
