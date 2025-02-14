<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

const emit = defineEmits(["close"]);

const submittingNewCode = ref(false);
const errorRedeemingCode = ref("");
const isCodeRedeemed = ref(false);

const inputCodePart1 = ref<HTMLInputElement | undefined>(undefined);
const inputCodePart2 = ref<HTMLInputElement | undefined>(undefined);
const inputCodePart3 = ref<HTMLInputElement | undefined>(undefined);
const inputCodePart4 = ref<HTMLInputElement | undefined>(undefined);

const codeValuePart1 = ref("");
const codeValuePart2 = ref("");
const codeValuePart3 = ref("");
const codeValuePart4 = ref("");

export interface Props {
    canCloseModal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    canCloseModal: true,
});

const completeInputCode = computed(() => {
    return codeValuePart1.value + "-" + codeValuePart2.value + "-" + codeValuePart3.value + "-" + codeValuePart4.value;
});

const isCompleteCodeValid = computed(() => {
    if (completeInputCode.value.length < 19) return true;
    const checkCharacter = calculateCheckCharacter(completeInputCode.value.toUpperCase());
    return completeInputCode.value[18].toUpperCase() === checkCharacter;
});

function calculateCheckCharacter(code: string) {
    const allowedCharacters = "BCDFGHJKMPQRTVWXYZ2346789";

    const luhnSum = code
        .split("")
        .reverse()
        .slice(1)
        .map((c, i) => c.charCodeAt(0) * ((i % 2) + 1))
        .reduce((sum, value) => sum + value, 0);

    return allowedCharacters[luhnSum % allowedCharacters.length];
}

async function redeemCode() {
    submittingNewCode.value = true;
    errorRedeemingCode.value = "";
    isCodeRedeemed.value = false;

    try {
        await userStore.redeemCode(completeInputCode.value);

        submittingNewCode.value = false;
        isCodeRedeemed.value = true;
    } catch (error: any) {
        submittingNewCode.value = false;

        if (error.statusCode === 404) errorRedeemingCode.value = errorString(error.statusCode, t("error_codeNotFound"));
        else if (error.statusCode === 409) errorRedeemingCode.value = errorString(error.statusCode, t("error_codeRedeemed"));
        else errorRedeemingCode.value = errorString(error.statusCode);
    }
}

function focusNextInput(event: KeyboardEvent) {
    const currentInput = event.target as HTMLInputElement;
    let previousInput = currentInput.previousElementSibling as HTMLInputElement | null;
    let nextInput = currentInput.nextElementSibling as HTMLInputElement | null;

    while (previousInput && previousInput.tagName !== "INPUT") {
        previousInput = previousInput.previousElementSibling as HTMLInputElement | null;
    }
    while (nextInput && nextInput.tagName !== "INPUT") {
        nextInput = nextInput.nextElementSibling as HTMLInputElement | null;
    }

    if (currentInput.value.length === 0) {
        if ((event.key === "ArrowLeft" || event.key === "Backspace") && previousInput) {
            previousInput.focus();
        } else {
            return;
        }
    } else if (currentInput.value.length === 4) {
        if (nextInput) nextInput.focus();
        if (event.key === "ArrowRight" && nextInput) {
            nextInput.focus();
        }
    } else return;
}

function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    let pasteData = event.clipboardData?.getData("text") || "";
    pasteData = pasteData.replace(/[-\s]/g, "");

    const inputs = [codeValuePart1, codeValuePart2, codeValuePart3, codeValuePart4];
    const inputsField = [inputCodePart1.value, inputCodePart2.value, inputCodePart3.value, inputCodePart4.value];

    let currentIndex = 0;

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i]) {
            const input = inputs[i];

            const slice = pasteData.slice(currentIndex, currentIndex + 4);
            input.value = slice;
            currentIndex += slice.length;
        }
    }

    inputsField[Math.ceil(pasteData.length / 4) - 1]?.focus();
}

