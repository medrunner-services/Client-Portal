<script setup lang="ts">
import { PersonType, TokenScope } from "@medrunner/api-client";
import Multiselect from "@vueform/multiselect";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalDateInput from "@/components/utils/GlobalDateInput.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { getTokenScopeString } from "@/utils/functions/getStringsFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { multiSelectInputDefaultClasses } from "@/utils/globalVars.ts";

const emit = defineEmits(["tokenCreated", "close"]);
const userStore = useUserStore();
const { t } = useI18n();

const inputName = ref("");
const inputDate = ref("");
const inputScopes = ref<TokenScope[]>([]);

const createdToken = ref("");
const errorCreationToken = ref("");
const submittingNewToken = ref(false);
const isCopied = ref(false);

// TODO: localization
const scopesOptions = computed(() => {
    if (userStore.user.personType === PersonType.CLIENT) {
        return [
            {
                label: "Client Scopes",
                options: [
                    { label: getTokenScopeString(TokenScope.CLIENT_READ), value: TokenScope.CLIENT_READ },
                    { label: getTokenScopeString(TokenScope.CLIENT_WRITE), value: TokenScope.CLIENT_WRITE },
                    { label: getTokenScopeString(TokenScope.CLIENT_PROFILE_READ), value: TokenScope.CLIENT_PROFILE_READ },
                    { label: getTokenScopeString(TokenScope.CLIENT_PROFILE_WRITE), value: TokenScope.CLIENT_PROFILE_WRITE },
                    { label: getTokenScopeString(TokenScope.CLIENT_ORGSETTINGS_READ), value: TokenScope.CLIENT_ORGSETTINGS_READ },
                ],
            },
        ];
    }
    else {
        return [
            {
                label: "Client Scopes",
                options: [
                    { label: getTokenScopeString(TokenScope.CLIENT_READ), value: TokenScope.CLIENT_READ },
                    { label: getTokenScopeString(TokenScope.CLIENT_WRITE), value: TokenScope.CLIENT_WRITE },
                    { label: getTokenScopeString(TokenScope.CLIENT_PROFILE_READ), value: TokenScope.CLIENT_PROFILE_READ },
                    { label: getTokenScopeString(TokenScope.CLIENT_PROFILE_WRITE), value: TokenScope.CLIENT_PROFILE_WRITE },
                    { label: getTokenScopeString(TokenScope.CLIENT_ORGSETTINGS_READ), value: TokenScope.CLIENT_ORGSETTINGS_READ },
                ],
            },
            {
                label: "Staff Scopes",
                options: [
                    { label: getTokenScopeString(TokenScope.STAFF_READ), value: TokenScope.STAFF_READ },
                    { label: getTokenScopeString(TokenScope.STAFF_WRITE), value: TokenScope.STAFF_WRITE },
                    { label: getTokenScopeString(TokenScope.STAFF_PROFILE_READ), value: TokenScope.STAFF_PROFILE_READ },
                    { label: getTokenScopeString(TokenScope.STAFF_PROFILE_WRITE), value: TokenScope.STAFF_PROFILE_WRITE },
                    { label: getTokenScopeString(TokenScope.STAFF_ORGSETTINGS_READ), value: TokenScope.STAFF_ORGSETTINGS_READ },
                ],
            },
        ];
    }
});

const getModalTitle = computed(() => {
    if (createdToken.value)
        return t("developer_tokenCreateFormTitle");
    else return t("developer_createTokenFormTitle");
});

const isInvalidTokenName = computed(() => {
    if (inputName.value) {
        return inputName.value.length > 64;
    }
    else {
        return false;
    }
});

async function copyToken() {
    await navigator.clipboard.writeText(createdToken.value);
    isCopied.value = true;
}

async function copyAndClose() {
    await navigator.clipboard.writeText(createdToken.value);

    document.body.style.overflow = "auto";
    emit("close");
}

