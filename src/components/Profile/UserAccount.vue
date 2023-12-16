<script setup lang="ts">
import { PersonType } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { ampli } from "@/ampli";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();

const inputUsername = ref(userStore.user.rsiHandle);
const isEditingUsername = ref(false);
const isUpdatingUsername = ref(false);
const isLoggingOut = ref(false);
const errorUpdatingUsername = ref("");

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
            if (error.statusCode === 451) errorUpdatingUsername.value = t("error_blockedUser");
            else if (error.statusCode === 403) errorUpdatingUsername.value = t("error_noIdRsiBio");
            else if (error.statusCode === 404) errorUpdatingUsername.value = t("error_unknownRsiAccount");
            else if (error.statusCode === 409) errorUpdatingUsername.value = t("error_rsiAccountLinked");
            else if (error.statusCode === 429) errorUpdatingUsername.value = t("error_rateLimit");
            else errorUpdatingUsername.value = t("error_generic");
        }

        isUpdatingUsername.value = false;
    } else {
        isEditingUsername.value = true;
    }
}

async function disconnectUser(): Promise<void> {
    isLoggingOut.value = true;
    await userStore.disconnectUser();
    if (ampli.isLoaded) {
        ampli.client.setOptOut(true);
        ampli.client.flush();
    }
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
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_account") }}</h2>
        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div class="w-full">
                <div class="flex w-full flex-col gap-2 lg:flex-row lg:items-end">
                    <GlobalTextInput
                        class="flex-grow"
                        :label="t('user_RSIHandle')"
                        v-model="inputUsername"
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
                            type="secondary"
                            v-if="isEditingUsername"
                            size="full"
                            class="mt-2 lg:ml-2 lg:mt-0"
                            @click="closeEditingUsername()"
                            >Cancel</GlobalButton
                        >
                    </div>
                </div>
                <p v-if="errorUpdatingUsername" class="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{{ errorUpdatingUsername }}</p>

                <div class="w-full lg:w-fit">
                    <GlobalButton class="mt-8" size="full" icon="logout" :loading="isLoggingOut" @click="disconnectUser()">{{
                        t("navbar_disconnect")
                    }}</GlobalButton>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