async function goToLinkPage() {
    await router.push("/login/link");
    return;
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :user-close-modal="props.canCloseModal" :title="t('profile_redeemACode')" @close="emit('close')">
        <div v-if="isCodeRedeemed">
            <div class="mb-8 mt-12 flex flex-col items-center">
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

                <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t("profile_codeRedeemed") }}</p>
            </div>

            <GlobalButton v-if="!userStore.user.rsiHandle" type="secondary" size="full" @click="modalContainer.close()">
                {{ t("login_continueAccountSetup") }}</GlobalButton
            >
        </div>

        <div v-else>
            <p class="text-gray-500 dark:text-gray-400">{{ t("profile_redeemCodeModalDescription") }}</p>

            <form @submit.prevent="redeemCode()">
                <div class="mt-8 flex items-center justify-between gap-2">
                    <input
                        ref="inputCodePart1"
                        v-model="codeValuePart1"
                        class="block w-1/5 rounded-lg border bg-gray-50 p-2 text-center font-semibold uppercase text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400 md:p-2.5"
                        :class="isCompleteCodeValid ? 'border-gray-300 dark:border-gray-600' : 'border-2 border-red-500'"
                        type="text"
                        maxlength="4"
                        minlength="4"
                        required
                        autocomplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        data-bwignore
                        @keyup="focusNextInput"
                        @paste="handlePaste"
                    />
                    <p class="text-xl font-bold">-</p>
                    <input
                        ref="inputCodePart2"
                        v-model="codeValuePart2"
                        class="block w-1/5 rounded-lg border bg-gray-50 p-2 text-center font-semibold uppercase text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400 md:p-2.5"
                        :class="isCompleteCodeValid ? 'border-gray-300 dark:border-gray-600' : 'border-2 border-red-500'"
                        type="text"
                        maxlength="4"
                        minlength="4"
                        required
                        autocomplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        data-bwignore
                        @keyup="focusNextInput"
                        @paste="handlePaste"
                    />
                    <p class="text-xl font-bold">-</p>
                    <input
                        ref="inputCodePart3"
                        v-model="codeValuePart3"
                        class="block w-1/5 rounded-lg border bg-gray-50 p-2 text-center font-semibold uppercase text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400 md:p-2.5"
                        :class="isCompleteCodeValid ? 'border-gray-300 dark:border-gray-600' : 'border-2 border-red-500'"
                        type="text"
                        maxlength="4"
                        minlength="4"
                        required
                        autocomplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        data-bwignore
                        @keyup="focusNextInput"
                        @paste="handlePaste"
                    />
                    <p class="text-xl font-bold">-</p>
                    <input
                        ref="inputCodePart4"
                        v-model="codeValuePart4"
                        class="block w-1/5 rounded-lg border bg-gray-50 p-2 text-center font-semibold uppercase text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400 md:p-2.5"
                        :class="isCompleteCodeValid ? 'border-gray-300 dark:border-gray-600' : 'border-2 border-red-500'"
                        type="text"
                        maxlength="4"
                        minlength="4"
                        required
                        autocomplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        data-bwignore
                        @keyup="focusNextInput"
                        @paste="handlePaste"
                    />
                </div>

                <p v-if="!isCompleteCodeValid" class="mt-2 text-sm font-semibold text-red-600">{{ t("error_codeInvalid") }}</p>

                <div class="mt-8 gap-2 lg:flex">
                    <GlobalButton
                        :loading="submittingNewCode"
                        :submit="true"
                        size="full"
                        :error-text="errorRedeemingCode"
                        :disabled="completeInputCode.length < 19 || !isCompleteCodeValid"
                        >{{ t("profile_redeemCode") }}</GlobalButton
                    >
                    <GlobalButton v-if="props.canCloseModal" type="secondary" size="full" class="mt-2 lg:mt-0" @click="modalContainer.close()">
                        {{ t("tracking_backCancelButton") }}</GlobalButton
                    >
                    <GlobalButton v-else-if="!userStore.user.rsiHandle" type="secondary" size="full" class="mt-2 lg:mt-0" @click="goToLinkPage()">
                        {{ t("code_skip") }}</GlobalButton
                    >
                </div>
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
