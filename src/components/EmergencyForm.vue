<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");

const formSystem = ref("Stanton");
const formSubSystem = ref("");
const formSubThreatLevel = ref("");
const formRemarks = ref("");
const isFirefoxAndroid = ref(logicStore.userDevice === "android" && logicStore.userBrowser === "firefox");

async function sendNewEmergency(): Promise<void> {
    if (!formSystem.value || !formSubSystem.value || !formSubThreatLevel.value) {
        formErrorMessage.value = t("error_missingFields");
        return;
    }
    try {
        formSubmittingEmergency.value = true;

        const response = await emergencyStore.createEmergency({
            system: formSystem.value,
            subsystem: formSubSystem.value,
            threatLevel: parseInt(formSubThreatLevel.value),
            remarks: formRemarks.value,
        });

        userStore.user.activeEmergency = response.id;

        await emergencyStore.sendEmergencyMessage({
            emergencyId: response.id,
            contents: "This emergency was submitted via the __**Client Portal**__",
        });

        formSubmittingEmergency.value = false;
        formSystem.value = "Stanton";
        formSubSystem.value = "";
        formSubThreatLevel.value = "";
        formRemarks.value = "";
    } catch (error: any) {
        formSubmittingEmergency.value = false;
        if (error.statusCode === 403) formErrorMessage.value = t("error_blockedUser");
        if (error.statusCode === 429) formErrorMessage.value = t("error_rateLimit");
        else formErrorMessage.value = t("error_generic");
    }
}
</script>

<template>
    <form @submit.prevent="sendNewEmergency()">
        <div class="lg:w-full">
            <div class="lg:w-[48%]">
                <div class="flex w-full items-center">
                    <label class="text-sm font-semibold">{{ t("form_SCUsername") }}</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSCUsername')" />
                </div>
                <div class="mt-2 flex w-full">
                    <input type="text" class="input-text w-fit flex-grow" :value="userStore.user.rsiHandle" disabled />
                </div>
            </div>
        </div>

        <div class="mt-10 lg:flex lg:w-full lg:justify-between">
            <div class="lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_system") }}*</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSystem')" />
                </div>
                <div class="mt-2">
                    <select class="w-full" disabled v-model="formSystem" :required="!isFirefoxAndroid">
                        <option value="Stanton">Stanton</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_subSystem") }}*</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpSubSystem')" />
                </div>
                <div class="mt-2">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formSubSystem"
                        :required="!isFirefoxAndroid"
                        :disabled="formSubmittingEmergency"
                    >
                        <option hidden value>{{ t("form_selectAPlanet") }}</option>
                        <option value="microTech">microTech</option>
                        <option value="Hurston">Hurston</option>
                        <option value="Crusader">Crusader</option>
                        <option value="ArcCorp">ArcCorp</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="mt-5 lg:flex lg:w-full lg:justify-between">
            <div class="lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">{{ t("form_threatLevel") }}*</label>
                    <img src="/icons/info-icon.svg" alt="Info label" class="ml-2 h-4 w-4 cursor-help" :title="t('form_helpThreatLevel')" />
                </div>
                <div class="mt-2">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formSubThreatLevel"
                        :required="!isFirefoxAndroid"
                        :disabled="formSubmittingEmergency"
                    >
                        <option selected hidden value>
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
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage && !isFirefoxAndroid ? 'border-primary-400' : 'border-gray-400'"
                        rows="1"
                        v-model="formRemarks"
                        :disabled="formSubmittingEmergency"
                    />
                </div>
            </div>
        </div>

        <button
            type="submit"
            class="my-10 flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:mb-0 lg:mt-[7.3rem] lg:w-fit"
            :disabled="formSubmittingEmergency"
        >
            <svg
                v-if="formSubmittingEmergency"
                class="mx-14 my-0.5 h-5 w-5 animate-spin text-white"
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
        <p v-if="formErrorMessage" class="mt-2 w-full text-sm text-primary-400">
            {{ formErrorMessage }}
        </p>
    </form>
</template>
