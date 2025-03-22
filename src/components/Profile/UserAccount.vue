<script setup lang="ts">
import { CodeType, PersonType } from "@medrunner/api-client";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import UnlinkedUserCTA from "@/components/Dashboard/UnlinkedUserCTA.vue";
import DeleteAccountModal from "@/components/Modals/DeleteAccountModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLocalizedDate from "@/components/utils/GlobalLocalizedDate.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { rsiHandleRegex } from "@/utils/globalVars.ts";

const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();

const inputUsername = ref(userStore.user.rsiHandle);
const isEditingUsername = ref(false);
const isUpdatingUsername = ref(false);
const isLoggingOut = ref(false);
const errorUpdatingUsername = ref("");
const displayDeleteAccountModal = ref(false);
const userBadges = ref<{ name: string; icon: string }[]>([]);

onMounted(() => {
    if (userStore.redeemedCodes.some((code) => code.type === CodeType.CitizenCon2954)) {
        userBadges.value.push({ name: "CitizenCon 2954", icon: "/icons/badges/CitizenCon2954.svg" });
    }
    if (userStore.user.personType === PersonType.STAFF) {
        userBadges.value.push({ name: "Medrunner", icon: "/images/medrunner-logo-square.webp" });
    }
});

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
    return;
}

function closeEditingUsername() {
    isEditingUsername.value = false;
    inputUsername.value = userStore.user.rsiHandle;
    errorUpdatingUsername.value = "";
}

const isInvalidRSIHandle = computed(() => {
    if (inputUsername.value && isEditingUsername.value) {
        const rsiHandle = inputUsername.value;
        return !rsiHandle.match(rsiHandleRegex);
    } else return false;
});
</script>

<template>
    <div>
        <div class="flex min-h-11 items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_account") }}</h2>
            <GlobalButton size="full" icon="logout" :loading="isLoggingOut" @click="disconnectUser()">{{ t("navbar_disconnect") }}</GlobalButton>
        </div>

        <UnlinkedUserCTA v-if="!userStore.user.rsiHandle" class="mt-4" />

        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div class="w-full">
                <div v-if="userStore.user.rsiHandle" class="flex w-full flex-col gap-2 lg:flex-row lg:items-end">
                    <GlobalTextInput
                        v-model="inputUsername"
                        class="flex-grow"
                        :label="t('user_RSIHandle')"
                        :disabled="!isEditingUsername"
                        :placeholder="userStore.user.rsiHandle"
                        :helper="t('user_rsiHandleHelper')"
                        :error="isInvalidRSIHandle"
                    />
                    <div class="lg:flex lg:items-end">
                        <GlobalButton
                            v-if="userStore.user.personType === PersonType.CLIENT"
                            size="full"
                            :icon="isEditingUsername ? undefined : 'pencil'"
                            :loading="isUpdatingUsername"
                            :disabled="isInvalidRSIHandle"
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
                <GlobalErrorText v-if="isInvalidRSIHandle" class="mt-1 text-sm" :icon="false" :text="t('error_invalidRsiHandle')" />

                <p v-if="errorUpdatingUsername" class="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{{ errorUpdatingUsername }}</p>
            </div>

            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:flex-row" :class="userStore.user.rsiHandle ? 'mt-4' : ''">
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
                        <GlobalLocalizedDate :date="userStore.user.created" format="toDate" />
                    </div>
                </div>
            </div>

            <div v-if="userBadges.length > 0" class="mt-4 w-full">
                <div class="w-full">
                    <p class="mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ t("user_badges") }}</p>
                    <div class="flex w-full flex-col gap-4 sm:w-fit sm:flex-row">
                        <div
                            v-for="badge in userBadges"
                            :key="badge.name"
                            class="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <img class="mr-2 h-9 w-9" :src="badge.icon" alt="Badge" />
                            <p class="font-Mohave text-lg font-semibold">{{ badge.name }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex w-full">
                <GlobalButton
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
