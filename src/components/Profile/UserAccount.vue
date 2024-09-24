<script setup lang="ts">
import { PersonType } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import DeleteAccountModal from "@/components/Modals/DeleteAccountModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/stringUtils";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t } = useI18n();
const router = useRouter();

const inputUsername = ref(userStore.user.rsiHandle);
const isEditingUsername = ref(false);
const isUpdatingUsername = ref(false);
const isLoggingOut = ref(false);
const errorUpdatingUsername = ref("");
const displayDeleteAccountModal = ref(false);

const isAccountDeletionEnabled = !!(
    import.meta.env.VITE_FEATURE_ACCOUNT_DELETION_ENABLED && import.meta.env.VITE_FEATURE_ACCOUNT_DELETION_ENABLED === "true"
);

async function updateUsername() {
    if (isEditingUsername.value) {
        isUpdatingUsername.value = true;
        errorUpdatingUsername.value = "";

        try {
            if (inputUsername.value) {
                await userStore.linkUser(inputUsername.value);
                userStore.user.rsiHandle = inputUsername.value;
            }

            isEditingUsername.value = false;
        } catch (error: any) {
            if (error.statusCode === 451) errorUpdatingUsername.value = errorString(error.statusCode, t("error_blockedUser"));
            else if (error.statusCode === 403) errorUpdatingUsername.value = errorString(error.statusCode, t("error_noIdRsiBio"));
            else if (error.statusCode === 404) errorUpdatingUsername.value = errorString(error.statusCode, t("error_unknownRsiAccount"));
            else if (error.statusCode === 409) errorUpdatingUsername.value = errorString(error.statusCode, t("error_rsiAccountLinked"));
            else errorUpdatingUsername.value = errorString(error.statusCode);
        }

        isUpdatingUsername.value = false;
    } else {
        isEditingUsername.value = true;
    }
}

async function disconnectUser(): Promise<void> {
    isLoggingOut.value = true;
    await userStore.disconnectUser();
    await router.push("/login");
}

function closeEditingUsername() {
    isEditingUsername.value = false;
    inputUsername.value = userStore.user.rsiHandle;
    errorUpdatingUsername.value = "";
}
</script>

<template>
    <div>
        <div class="flex min-h-11 items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_account") }}</h2>
            <GlobalButton size="full" icon="logout" :loading="isLoggingOut" @click="disconnectUser()">{{ t("navbar_disconnect") }}</GlobalButton>
        </div>

        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div class="w-full">
                <div class="flex w-full flex-col gap-2 lg:flex-row lg:items-end">
                    <GlobalTextInput
                        v-model="inputUsername"
                        class="flex-grow"
                        :label="t('user_RSIHandle')"
                        :disabled="!isEditingUsername"
                        :placeholder="userStore.user.rsiHandle"
                        :helper="t('user_rsiHandleHelper')"
                    />
                    <div class="lg:flex lg:items-end">
                        <GlobalButton
                            v-if="userStore.user.personType === PersonType.CLIENT"
                            size="full"
                            :icon="isEditingUsername ? undefined : 'pencil'"
                            :loading="isUpdatingUsername"
                            @click="updateUsername()"
                            >{{ isEditingUsername ? t("form_confirm") : t("form_edit") }}</GlobalButton
                        >
                        <GlobalButton
                            v-if="isEditingUsername"
                            type="secondary"
                            size="full"
                            class="mt-2 lg:ml-2 lg:mt-0"
                            @click="closeEditingUsername()"
                            >{{ t("user_cancel") }}</GlobalButton
                        >
                    </div>
                </div>
                <p v-if="errorUpdatingUsername" class="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{{ errorUpdatingUsername }}</p>
            </div>

            <div class="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:flex-row">
                <div>
                    <p class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t("user_userID") }}</p>
                    <div
                        class="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <p>{{ userStore.user.id }}</p>
                    </div>
                </div>

                <div>
                    <p class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t("user_joiningDate") }}</p>
                    <div
                        class="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <p>{{ logicStore.timestampToDate(userStore.user.created) }}</p>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex w-full">
                <GlobalButton
                    v-if="isAccountDeletionEnabled"
                    type="outline"
                    class="ml-auto w-full lg:w-fit"
                    :disabled="userStore.user.personType !== PersonType.CLIENT"
                    :title="userStore.user.personType ? t('user_deleteAccountButtonTitle') : null"
                    size="full"
                    @click="displayDeleteAccountModal = true"
                    >{{ t("user_deleteAccount") }}</GlobalButton
                >
            </div>
        </GlobalCard>

        <DeleteAccountModal v-if="displayDeleteAccountModal" @close="displayDeleteAccountModal = false" />
    </div>
</template>

<style scoped></style>
