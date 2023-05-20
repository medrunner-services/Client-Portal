<script setup lang="ts">
import type { AxiosError } from "axios";
import type { ThreatLevel } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
import { useEmergencyStore } from "@/stores/emergencyStore";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const isUpdatingRsiHandle = ref(false);
const newRsiHandle = ref(userStore.user.rsiHandle);
const rsiHandleErrorMessage = ref("");
const rsiHandleApiUpdating = ref(false);
const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");

const formSystem = ref("Stanton");
const formSubSystem = ref("");
const formSubThreatLevel = ref("");
const formRemarks = ref("");

async function updateRsiHandle(): Promise<void> {
    if (!isUpdatingRsiHandle.value) {
        isUpdatingRsiHandle.value = true;
        return;
    }

    rsiHandleApiUpdating.value = true;
    try {
        if (newRsiHandle.value) {
            await userStore.linkUser(newRsiHandle.value);
        }

        isUpdatingRsiHandle.value = false;
        rsiHandleApiUpdating.value = false;
    } catch (error: any) {
        if (error === 451) rsiHandleErrorMessage.value = t("form_errorBlockedAccount");
        else if (error === 403) rsiHandleErrorMessage.value = t("form_errorMissingMedrunnerID");
        else if (error === 404) rsiHandleErrorMessage.value = t("form_errorUnknownRSIAccount");
        else rsiHandleErrorMessage.value = t("form_errorGeneric");

        rsiHandleApiUpdating.value = false;
    }
}

async function sendNewEmergency(): Promise<void> {
    try {
        formSubmittingEmergency.value = true;

        const response = await emergencyStore.createEmergency({
            system: formSystem.value,
            subsystem: formSubSystem.value,
            threatLevel: parseInt(formSubThreatLevel.value),
            remarks: formRemarks.value,
        });

        userStore.user.activeEmergency = response.id;

        formSubmittingEmergency.value = false;
        formSystem.value = "Stanton";
        formSubSystem.value = "";
        formSubThreatLevel.value = "";
        formRemarks.value = "";
    } catch (error: any) {
        formSubmittingEmergency.value = false;
        if (error === 403) formErrorMessage.value = t("form_errorBlockedAccount");
        else formErrorMessage.value = t("form_errorGeneric");
    }
}
</script>

<template>
    <form class="xl:w-5/6" @submit.prevent="sendNewEmergency()">
        <div class="lg:w-[48%]">
            <div class="flex items-center">
                <label class="text-sm font-semibold">{{ t("form_SCUsername") }}</label>
                <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSCUsername')" />
            </div>
            <div class="w-full flex mt-2">
                <input
                    type="text"
                    v-model="newRsiHandle"
                    :class="[rsiHandleErrorMessage ? 'input-text-error' : 'input-text', userStore.user.personType !== 0 ? 'w-full' : '']"
                    :disabled="!isUpdatingRsiHandle"
                />
                <button
                    v-if="userStore.user.personType === 0"
                    :disabled="rsiHandleApiUpdating"
                    @click.prevent="updateRsiHandle()"
                    class="border-2 border-primary-900 font-Inter flex justify-center items-center font-bold flex-grow lg:px-3 ml-3 min-w-[6rem]"
                >
                    <svg
                        v-if="rsiHandleApiUpdating"
                        class="animate-spin h-5 w-5 text-primary-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span v-else>{{ isUpdatingRsiHandle ? t("form_confirm") : t("form_edit") }}</span>
                </button>
            </div>
            <p v-if="rsiHandleErrorMessage" class="mt-2 text-primary-400 text-xs w-full">
                {{ rsiHandleErrorMessage }}
            </p>
        </div>

        <div class="mt-10 lg:flex lg:justify-between lg:w-full">
            <div class="lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_system") }}</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSystem')" />
                </div>
                <div class="mt-2">
                    <select class="w-full" disabled v-model="formSystem" required>
                        <option value="Stanton">Stanton</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_subSystem") }}</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSubSystem')" />
                </div>
                <div class="mt-2">
                    <select
                        class="w-full focus:ring-secondary-500 focus:border-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formSubSystem"
                        required
                        :disabled="formSubmittingEmergency"
                    >
                        <option disabled hidden value>{{ t("form_selectAPlanet") }}</option>
                        <option value="microTech">microTech</option>
                        <option value="Hurston">Hurston</option>
                        <option value="Crusader">Crusader</option>
                        <option value="ArcCorp">ArcCorp</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="mt-5 lg:flex lg:justify-between lg:w-full">
            <div class="lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_threatLevel") }}</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpThreatLevel')" />
                </div>
                <div class="mt-2">
                    <select
                        class="w-full focus:ring-secondary-500 focus:border-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formSubThreatLevel"
                        required
                        :disabled="formSubmittingEmergency"
                    >
                        <option selected disabled hidden value>
                            {{ t("form_assessTheThreat") }}
                        </option>
                        <option value="0">❓ {{ t("form_unknownThreat") }}</option>
                        <option value="1">🟢 {{ t("form_lowThreat") }}</option>
                        <option value="2">🟡 {{ t("form_mediumThreat") }}</option>
                        <option value="3">🔴 {{ t("form_highThreat") }}</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_remarks") }}</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpRemarks')" />
                </div>
                <div class="mt-2">
                    <textarea
                        class="w-full focus:ring-secondary-500 focus:border-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        rows="1"
                        v-model="formRemarks"
                        :disabled="formSubmittingEmergency"
                    />
                </div>
            </div>
        </div>

        <button
            type="submit"
            class="w-full lg:w-fit my-10 lg:mt-[5.5rem] lg:mb-0 bg-primary-900 text-gray-50 px-6 py-3 font-medium flex items-center justify-center"
            :disabled="formSubmittingEmergency"
        >
            <svg
                v-if="formSubmittingEmergency"
                class="animate-spin h-5 w-5 text-white mx-14 my-0.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span v-else>{{ t("form_reportEmergency") }}</span>
        </button>
        <p v-if="formErrorMessage" class="mt-2 text-primary-400 text-sm w-full">
            {{ formErrorMessage }}
        </p>
    </form>
</template>
