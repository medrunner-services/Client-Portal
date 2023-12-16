<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";

const { t } = useI18n();

const emit = defineEmits(["close"]);

const userAgent = navigator.userAgent;
const isCopied = ref(false);

function copyUserAgent() {
    navigator.clipboard.writeText(userAgent).then(() => {
        isCopied.value = true;
    });
}
</script>

<template>
    <ModalContainer :title="t('bugReport_title')" @close="emit('close')" v-slot="modalContainer">
        <p class="text-gray-500 dark:text-gray-400">
            {{ t("bugReport_copyUserAgent") }}
        </p>

        <div class="mt-8 flex items-center">
            <GlobalTextAreaInput :rows="3" class="flex-grow" :disabled="true" v-model="userAgent" />
            <svg
                v-if="!isCopied"
                @click="copyUserAgent()"
                class="ml-4 h-6 w-6 cursor-pointer text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
            >
                <path
                    d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"
                />
                <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z" />
            </svg>
            <svg
                v-else
                class="ml-4 h-6 w-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
            >
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
            </svg>
        </div>

        <div class="mt-8 flex flex-col items-center lg:flex-row">
            <a class="w-full lg:w-fit" href="https://youtrack.medrunner.dev/form/338413ce-0ad3-4399-a84c-1cc299fad5d8" target="_blank">
                <GlobalButton icon="link" size="full">{{ t("bugReport_goToBugForm") }}</GlobalButton>
            </a>

            <GlobalButton type="secondary" size="full" class="mt-4 w-full lg:ml-4 lg:mt-0 lg:w-fit" @click="modalContainer.close()">
                {{ t("tracking_backCancelButton") }}</GlobalButton
            >
        </div>
    </ModalContainer>
</template>

<style scoped></style>