async function createToken() {
    if (!inputName.value || isInvalidTokenName.value || inputScopes.value.length < 1) {
        return;
    }

    submittingNewToken.value = true;
    errorCreationToken.value = "";

    try {
        if (inputDate.value) {
            createdToken.value = await userStore.createApiToken(inputName.value, inputScopes.value, new Date(inputDate.value));
        }
        else {
            createdToken.value = await userStore.createApiToken(inputName.value, inputScopes.value);
        }
        submittingNewToken.value = false;
        document.body.style.overflow = "auto";
        emit("tokenCreated");
    }
    catch (error: any) {
        submittingNewToken.value = false;
        // TODO: localization
        if (error.statusCode === 422)
            errorCreationToken.value = errorString(error.statusCode, t("Maximum number of API tokens reached"));
        if (error.statusCode === 400)
            errorCreationToken.value = errorString(error.statusCode, t("Invalid scopes selected"));
        else
            errorCreationToken.value = errorString(error.statusCode);
    }
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="getModalTitle" @close="emit('close')">
        <div v-if="createdToken">
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("developer_createTokenAlertCopy") }}
            </p>

            <div class="mt-8 flex items-center">
                <GlobalTextAreaInput v-model="createdToken" :rows="3" class="grow" :disabled="true" />
                <svg
                    v-if="!isCopied"
                    class="
                        ml-4 h-6 w-6 cursor-pointer text-gray-800
                        dark:text-white
                    "
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
                    class="
                        ml-4 h-6 w-6 text-gray-800
                        dark:text-white
                    "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                >
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                </svg>
            </div>

            <GlobalButton
                type="secondary" size="full" class="
                    mt-8
                    lg:mt-8 lg:w-fit
                " @click="copyAndClose()"
            >
                {{
                    t("developer_createTokenCopyAndClose")
                }}
            </GlobalButton>
        </div>

        <div v-else>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("developer_createTokenFormSubtitle") }}
            </p>

            <form @submit.prevent="createToken()">
                <GlobalTextInput
                    v-model="inputName"
                    class="mt-4"
                    :label="t('developer_createTokenFormName')"
                    :required="true"
                    :placeholder="t('developer_createTokenFormPlaceholderName')"
                    :error="isInvalidTokenName"
                />
                <GlobalErrorText v-if="isInvalidTokenName" class="mt-1 text-sm" :icon="false" :text="t('error_tokenNameTooLong')" />

                <GlobalDateInput
                    v-model="inputDate"
                    class="mt-4"
                    :label="t('developer_createTokenFormExpirationDate')"
                    :min="new Date().toISOString().split('T')[0]"
                    :placeholder="t('developer_createTokenFormPlaceholderExpirationDate')"
                />

                <!--  TODO: localization  -->
                <div class="mt-4">
                    <label
                        class="
                            block text-sm font-medium text-gray-900
                            dark:text-white
                        "
                    >
                        {{ t("Token Scopes") }}
                    </label>

                    <Multiselect
                        v-model="inputScopes"
                        mode="tags"
                        :required="true"
                        :close-on-select="false"
                        :groups="true"
                        :options="scopesOptions"
                        :placeholder="t('Select scopes...')"
                        :classes="multiSelectInputDefaultClasses"
                        class="mt-2"
                    />
                </div>

                <div
                    class="
                        mt-8 gap-2
                        lg:flex
                    "
                >
                    <GlobalButton :loading="submittingNewToken" :disabled="isInvalidTokenName" :submit="true" size="full">
                        {{
                            t("developer_createTokenButton")
                        }}
                    </GlobalButton>
                    <GlobalButton
                        type="secondary" size="full" class="
                            mt-2
                            lg:mt-0
                        " @click="modalContainer.close()"
                    >
                        {{ t("tracking_backCancelButton") }}
                    </GlobalButton>
                </div>
                <GlobalErrorText v-if="errorCreationToken" :text="errorCreationToken" :icon="false" class="mt-2 text-sm font-semibold" />
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
