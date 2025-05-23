<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalDateInput from "@/components/utils/GlobalDateInput.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emit = defineEmits(["tokenCreated", "close"]);
const userStore = useUserStore();
const { t } = useI18n();

const inputName = ref("");
const inputDate = ref("");

const createdToken = ref("");
const errorCreationToken = ref("");
const submittingNewToken = ref(false);
const isCopied = ref(false);

function copyToken() {
    navigator.clipboard.writeText(createdToken.value).then(() => {
        isCopied.value = true;
    });
}

function copyAndClose() {
    navigator.clipboard.writeText(createdToken.value).then(() => {
        document.body.style.overflow = "auto";
        emit("close");
    });
}

async function createToken() {
    submittingNewToken.value = true;
    errorCreationToken.value = "";

    try {
        if (inputDate.value) {
            createdToken.value = await userStore.createApiToken(inputName.value, new Date(inputDate.value));
        } else {
            createdToken.value = await userStore.createApiToken(inputName.value);
        }
        submittingNewToken.value = false;
        document.body.style.overflow = "auto";
        emit("tokenCreated");
    } catch (error: any) {
        submittingNewToken.value = false;

        errorCreationToken.value = errorString(error.statusCode);
    }
}

const getModalTitle = computed(() => {
    if (createdToken.value) return t("developer_tokenCreateFormTitle");
    else return t("developer_createTokenFormTitle");
});
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="getModalTitle" @close="emit('close')">
        <div v-if="createdToken">
            <p class="text-gray-500 dark:text-gray-400">{{ t("developer_createTokenAlertCopy") }}</p>

            <div class="mt-8 flex items-center">
                <GlobalTextAreaInput v-model="createdToken" :rows="3" class="flex-grow" :disabled="true" />
                <svg
                    v-if="!isCopied"
                    class="ml-4 h-6 w-6 cursor-pointer text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                    @click="copyToken()"
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

            <GlobalButton type="secondary" size="full" class="mt-8 lg:mt-8 lg:w-fit" @click="copyAndClose()">{{
                t("developer_createTokenCopyAndClose")
            }}</GlobalButton>
        </div>

        <div v-else>
            <p class="text-gray-500 dark:text-gray-400">{{ t("developer_createTokenFormSubtitle") }}</p>

            <form @submit.prevent="createToken()">
                <GlobalTextInput
                    v-model="inputName"
                    class="mt-4"
                    :label="t('developer_createTokenFormName')"
                    :required="true"
                    :placeholder="t('developer_createTokenFormPlaceholderName')"
                />
                <GlobalDateInput
                    v-model="inputDate"
                    class="mt-4"
                    :label="t('developer_createTokenFormExpirationDate')"
                    :min="new Date().toISOString().split('T')[0]"
                    :placeholder="t('developer_createTokenFormPlaceholderExpirationDate')"
                />

                <div class="mt-8 gap-2 lg:flex">
                    <GlobalButton :loading="submittingNewToken" :submit="true" size="full">{{ t("developer_createTokenButton") }}</GlobalButton>
                    <GlobalButton type="secondary" size="full" class="mt-2 lg:mt-0" @click="modalContainer.close()">
                        {{ t("tracking_backCancelButton") }}</GlobalButton
                    >
                </div>
                <GlobalErrorText v-if="errorCreationToken" :text="errorCreationToken" :icon="false" class="mt-2 text-sm font-semibold" />
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
