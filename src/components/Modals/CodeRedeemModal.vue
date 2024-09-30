<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/stringUtils";

const { t } = useI18n();
const userStore = useUserStore();

const emit = defineEmits(["close"]);

const inputCode = ref("");
const submittingNewCode = ref(false);
const errorRedeemingCode = ref("");
const isCodeRedeemed = ref(false);

async function redeemCode() {
    submittingNewCode.value = true;
    errorRedeemingCode.value = "";
    isCodeRedeemed.value = false;

    try {
        await userStore.redeemCode(inputCode.value);

        submittingNewCode.value = false;
        isCodeRedeemed.value = true;
    } catch (error: any) {
        submittingNewCode.value = false;

        // TODO: localization
        if (error.statusCode === 404) errorRedeemingCode.value = errorString(error.statusCode, "Code not found");
        else if (error.statusCode === 409) errorRedeemingCode.value = errorString(error.statusCode, "Code already redeemed");
        else errorRedeemingCode.value = errorString(error.statusCode);
    }
}
</script>

<template>
    <!-- TODO: localization -->
    <ModalContainer v-slot="modalContainer" :title="'Redeem a code'" @close="emit('close')">
        <div v-if="isCodeRedeemed">
            <div class="mt-12 flex flex-col items-center">
                <div>
                    <div class="h-24 w-24 rounded-full bg-green-300 p-8 shadow-md">
                        <svg
                            class="h-full w-full text-green-600"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 12"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M1 5.917 5.724 10.5 15 1.5"
                            />
                        </svg>
                    </div>
                </div>

                <p class="mt-4 text-gray-500 dark:text-gray-400">You have redeemed the code!</p>
            </div>

            <GlobalButton type="secondary" size="full" class="mt-8" @click="modalContainer.close()">
                {{ t("tracking_backCancelButton") }}</GlobalButton
            >
        </div>

        <div v-else>
            <p class="text-gray-500 dark:text-gray-400">Please enter the code you would like to redeem below.</p>

            <form @submit.prevent="redeemCode()">
                <GlobalTextInput v-model="inputCode" class="mt-4" :uppercase="true" :label="'Code'" :required="true" :placeholder="'Your code...'" />

                <div class="mt-8 gap-2 lg:flex">
                    <GlobalButton :loading="submittingNewCode" :submit="true" size="full" :error-text="errorRedeemingCode">Redeem code</GlobalButton>
                    <GlobalButton type="secondary" size="full" class="mt-2 lg:mt-0" @click="modalContainer.close()">
                        {{ t("tracking_backCancelButton") }}</GlobalButton
                    >
                </div>
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
